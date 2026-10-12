#!/usr/bin/env python3
"""EDGE32 — GitHub Pages 部署脚本

通过 GitHub API 推送（绕开 git 协议在部分网络下的抖动）：
1. main 分支：git 追踪的源码（含本次新增/修改）
2. gh-pages 分支：GH_PAGES=true 构建出的 out/ 静态产物 + .nojekyll

用法：
    GH_PAGES=true npm run build      # 先构建
    python scripts/deploy-ghpages.py # 再推送（自动推送 main + gh-pages）

Token：从环境变量 GH_TOKEN 读取（需要 repo 作用域）。
若 git 凭据存储里有 GitHub 账号，也可：
    GH_TOKEN=$(printf "host=github.com\nprotocol=https\n\n" | git credential fill | sed -n 's/^password=//p') python scripts/deploy-ghpages.py
"""
import base64
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

TOKEN = os.environ["GH_TOKEN"]
OWNER, REPO = "Gatsby666-jay", "edge32"
API = f"https://api.github.com/repos/{OWNER}/{REPO}"

AUTHOR = {
    "name": "Gatsby666-jay",
    "email": "Gatsby666-jay@users.noreply.github.com",
}
DATE = "2026-10-12T09:00:00Z"


def api(method, path, data=None):
    req = urllib.request.Request(API + path, method=method)
    req.add_header("Authorization", f"token {TOKEN}")
    req.add_header("Accept", "application/vnd.github+json")
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, body, timeout=60) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        print(f"  API {method} {path} -> {e.code}: {e.read().decode()[:200]}")
        raise


def create_blob(path):
    with open(path, "rb") as f:
        content = f.read()
    try:
        text = content.decode("utf-8")
        return api("POST", "/git/blobs", {"content": text, "encoding": "utf-8"})["sha"]
    except UnicodeDecodeError:
        b64 = base64.b64encode(content).decode()
        return api("POST", "/git/blobs", {"content": b64, "encoding": "base64"})["sha"]


def seed_main(readme_path):
    """空仓库播种：Contents API 创建首个提交，返回 (commit_sha, readme_blob_sha)"""
    with open(readme_path, "rb") as f:
        content = f.read().decode("utf-8")
    r = api("PUT", "/contents/README.md", {
        "message": "chore: init repository",
        "content": base64.b64encode(content.encode("utf-8")).decode(),
        "author": AUTHOR,
        "committer": AUTHOR,
    })
    return r["commit"]["sha"], r["content"]["sha"]


def push_branch(branch, files, message, seed=None):
    """files: [(repo_path, local_path)]；seed: (parent_sha, {path: blob_sha})"""
    entries = []
    total = len(files)
    done = 0
    parent = None
    seed_entries = {}
    if seed:
        parent, seed_entries = seed
        for p, sha in seed_entries.items():
            entries.append({"path": p, "mode": "100644", "type": "blob", "sha": sha})
    for repo_path, local_path in files:
        if repo_path in seed_entries:
            done += 1
            continue
        sha = create_blob(local_path)
        entries.append({"path": repo_path, "mode": "100644", "type": "blob", "sha": sha})
        done += 1
        if done % 20 == 0 or done == total:
            print(f"  [{branch}] blobs {done}/{total}", flush=True)

    tree = api("POST", "/git/trees", {"tree": entries})
    commit_data = {
        "message": message,
        "tree": tree["sha"],
        "author": {**AUTHOR, "date": DATE},
        "committer": {**AUTHOR, "date": DATE},
    }
    if parent:
        commit_data["parents"] = [parent]
    commit = api("POST", "/git/commits", commit_data)

    try:
        api("POST", "/git/refs", {"ref": f"refs/heads/{branch}", "sha": commit["sha"]})
    except urllib.error.HTTPError:
        api("PATCH", f"/git/refs/heads/{branch}", {"sha": commit["sha"], "force": True})
    print(f"  [{branch}] commit {commit['sha'][:8]} pushed ({len(entries)} entries)", flush=True)
    return commit["sha"]


def collect(directory):
    """递归收集文件，路径相对于 directory（修复 Windows 绝对路径问题）"""
    result = []
    base = os.path.abspath(directory)
    for root, dirs, names in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", ".next")]
        for name in names:
            local = os.path.join(root, name)
            repo_path = os.path.relpath(local, base).replace(os.sep, "/")
            result.append((repo_path, local))
    return sorted(result)


if __name__ == "__main__":
    root = r"D:\STM32_studyweb"
    os.chdir(root)
    only = sys.argv[1] if len(sys.argv) > 1 else "all"

    if only in ("all", "main"):
        # main 分支：git 追踪的文件
        # 注意：.github/workflows/* 不在 git 索引中（需 workflow scope 才能推送），
        # 本地保留该文件，需要时通过网页端添加。
        tracked = subprocess.check_output(["git", "ls-files"], text=True).splitlines()
        main_files = [(p, os.path.join(root, p.replace("/", os.sep))) for p in tracked]
        message = subprocess.check_output(
            ["git", "log", "-1", "--pretty=%s"], text=True
        ).strip() or "chore: update"
        print(f"main: {len(main_files)} files | {message[:50]}")

        # 已有 main 则直接作为父提交；空仓库才需要 Contents API 播种
        existing = None
        try:
            existing = api("GET", "/git/refs/heads/main")["object"]["sha"]
        except urllib.error.HTTPError:
            pass

        if existing:
            push_branch("main", main_files, message, seed=(existing, {}))
        else:
            seed_commit, readme_blob = seed_main(os.path.join(root, "README.md"))
            print(f"seeded: {seed_commit[:8]}")
            push_branch("main", main_files, message,
                        seed=(seed_commit, {"README.md": readme_blob}))

    if only in ("all", "gh-pages"):
        # gh-pages 分支：静态导出产物 + .nojekyll
        nojekyll = os.path.join(root, "out", ".nojekyll")
        open(nojekyll, "w").close()
        page_files = collect(os.path.join(root, "out"))
        print(f"gh-pages: {len(page_files)} files")
        push_branch("gh-pages", page_files, "deploy: static export for GitHub Pages")

    print("DONE")
