/**
 * scroll-world (version épurée) — vol de caméra scrubbé au scroll, vidéos qui
 * crossfadent entre elles. Dérivé de scroll-world (Higgsfield), débarrassé de
 * tout ce qui n'est pas la scène : pas de nav, pas de logo, pas de textes de
 * section, pas de dots — seulement les scènes (image → vidéo) et l'indice
 * "scroll pour entrer".
 */

export type ScrollWorldSection = {
  id: string;
  still: string;
  clip: string;
  accent?: string;
  scroll?: number;
  linger?: number;
};

export type ScrollWorldConfig = {
  hint?: string;
  diveScroll?: number;
  connScroll?: number;
  crossfade?: number;
  atmosphere?: boolean;
  sections: ScrollWorldSection[];
  connectors?: Array<string | null>;
};

type Segment = {
  kind: "dive" | "conn";
  clip: string | null;
  still: string;
  accent?: string;
  w: number;
  linger: number;
  el: HTMLDivElement;
  img: HTMLImageElement;
  video: HTMLVideoElement | null;
  hasClip: boolean;
  loading: boolean;
  ready: boolean;
  cur: number;
  target: number;
  visible: boolean;
  start: number;
  end: number;
};

export function mountScrollWorld(container: HTMLDivElement, config: ScrollWorldConfig): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const SECTIONS = config.sections || [];
  const CONNECTORS = config.connectors || [];
  const DIVE_W = config.diveScroll || 1.3;
  const CONN_W = config.connScroll || 0.9;
  const CROSSFADE = config.crossfade != null ? config.crossfade : 0.12;
  const N = SECTIONS.length;
  if (!N) return () => {};

  injectCSS();
  container.classList.add("sw-root");

  const SEGMENTS: Segment[] = [];
  SECTIONS.forEach((s, i) => {
    SEGMENTS.push(makeSegment("dive", s.clip, s.still, s.accent, s.scroll || DIVE_W, s.linger || 0));
    if (i < N - 1 && CONNECTORS[i]) {
      SEGMENTS.push(
        makeSegment("conn", CONNECTORS[i] as string, SECTIONS[i + 1].still, SECTIONS[i + 1].accent, CONN_W, 0),
      );
    }
  });
  const NSEG = SEGMENTS.length;

  function makeSegment(
    kind: "dive" | "conn",
    clip: string | null,
    still: string,
    accent: string | undefined,
    w: number,
    linger: number,
  ): Segment {
    return {
      kind, clip, still, accent, w, linger,
      el: null as unknown as HTMLDivElement,
      img: null as unknown as HTMLImageElement,
      video: null, hasClip: false, loading: false, ready: false,
      cur: 0, target: 0, visible: false, start: 0, end: 0,
    };
  }

  const sky = el("div", "sw-sky");
  if (config.atmosphere !== false) {
    sky.appendChild(el("div", "sw-sky__grad"));
    sky.appendChild(el("div", "sw-sky__glow"));
  }
  const particles = el("div", "sw-particles");
  sky.appendChild(particles);

  const stage = el("div", "sw-stage");
  const hint = el("div", "sw-hint");
  const hintText = el("span");
  hintText.textContent = config.hint || "scroll";
  hint.appendChild(hintText);
  hint.appendChild(el("i"));
  const track = el("div", "sw-track");

  [sky, stage, hint, track].forEach((n) => container.appendChild(n));

  SEGMENTS.forEach((s) => {
    const scene = el("div", "sw-scene");
    scene.style.setProperty("--sw-accent", s.accent || "");
    const img = el("img", "sw-scene__still");
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    if (s.still) img.src = s.still;
    scene.appendChild(img);
    stage.appendChild(scene);
    s.el = scene;
    s.img = img;
  });

  const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const lingerEase = (x: number, L: number) => {
    L = clamp(L);
    const c = x - 0.5;
    return (1 - L) * x + L * (4 * c * c * c + 0.5);
  };

  let vh = window.innerHeight;
  let stageX = 0;
  let totalW = 0;
  let ticking = false;
  let laidOutW = window.innerWidth;

  function layout() {
    vh = window.innerHeight;
    laidOutW = window.innerWidth;
    stageX = window.innerWidth > 860 ? 4 : 0;
    let off = 0;
    SEGMENTS.forEach((s) => { s.start = off * vh; off += s.w; s.end = off * vh; });
    totalW = off;
    track.style.height = totalW * vh + vh + "px";
    read();
  }

  function loadClip(s: Segment) {
    if (reduce || s.loading || !s.clip) return;
    s.loading = true;
    const url = s.clip;
    const attach = (src: string) => {
      const v = document.createElement("video");
      v.className = "sw-scene__video";
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.src = src;
      v.addEventListener("loadedmetadata", () => { s.ready = true; read(); });
      v.addEventListener("seeked", () => { s.el.classList.add("has-clip"); }, { once: true });
      v.addEventListener("loadeddata", () => {
        try { v.pause(); } catch { /* noop */ }
        if (userReady) primeVideo(v);
      });
      s.el.appendChild(v);
      s.video = v;
      s.hasClip = true;
    };
    fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("404"))))
      .then((blob) => attach(URL.createObjectURL(blob)))
      .catch(() => { try { attach(url); } catch { s.loading = false; } });
  }

  function read() {
    const y = window.scrollY || window.pageYOffset;
    const fade = CROSSFADE * vh;
    let ci = 0;
    for (let i = 0; i < NSEG; i++) if (y >= SEGMENTS[i].start) ci = i;

    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (y > s.start - 1.6 * vh && y < s.end + 1.6 * vh) loadClip(s);
      const local = clamp((y - s.start) / (s.end - s.start), 0, 1);
      s.target = s.linger ? lingerEase(local, s.linger) : local;
      let outside = 0;
      if (y < s.start) outside = s.start - y;
      else if (y > s.end) outside = y - s.end;
      const op = smooth(1 - outside / fade);
      s.el.style.opacity = String(op);
      s.visible = op > 0.001;
      s.el.style.zIndex = i === ci ? "120" : String(100 + Math.round(op * 10));
      if (!s.hasClip || !s.ready) {
        const sc = reduce ? 1 : 1.03 + local * 0.14;
        s.img.style.transform = `translateX(${stageX - 2}vw) scale(${sc.toFixed(3)})`;
      }
    }

    const cur = SEGMENTS[ci];
    if (cur.accent) container.style.setProperty("--sw-accent", cur.accent);
    hint.style.opacity = String(clamp(1 - y / (0.5 * vh)));
    if (particles) particles.style.transform = `translate3d(0, ${-y * 0.05}px, 0)`;
    ticking = false;
  }

  let rafId = 0;
  function raf() {
    const eps = coarse ? 0.02 : 0.008;
    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (!s.hasClip || !s.ready || !s.video) continue;
      if (s.video.seeking) continue;
      if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue;
      s.cur += (s.target - s.cur) * (reduce ? 1 : 0.18);
      const dur = s.video.duration || 1;
      const t = clamp(s.cur, 0, 0.999) * dur;
      if (Math.abs(s.video.currentTime - t) > eps) {
        try { s.video.currentTime = t; } catch { /* noop */ }
      }
    }
    rafId = requestAnimationFrame(raf);
  }

  let userReady = false;
  function primeVideo(v: HTMLVideoElement | null) {
    if (!coarse || !v) return;
    try {
      const p = v.play();
      if (p && p.then) p.then(() => { try { v.pause(); } catch { /* noop */ } }).catch(() => {});
    } catch { /* noop */ }
  }
  function onFirstGesture() {
    if (userReady) return;
    userReady = true;
    SEGMENTS.forEach((s) => primeVideo(s.video));
  }
  window.addEventListener("pointerdown", onFirstGesture, { once: true, passive: true });
  window.addEventListener("touchstart", onFirstGesture, { once: true, passive: true });

  seedParticles(particles, reduce || coarse);

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(read); }
  }
  function onResize() {
    if (coarse && window.innerWidth === laidOutW) return;
    layout();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", layout);
  window.addEventListener("load", layout);
  layout();
  rafId = requestAnimationFrame(raf);

  return function cleanup() {
    cancelAnimationFrame(rafId);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", layout);
    window.removeEventListener("load", layout);
    window.removeEventListener("pointerdown", onFirstGesture);
    window.removeEventListener("touchstart", onFirstGesture);
    SEGMENTS.forEach((s) => { if (s.video) s.video.src = ""; });
    container.innerHTML = "";
    container.classList.remove("sw-root");
  };
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
}

