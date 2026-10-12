"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   LiquidBg — 鼠标交互液态背景（原生 WebGL，零依赖）
   ------------------------------------------------------------
   灵感：prime.whut.club 首屏（reactbits LiquidEther，Three.js 流体模拟）
   本实现以原生 WebGL 复刻同款观感，成本仅为其零头：
   - 拖尾通道：512² ping-pong FBO，鼠标速度注入衰减场（RGBA8，无需浮点扩展）
   - 显示通道：单次全屏绘制 —— 域扭曲 FBM 液态噪声 + 拖尾梯度扭曲
     + 光标光晕 + 扩散涟漪 + 暗角
   性能策略：
   - DPR 上限 1.25，帧时间 EMA 超标时自动降渲染尺度（最低 0.55）
   - 首屏离开视口 → 停 rAF 并淡出；document.hidden → 暂停
   - 无指针输入 2.6s → 缓慢自动漂移（移动端也有效果）
   - prefers-reduced-motion → 只渲染一帧静态画面
   - 无 WebGL → body.no-liquid，回退 CSS 径向渐变（.hero-glow）
   ============================================================ */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/* 拖尾/速度场：R = 强度（衰减 + 鼠标溅射），GB = 平滑速度方向 */
const TRAIL_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev;
uniform vec2 uMouse;
uniform vec2 uVelDir;
uniform float uVel;
uniform float uDecay;
uniform float uAspect;
void main() {
  vec4 prev = texture2D(uPrev, vUv);
  vec2 d = (vUv - uMouse) * vec2(uAspect, 1.0);
  float r = 0.05 + uVel * 0.04;
  float splat = exp(-dot(d, d) / (r * r));
  float intensity = max(prev.r * uDecay, splat * (0.16 + uVel * 0.84));
  vec2 dir = mix(prev.gb, uVelDir, 0.3);
  gl_FragColor = vec4(clamp(intensity, 0.0, 1.0), dir, 1.0);
}`;

/* 显示：域扭曲 FBM + 拖尾扭曲 + 光晕 + 涟漪 + 暗角 */
const DISPLAY_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTrail;
uniform vec2 uMouse;
uniform float uTime;
uniform float uAspect;
uniform float uVel;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0 + 100.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float texel = 1.0 / 512.0;

  vec4 t = texture2D(uTrail, uv);
  float tr = texture2D(uTrail, uv + vec2(texel, 0.0)).r;
  float tl = texture2D(uTrail, uv - vec2(texel, 0.0)).r;
  float tu = texture2D(uTrail, uv + vec2(0.0, texel)).r;
  float td = texture2D(uTrail, uv - vec2(0.0, texel)).r;
  vec2 grad = vec2(tr - tl, tu - td);

  /* 随时间流动的域扭曲噪声（液态基底） */
  vec2 p = uv * vec2(uAspect, 1.0) * 2.6;
  float flow = uTime * 0.045;
  vec2 q = vec2(fbm(p + flow), fbm(p + vec2(4.7, 2.3) - flow));
  vec2 r2 = vec2(fbm(p + 2.4 * q + vec2(1.7, 9.2) + flow * 1.3),
                 fbm(p + 2.4 * q + vec2(8.3, 2.8) - flow * 1.1));
  float f = fbm(p + 2.0 * r2);

  /* 光标搅动扭曲 */
  vec2 warp = grad * 0.5 + t.gb * 0.05 * t.r;
  vec2 wuv = uv + warp;

  vec3 col = vec3(0.039, 0.039, 0.043);                              // #0a0a0a
  col = mix(col, vec3(0.14, 0.03, 0.06), smoothstep(0.42, 0.95, f) * 0.5);
  col += vec3(0.933, 0.204, 0.290) * pow(f, 2.5) * 0.085;            // #ee344a 红丝

  vec2 md = (wuv - uMouse) * vec2(uAspect, 1.0);
  float d = length(md);
  col += vec3(0.933, 0.204, 0.290) * exp(-d * d * 5.5) * (0.10 + t.r * 0.5 + uVel * 0.25);
  col += vec3(1.0) * exp(-d * d * 16.0) * t.r * 0.16;                // 白热核心

  float ring = sin(d * 42.0 - uTime * 2.6) * 0.5 + 0.5;              // 扩散涟漪
  col += vec3(0.933, 0.204, 0.290) * ring * t.r * 0.12 * smoothstep(0.55, 0.0, d);

  float vig = smoothstep(1.3, 0.4, length((uv - 0.5) * vec2(uAspect, 1.0)));
  col *= mix(0.7, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}`;

const SIM_SIZE = 512;
const DPR_CAP = 1.25;
const MAX_PIXELS = 2.6e6;

