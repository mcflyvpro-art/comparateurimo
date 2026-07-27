"use client";

import { useEffect, useRef } from "react";

/**
 * LE CHAMP FOCAL — la scène d'ouverture d'Estio.
 *
 * Cinq cents points de lumière dérivent en profondeur dans le noir. Ce sont les
 * annonces : celles qu'on voit passer pendant quatre mois de recherche. Presque
 * toutes sont hors focale — larges, molles, éteintes. Seules celles qui
 * traversent le plan de netteté deviennent nettes, se resserrent et s'allument
 * à la braise.
 *
 * Le plan de netteté suit le curseur et balaye tout seul quand on ne bouge pas.
 * C'est un vrai flou de profondeur de champ, pas un filtre : le rayon du bokeh
 * croît avec la distance au plan focal, et la luminosité décroît en proportion
 * de la surface — la conservation d'énergie d'un objectif réel. C'est ce qui
 * rend l'image crédible plutôt que décorative.
 *
 * Écrit en WebGL brut : aucune dépendance ajoutée, un seul appel de dessin,
 * un seul programme. Repli propre en CSS si le contexte n'est pas disponible.
 */

const VERT = `
attribute vec4 aData;

uniform float uTime;
uniform float uFocus;
uniform vec2  uRes;
uniform vec2  uMouse;
uniform float uDpr;
uniform float uSpread;
uniform vec3  uGood;
uniform vec3  uMid;
uniform vec3  uRisk;

varying float vCoC;
varying float vHeat;
varying vec3  vColor;

void main() {
  float seed = aData.w;

  // Chaque annonce porte son verdict. La répartition est volontairement
  // optimiste — sur deux cents biens, il y a plus de « à creuser » que de
  // catastrophes, et un champ majoritairement rouge serait un contresens.
  vColor = seed < 0.46 ? uGood : (seed < 0.80 ? uMid : uRisk);

  // Dérive lente vers l'observateur, chaque point à sa propre phase.
  float z = fract(aData.z + uTime * 0.014);

  // Perspective : plus c'est loin, plus c'est comprimé vers le centre.
  float depth = mix(0.5, 2.6, z);

  vec2 p = aData.xy * uSpread;

  // Respiration : personne ne tient parfaitement immobile.
  p.x += cos(uTime * 0.21 + seed * 6.2831) * 0.035;
  p.y += sin(uTime * 0.17 + seed * 3.1415) * 0.045;

  // Parallaxe : les plans proches suivent davantage le curseur.
  p += uMouse * 0.16 * (1.35 - z);

  vec2 ndc = p / depth;
  ndc.x /= uRes.x / uRes.y;

  gl_Position = vec4(ndc, 0.0, 1.0);

  // Cercle de confusion : distance au plan de netteté.
  float coc = abs(z - uFocus);
  vCoC  = coc;
  vHeat = 1.0 - smoothstep(0.0, 0.075, coc);

  float size = mix(2.2, 54.0, smoothstep(0.0, 0.42, coc));
  gl_PointSize = size * (1.35 / depth) * uDpr;
}
`;

const FRAG = `
precision mediump float;

varying float vCoC;
varying float vHeat;
varying vec3  vColor;

uniform vec3 uAsh;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;

  float blur = smoothstep(0.0, 0.42, vCoC);

  // Net = disque franc. Flou = halo doux. Exactement un bokeh.
  float edge = mix(0.06, 0.95, blur);
  float a = 1.0 - smoothstep(1.0 - edge, 1.0, d);

  // Conservation d'énergie : plus la tache est large, plus elle est faible.
  a *= mix(1.0, 0.05, blur);

  // Hors focale, une annonce n'a pas encore de verdict : elle est cendre.
  // Elle ne prend sa couleur qu'en entrant dans le plan de netteté.
  vec3 col = mix(uAsh, vColor, vHeat);

  // Un cœur plus clair sur les points parfaitement nets — l'éclat d'un point
  // de lumière qu'un objectif vient de résoudre.
  col += vColor * (1.0 - smoothstep(0.0, 0.55, d)) * vHeat * 0.55;

  gl_FragColor = vec4(col * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function FocalField({
  count = 520,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    // Semis déterministe : le même champ à chaque chargement, donc une image de
    // marque stable, et aucun appel à Math.random au rendu.
    const data = new Float32Array(count * 4);
    let s = 0.5772;
    const rnd = () => {
      s = (s * 9301.0 + 49297.0) % 233280.0;
      return s / 233280.0;
    };
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(rnd()) * 1.15;
      const a = rnd() * Math.PI * 2;
      data[i * 4 + 0] = Math.cos(a) * r * 1.5;
      data[i * 4 + 1] = Math.sin(a) * r;
      data[i * 4 + 2] = rnd();
      data[i * 4 + 3] = rnd();
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const aData = gl.getAttribLocation(prog, "aData");
    gl.enableVertexAttribArray(aData);
    gl.vertexAttribPointer(aData, 4, gl.FLOAT, false, 0, 0);

    const u = {
      time: gl.getUniformLocation(prog, "uTime"),
      focus: gl.getUniformLocation(prog, "uFocus"),
      res: gl.getUniformLocation(prog, "uRes"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      dpr: gl.getUniformLocation(prog, "uDpr"),
      spread: gl.getUniformLocation(prog, "uSpread"),
      ash: gl.getUniformLocation(prog, "uAsh"),
      good: gl.getUniformLocation(prog, "uGood"),
      mid: gl.getUniformLocation(prog, "uMid"),
      risk: gl.getUniformLocation(prog, "uRisk"),
    };

    // Cendre hors focale, puis les trois feux du système une fois nets.
    // Mêmes valeurs que `tokens.css`, converties en 0-1.
    gl.uniform3f(u.ash, 0.26, 0.22, 0.2);
    gl.uniform3f(u.good, 0.518, 0.702, 0.58); // #84b394
    gl.uniform3f(u.mid, 0.851, 0.714, 0.471); // #d9b678
    gl.uniform3f(u.risk, 0.769, 0.439, 0.416); // #c4706a

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    let dpr = 1;
    function resize() {
      if (!canvas || !gl) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.spread, w < 720 ? 1.35 : 1.0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Le curseur pilote le plan de netteté ; sans curseur, il balaye tout seul.
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let pointerActive = 0;
    function onMove(e: PointerEvent) {
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerActive = 1;
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const start = performance.now();

    function frame(now: number) {
      if (!gl) return;
      const t = (now - start) / 1000;

      mx += (tmx - mx) * 0.045;
      my += (tmy - my) * 0.045;

      // Balayage autonome, contrarié par la position verticale du curseur.
      const sweep = 0.5 + Math.sin(t * 0.19) * 0.34;
      const aimed = 0.5 - my * 0.42;
      const focus = pointerActive ? aimed * 0.72 + sweep * 0.28 : sweep;

      gl.uniform1f(u.time, reduce ? 12.0 : t);
      gl.uniform1f(u.focus, focus);
      gl.uniform2f(u.mouse, mx, my);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
