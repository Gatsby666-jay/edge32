/* ============================================================
   EDGE32 — main.js
   加载器 / 光标 / 滚动动效 / 路线渲染 / 进度追踪 / 课程 /
   资源 / 学习笔记（localStorage）
   ============================================================ */

(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = (str) => String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* ---------------------------------------------------------
     1. 加载器
  --------------------------------------------------------- */
  const loader = $('#loader');
  const loaderNum = $('#loaderNum');
  const loaderBar = $('#loaderBar');
  let progress = 0;
  const loadTimer = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 11 + 3);
    loaderNum.textContent = Math.floor(progress);
    loaderBar.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(loadTimer);
      setTimeout(() => loader.classList.add('is-done'), 220);
      setTimeout(() => loader.remove(), 1300);
    }
  }, 90);

  /* ---------------------------------------------------------
     2. 自定义光标（仅精细指针设备）
  --------------------------------------------------------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.add('has-cursor');
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    const bindHover = () => {
      $$('a, button, [data-hover], input, select, textarea').forEach((el) => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
      });
    };
    bindHover();
    window.__bindHover = bindHover;
  }

  /* ---------------------------------------------------------
     3. 平滑滚动（Lenis，CDN 失败时回退原生）
  --------------------------------------------------------- */
  if (window.Lenis && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
    window.__lenis = lenis;
  }

  /* ---------------------------------------------------------
     4. 入场动效（IntersectionObserver）
  --------------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const observeReveals = (root) => {
    $$('.rv, .line-mask', root || document).forEach((el) => {
      if (!el.classList.contains('in')) io.observe(el);
    });
  };
  observeReveals();

  /* ---------------------------------------------------------
     5. 导航：滚动态 / 进度条 / 回到顶部
  --------------------------------------------------------- */
  const nav = $('#nav');
  const navProgress = $('#navProgress');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-show', y > 700);
    const h = document.documentElement.scrollHeight - innerHeight;
    navProgress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     6. 跑马灯
  --------------------------------------------------------- */
  const marqueeWords = [
    ['STM32', true], ['CORTEX-M', false], ['HAL 库', false], ['寄存器', false],
    ['TINYML', true], ['EDGE AI', true], ['FREERTOS', false], ['CMSIS-NN', false],
    ['STM32CUBE.AI', false], ['EDGE IMPULSE', false], ['DMA', false], ['I2C / SPI', false],
    ['关键词唤醒', false], ['手势识别', false], ['低功耗', false], ['边缘推理', true]
  ];
  const trackHTML = marqueeWords.map(([w, hl]) =>
    `<span class="marquee-item${hl ? ' is-hl' : ''}">${esc(w)}<i>◆</i></span>`).join('');
  $('#marqueeTrack').innerHTML = trackHTML;
  $('#marqueeTrack2').innerHTML = trackHTML;

  /* ---------------------------------------------------------
     7. 学习路线 + 进度追踪（localStorage）
  --------------------------------------------------------- */
  const LS_ROAD = 'edge32.roadmap.v1';
  const roadState = JSON.parse(localStorage.getItem(LS_ROAD) || '{}');

  const courseById = (id) => COURSES.find((c) => c.id === id);

  const renderStages = () => {
    $('#stageList').innerHTML = STAGES.map((s) => `
      <article class="stage rv" id="${s.id}">
        <div class="stage-side">
          <div class="stage-num">${s.num}</div>
          <span class="stage-dur">${esc(s.duration)}</span>
        </div>
        <div class="stage-main">
          <h3>${esc(s.name)}<span class="en">${esc(s.en)}</span></h3>
          <p class="stage-goal"><b>阶段目标 ·</b> ${esc(s.goal)}</p>
          <ul class="stage-points">
            ${s.points.map((p, i) => {
              const key = `${s.id}:${i}`;
              const done = !!roadState[key];
              return `<li class="${done ? 'done' : ''}" data-key="${key}">
                <button class="check" data-hover aria-label="勾选要点">
                  <svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 4" fill="none" stroke="#fff" stroke-width="3.4"/></svg>
                </button>
                <span>${esc(p)}</span>
              </li>`;
            }).join('')}
          </ul>
          <div class="stage-courses">
            <span class="mono-label">课程 →</span>
            ${s.courses.map((cid) => {
              const c = courseById(cid);
              if (!c) return '';
              return `<a class="course-chip" href="${c.url}" target="_blank" rel="noopener" data-hover title="${esc(c.title)} · ${esc(c.author)}">${esc(c.title)}</a>`;
            }).join('')}
          </div>
        </div>
      </article>`).join('');

    $$('#stageList .check').forEach((btn) => {
      btn.addEventListener('click', () => {
        const li = btn.closest('li');
        const key = li.dataset.key;
        if (roadState[key]) delete roadState[key]; else roadState[key] = Date.now();
        localStorage.setItem(LS_ROAD, JSON.stringify(roadState));
        li.classList.toggle('done');
        updateRoadProgress();
      });
    });
    updateRoadProgress();
    observeReveals($('#stageList'));
    if (window.__bindHover) window.__bindHover();
  };

  const updateRoadProgress = () => {
    const total = STAGES.reduce((n, s) => n + s.points.length, 0);
    const done = Object.keys(roadState).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $('#roadBar').style.width = pct + '%';
    $('#roadPct').textContent = pct + '%';
  };

  $('#roadReset').addEventListener('click', () => {
    if (!confirm('确定要清空所有阶段的学习进度吗？此操作不可恢复。')) return;
    Object.keys(roadState).forEach((k) => delete roadState[k]);
    localStorage.setItem(LS_ROAD, JSON.stringify(roadState));
    $$('#stageList li.done').forEach((li) => li.classList.remove('done'));
    updateRoadProgress();
  });

  renderStages();

  /* ---------------------------------------------------------
     8. 课程列表 + 平台筛选
  --------------------------------------------------------- */
  const PLATFORMS = [
    { key: 'all', label: '全部 ALL' },
    { key: 'bilibili', label: 'B站' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'mooc', label: '官方 / MOOC' }
  ];
  const PLAT_CLASS = { bilibili: 'plat-bili', youtube: 'plat-yt', mooc: 'plat-mooc' };
  const PLAT_NAME = { bilibili: 'BILIBILI', youtube: 'YOUTUBE', mooc: 'OFFICIAL' };

  const renderTabs = () => {
    $('#courseTabs').innerHTML = PLATFORMS.map((p, i) =>
      `<button class="tab${i === 0 ? ' is-active' : ''}" data-p="${p.key}" data-hover>${esc(p.label)}</button>`).join('');
    $$('#courseTabs .tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('#courseTabs .tab').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        renderCourses(tab.dataset.p);
      });
    });
  };

  const renderCourses = (filter) => {
    const list = filter === 'all' ? COURSES : COURSES.filter((c) => c.platform === filter);
    $('#courseGrid').innerHTML = list.map((c, i) => `
      <article class="course-card rv" style="--d:${Math.min(i * 60, 360)}ms">
        <div class="course-top">
          <span class="${PLAT_CLASS[c.platform]}">▸ ${PLAT_NAME[c.platform]}</span>
          <span class="course-meta">${esc(c.meta)}</span>
        </div>
        <h4>${esc(c.title)}</h4>
        <p class="author">UP主 / 讲师 · <b>${esc(c.author)}</b></p>
        <p>${esc(c.desc)}</p>
        <div class="course-tags">${c.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <a class="course-link" href="${c.url}" target="_blank" rel="noopener" data-hover>
          <i>→</i> 前往观看
        </a>
      </article>`).join('');
    observeReveals($('#courseGrid'));
    if (window.__bindHover) window.__bindHover();
  };

  renderTabs();
  renderCourses('all');

  /* ---------------------------------------------------------
     9. 网盘资源（复制提取码）
  --------------------------------------------------------- */
  const renderPan = () => {
    $('#panGrid').innerHTML = PAN_RESOURCES.map((r, i) => `
      <article class="pan-card rv" style="--d:${i * 80}ms">
        <span class="pan-tag">${esc(r.tag)}</span>
        <h4>${esc(r.title)}</h4>
        <p>${esc(r.desc)}</p>
        <div class="pan-row">
          <span class="pan-url" title="${esc(r.url)}">${esc(r.url)}</span>
        </div>
        <div class="pan-row">
          <button class="pan-btn" data-hover data-copy="${esc(r.pwd)}">复制提取码 ${esc(r.pwd)}</button>
          <a class="pan-btn" href="${r.url}" target="_blank" rel="noopener" data-hover style="text-align:center">打开网盘 ↗</a>
        </div>
      </article>`).join('');
    $$('#panGrid [data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const pwd = btn.dataset.copy;
        try { await navigator.clipboard.writeText(pwd); }
        catch (e) {
          const ta = document.createElement('textarea');
          ta.value = pwd; document.body.appendChild(ta);
          ta.select(); document.execCommand('copy'); ta.remove();
        }
        const old = btn.textContent;
        btn.textContent = '已复制 ✓';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = old; btn.classList.remove('copied'); }, 1600);
      });
    });
    observeReveals($('#panGrid'));
    if (window.__bindHover) window.__bindHover();
  };
  renderPan();

  /* ---------------------------------------------------------
     10. 工具链 / 社区
  --------------------------------------------------------- */
  const renderResList = (el, list) => {
    el.innerHTML = list.map((r, i) => `
      <li class="rv" style="--d:${i * 50}ms">
        <a href="${r.url}" target="_blank" rel="noopener" data-hover>
          <span class="res-idx">${String(i + 1).padStart(2, '0')}</span>
          <span class="res-info"><b>${esc(r.name)}</b><span>${esc(r.desc)}</span></span>
          <span class="res-arrow">↗</span>
        </a>
      </li>`).join('');
    observeReveals(el);
    if (window.__bindHover) window.__bindHover();
  };
  renderResList($('#toolList'), TOOLS);
  renderResList($('#communityList'), COMMUNITY);

  /* =========================================================
     11. 学习笔记（localStorage CRUD）
  ========================================================= */
  const LS_NOTES = 'edge32.notes.v1';
  let notes = [];
  try { notes = JSON.parse(localStorage.getItem(LS_NOTES) || '[]'); } catch (e) { notes = []; }
  let noteFilter = 'all';
  let editingId = null;

  const stageName = (id) => {
    const s = STAGES.find((x) => x.id === id);
    return s ? `${s.num} · ${s.name}` : '';
  };

  const noteFilters = [{ key: 'all', label: '全部' }].concat(
    STAGES.map((s) => ({ key: s.id, label: `${s.num} ${s.name}` }))
  );

  const renderFilters = () => {
    $('#noteFilters').innerHTML = noteFilters.map((f) =>
      `<button class="tab${noteFilter === f.key ? ' is-active' : ''}" data-f="${f.key}" data-hover>${esc(f.label)}</button>`).join('');
    $$('#noteFilters .tab').forEach((tab) => {
      tab.addEventListener('click', () => { noteFilter = tab.dataset.f; renderFilters(); renderNotes(); });
    });
  };

  const renderNotes = () => {
    const grid = $('#notesGrid');
    const list = noteFilter === 'all' ? notes : notes.filter((n) => n.stage === noteFilter);
    $('#notesCount').textContent = `${notes.length} 篇笔记 · 显示 ${list.length}`;
    if (!list.length) {
      grid.innerHTML = `
        <div class="notes-empty">
          <div class="big">${notes.length ? '该阶段还没有笔记' : '还没有写过笔记'}</div>
          <p>${notes.length ? '切换到「全部」，或点击右上角新建一篇。' : '点击「+ 新建笔记」，记录今天搞懂的那个知识点。'}</p>
        </div>`;
      return;
    }
    grid.innerHTML = list.slice().sort((a, b) => b.updated - a.updated).map((n, i) => `
      <article class="note-card rv" style="--d:${Math.min(i * 50, 300)}ms" data-id="${n.id}">
        <div class="note-head">
          <h4>${esc(n.title || '未命名笔记')}</h4>
          <span class="note-stage${n.stage ? '' : ' stage-none'}">${n.stage ? esc(stageName(n.stage)) : '未分类'}</span>
        </div>
        <div class="note-body">${esc(n.content || '（空白）')}</div>
        <div class="note-foot">
          <span>${new Date(n.updated).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
          <span class="note-ops">
            <button class="note-op" data-act="edit" data-hover>编辑</button>
            <button class="note-op danger" data-act="del" data-hover>删除</button>
          </span>
        </div>
      </article>`).join('');
    $$('#notesGrid .note-op').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.note-card').dataset.id;
        if (btn.dataset.act === 'edit') openModal(id);
        else {
          const n = notes.find((x) => x.id === id);
          if (n && confirm(`确定删除笔记「${n.title || '未命名笔记'}」吗？`)) {
            notes = notes.filter((x) => x.id !== id);
            saveNotes(); renderNotes();
          }
        }
      });
    });
    observeReveals(grid);
    if (window.__bindHover) window.__bindHover();
  };

  const saveNotes = () => localStorage.setItem(LS_NOTES, JSON.stringify(notes));

  /* --- 编辑器弹窗 --- */
  const modal = $('#noteModal');
  const stageSelect = $('#noteStage');
  stageSelect.innerHTML = '<option value="">未分类</option>' +
    STAGES.map((s) => `<option value="${s.id}">${s.num} · ${esc(s.name)}</option>`).join('');

  const openModal = (id) => {
    editingId = id || null;
    const n = id ? notes.find((x) => x.id === id) : null;
    $('#modalTitle').textContent = id ? 'EDIT NOTE // 编辑笔记' : 'NEW NOTE // 新建笔记';
    $('#noteTitle').value = n ? n.title : '';
    stageSelect.value = n ? n.stage : '';
    $('#noteContent').value = n ? n.content : '';
    modal.classList.add('is-open');
    setTimeout(() => $('#noteTitle').focus(), 60);
  };
  const closeModal = () => { modal.classList.remove('is-open'); editingId = null; };

  $('#noteNew').addEventListener('click', () => openModal(null));
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  $('#modalSave').addEventListener('click', () => {
    const title = $('#noteTitle').value.trim();
    const content = $('#noteContent').value;
    const stage = stageSelect.value;
    if (!title && !content.trim()) { alert('标题和内容不能都为空。'); return; }
    if (editingId) {
      const n = notes.find((x) => x.id === editingId);
      if (n) { n.title = title; n.content = content; n.stage = stage; n.updated = Date.now(); }
    } else {
      notes.push({
        id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title, content, stage, updated: Date.now()
      });
    }
    saveNotes(); closeModal(); renderNotes();
  });

  /* --- 导出 / 导入 --- */
  const download = (filename, text, mime) => {
    const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  $('#noteExportMd').addEventListener('click', () => {
    if (!notes.length) { alert('还没有笔记可导出。'); return; }
    const date = new Date().toISOString().slice(0, 10);
    const md = notes.slice().sort((a, b) => b.updated - a.updated).map((n) =>
      `---\n# ${n.title || '未命名笔记'}\n\n> 阶段：${n.stage ? stageName(n.stage) : '未分类'} · 更新于 ${new Date(n.updated).toLocaleString('zh-CN')}\n\n${n.content || ''}\n`).join('\n---\n');
    download(`edge32-notes-${date}.md`, md);
  });

  $('#noteExportJson').addEventListener('click', () => {
    if (!notes.length) { alert('还没有笔记可导出。'); return; }
    const date = new Date().toISOString().slice(0, 10);
    download(`edge32-notes-${date}.json`, JSON.stringify({ app: 'edge32', version: 1, notes }, null, 2), 'application/json');
  });

  $('#noteImportBtn').addEventListener('click', () => $('#noteImportFile').click());
  $('#noteImportFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const arr = Array.isArray(data) ? data : data.notes;
        if (!Array.isArray(arr)) throw new Error('bad format');
        let added = 0;
        arr.forEach((n) => {
          if (n && typeof n === 'object' && (n.title || n.content)) {
            notes.push({
              id: n.id || ('n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
              title: String(n.title || ''), content: String(n.content || ''),
              stage: STAGES.some((s) => s.id === n.stage) ? n.stage : '',
              updated: Number(n.updated) || Date.now()
            });
            added++;
          }
        });
        saveNotes(); renderNotes();
        alert(`成功导入 ${added} 篇笔记。`);
      } catch (err) {
        alert('导入失败：文件不是有效的笔记 JSON。');
      }
      e.target.value = '';
    };
    reader.readAsText(file, 'utf-8');
  });

  renderFilters();
  renderNotes();

  /* ---------------------------------------------------------
     12. 锚点平滑滚动（兼容无 Lenis 环境）
  --------------------------------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const t = id ? document.getElementById(id) : null;
      if (!t) return;
      e.preventDefault();
      if (window.__lenis) window.__lenis.scrollTo(t, { offset: -70 });
      else scrollTo({ top: t.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' });
    });
  });

})();