export default function LiquidBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = (canvas.getContext("webgl2", {
      alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "high-performance",
    }) || canvas.getContext("webgl", {
      alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "high-performance",
    })) as WebGLRenderingContext | null;

    if (!gl) {
      document.body.classList.add("no-liquid"); // 回退 CSS 渐变
      return;
    }

    /* ---------- 编译 ---------- */
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("[LiquidBg] shader error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const link = (fragSrc: string) => {
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
      if (!vs || !fs) return null;
      const p = gl.createProgram();
      if (!p) return null;
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.warn("[LiquidBg] link error:", gl.getProgramInfoLog(p));
        return null;
      }
      return p;
    };

    const trailProg = link(TRAIL_FRAG);
    const displayProg = link(DISPLAY_FRAG);
    if (!trailProg || !displayProg) {
      document.body.classList.add("no-liquid");
      return;
    }

    /* ---------- 全屏四边形 ---------- */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    // 注意：用一个大三角形覆盖屏幕（比两个三角形更省）

    const bindQuad = (prog: WebGLProgram) => {
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };

    /* ---------- ping-pong FBO ---------- */
    const makeTarget = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM_SIZE, SIM_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { tex, fbo };
    };
    let a = makeTarget();
    let b = makeTarget();
    // 初始化为黑色
    [a, b].forEach((tgt) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, tgt.fbo);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const U = (prog: WebGLProgram, name: string) => gl.getUniformLocation(prog, name);

    /* ---------- 状态 ---------- */
    let mx = 0.5, my = 0.5;        // 平滑后的鼠标
    let tx = 0.5, ty = 0.5;        // 目标鼠标
    let vel = 0, vdx = 0, vdy = 0; // 平滑速度与方向
    let lastInput = -1e4;
    let simTime = 0;
    let raf = 0;
    let lastT = 0;
    let active = true;             // 首屏可见
    let hidden = false;
    let scale = 1;
    let frameEMA = 16;

    const onPointer = (e: PointerEvent) => {
      tx = e.clientX / innerWidth;
      ty = 1 - e.clientY / innerHeight;
      lastInput = performance.now();
    };
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("pointerdown", onPointer, { passive: true });

    /* ---------- 尺寸 ---------- */
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, DPR_CAP) * scale;
      const w = Math.max(1, Math.round(innerWidth * dpr));
      const h = Math.max(1, Math.round(innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    addEventListener("resize", onResize);

    /* ---------- 可见性 ---------- */
    const heroEl = document.getElementById("hero");
    const io = heroEl
      ? new IntersectionObserver(
          (entries) => {
            const vis = entries[0].isIntersecting;
            active = vis;
            canvas.classList.toggle("is-active", vis && !reduced);
            canvas.style.opacity = vis ? "1" : "0";
          },
          { threshold: 0.05 }
        )
      : null;
    if (heroEl && io) io.observe(heroEl);

    const onVisibility = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* ---------- 上下文丢失 ---------- */
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    /* ---------- 渲染帧 ---------- */
    const renderFrame = (t: number, dt: number) => {
      const now = performance.now();

      // 无输入自动漂移
      if (now - lastInput > 2600) {
        tx = 0.5 + 0.3 * Math.sin(t * 0.00013);
        ty = 0.5 + 0.26 * Math.cos(t * 0.00017);
      }

      // 鼠标平滑 + 速度
      const dx = tx - mx, dy = ty - my;
      const dist = Math.hypot(dx, dy);
      mx += dx * 0.12;
      my += dy * 0.12;
      vel += (Math.min(dist * 14, 1) - vel) * 0.15;
      if (dist > 0.0001) {
        vdx += (dx / dist - vdx) * 0.2;
        vdy += (dy / dist - vdy) * 0.2;
      }

      const aspect = innerWidth / Math.max(1, innerHeight);
      const decay = Math.pow(0.94, Math.min(dt, 66) * 0.06); // 帧率无关衰减

      // 1) 拖尾通道
      gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbo);
      gl.viewport(0, 0, SIM_SIZE, SIM_SIZE);
      gl.useProgram(trailProg);
      bindQuad(trailProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, a.tex);
      gl.uniform1i(U(trailProg, "uPrev"), 0);
      gl.uniform2f(U(trailProg, "uMouse"), mx, my);
      gl.uniform2f(U(trailProg, "uVelDir"), vdx, vdy);
      gl.uniform1f(U(trailProg, "uVel"), vel);
      gl.uniform1f(U(trailProg, "uDecay"), decay);
      gl.uniform1f(U(trailProg, "uAspect"), aspect);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // 交换
      const tmp = a; a = b; b = tmp;

      // 2) 显示通道
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(displayProg);
      bindQuad(displayProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, a.tex);
      gl.uniform1i(U(displayProg, "uTrail"), 0);
      gl.uniform2f(U(displayProg, "uMouse"), mx, my);
      gl.uniform1f(U(displayProg, "uTime"), simTime);
      gl.uniform1f(U(displayProg, "uAspect"), aspect);
      gl.uniform1f(U(displayProg, "uVel"), vel);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    /* ---------- 主循环（含自适应降档） ---------- */
    let slowFrames = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (hidden || !active) return;
      const dt = lastT ? Math.min(t - lastT, 100) : 16.7;
      lastT = t;
      simTime += dt * 0.001;

      const t0 = performance.now();
      renderFrame(t, dt);
      const cost = performance.now() - t0;

      frameEMA += (cost - frameEMA) * 0.05;
      if (cost > 23) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 90 && scale > 0.56) {
        scale = Math.max(0.55, scale - 0.15);
        resize();
        slowFrames = 0;
        frameEMA = 16;
      }
    };

    if (reduced) {
      // 静态一帧
      simTime = 8;
      renderFrame(0, 16.7);
      canvas.classList.add("is-active");
    } else {
      canvas.classList.add("is-active");
      raf = requestAnimationFrame(loop);
    }
    document.body.classList.add("has-liquid");

    /* ---------- 清理 ---------- */
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      removeEventListener("pointermove", onPointer);
      removeEventListener("pointerdown", onPointer);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (io) io.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteTexture(a.tex);
      gl.deleteFramebuffer(a.fbo);
      gl.deleteTexture(b.tex);
      gl.deleteFramebuffer(b.fbo);
      gl.deleteProgram(trailProg);
      gl.deleteProgram(displayProg);
      document.body.classList.remove("has-liquid", "no-liquid");
    };
  }, []);

  return <canvas ref={canvasRef} className="liquid-canvas" aria-hidden />;
}