function seedParticles(host: HTMLDivElement, reduce: boolean) {
  if (!host || reduce) return;
  const kinds = ["dot", "dot", "ring"];
  const seeds = [7, 23, 41, 58, 71, 88, 12, 34, 52, 66, 83, 95, 18, 29, 47, 63, 77, 91, 5, 38, 55, 69, 82, 97];
  for (let k = 0; k < 20; k++) {
    const s = document.createElement("span");
    s.className = "sw-pt sw-pt--" + kinds[k % kinds.length];
    s.style.left = seeds[k % seeds.length] + "vw";
    s.style.top = ((seeds[(k * 3) % seeds.length] * 1.3) % 100) + "vh";
    s.style.setProperty("--sw-sc", (0.5 + ((seeds[(k * 5) % seeds.length] % 60) / 60) * 1.1).toFixed(2));
    const dur = 14 + (seeds[(k * 7) % seeds.length] % 22);
    s.style.animationDuration = dur + "s";
    s.style.animationDelay = -(seeds[(k * 2) % seeds.length] % dur) + "s";
    host.appendChild(s);
  }
}

function injectCSS() {
  if (document.getElementById("sw-css")) return;
  const css = `
  .sw-root{--sw-bg:#0A0A0B;--sw-ink:#F4F4F4;--sw-ink-soft:#9F9EA0;--sw-accent:#545164;color:var(--sw-ink);}
  .sw-sky{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:var(--sw-bg);}
  .sw-sky__grad{position:absolute;inset:-10%;background:linear-gradient(178deg,color-mix(in srgb,var(--sw-accent) 12%,var(--sw-bg)) 0%,var(--sw-bg) 55%,color-mix(in srgb,var(--sw-accent) 6%,var(--sw-bg)) 100%);}
  .sw-sky__glow{position:absolute;inset:0;background:radial-gradient(60% 42% at 74% 16%,color-mix(in srgb,var(--sw-accent) 22%,transparent),transparent 70%),radial-gradient(46% 34% at 50% 50%,color-mix(in srgb,#fff 45%,transparent),transparent 70%);}
  .sw-particles{position:absolute;inset:-6% -2%;will-change:transform;}
  .sw-pt{position:absolute;width:13px;height:13px;transform:scale(var(--sw-sc,1));opacity:0;animation:sw-drift linear infinite;}
  .sw-pt::before{content:"";position:absolute;inset:0;border-radius:50%;}
  .sw-pt--dot::before{background:radial-gradient(circle at 34% 30%,color-mix(in srgb,var(--sw-accent) 60%,#000),#000 82%);}
  .sw-pt--ring::before{background:transparent;border:2px solid color-mix(in srgb,var(--sw-accent) 55%,transparent);}
  @keyframes sw-drift{0%{opacity:0;transform:scale(var(--sw-sc)) translate(0,12vh) rotate(0)}12%{opacity:.5}88%{opacity:.45}100%{opacity:0;transform:scale(var(--sw-sc)) translate(4vw,-22vh) rotate(210deg)}}
  .sw-stage{position:fixed;inset:0;z-index:10;pointer-events:none;}
  .sw-scene{position:absolute;inset:0;opacity:0;overflow:hidden;will-change:opacity;}
  .sw-scene__video,.sw-scene__still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 42%;}
  .sw-scene__still{will-change:transform;} .sw-scene.has-clip .sw-scene__still{opacity:0;} .sw-scene__video{z-index:1;}
  .sw-hint{position:fixed;left:50%;bottom:26px;z-index:30;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--sw-ink-soft);transition:opacity .3s;}
  .sw-hint i{width:22px;height:34px;border-radius:12px;border:2px solid color-mix(in srgb,var(--sw-ink) 28%,transparent);position:relative;}
  .sw-hint i::after{content:"";position:absolute;left:50%;top:7px;width:4px;height:7px;border-radius:2px;background:var(--sw-accent);transform:translateX(-50%);animation:sw-wheel 1.7s ease-in-out infinite;}
  @keyframes sw-wheel{0%{opacity:0;top:6px}40%{opacity:1}100%{opacity:0;top:17px}}
  .sw-track{position:relative;z-index:1;width:100%;pointer-events:none;}
  @media (max-width:860px) and (orientation:portrait){
    .sw-scene__video,.sw-scene__still{object-position:center 44%;}
  }
  .sw-hint{bottom:calc(20px + env(safe-area-inset-bottom));}
  @media (prefers-reduced-motion:reduce){ .sw-hint i::after{animation:none;} .sw-pt{display:none;} }
  `;
  const style = document.createElement("style");
  style.id = "sw-css";
  style.textContent = "@layer sw {\n" + css + "\n}";
  document.head.appendChild(style);
}
