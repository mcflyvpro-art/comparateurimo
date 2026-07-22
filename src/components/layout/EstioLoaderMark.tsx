import type { HTMLAttributes } from "react";

const ASPECT = 970 / 296; // recadrage identique pour les 2 images (mêmes proportions)

/**
 * Mark du loader : deux rendus complets du logo superposés, crossfade CSS
 * entre eux (.loader-mark .grpA/.grpB dans globals.css). grpA = wordmark
 * normal (estio-wordmark.svg), grpB = sa variante (petit immeuble plein noir,
 * estio-loader-alt.png) — aucune recoloration de path, juste un fondu.
 */
export function EstioLoaderMark(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} style={{ ...props.style, position: "relative", aspectRatio: ASPECT }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/estio-wordmark.svg"
        alt="Estio"
        className="grpA"
        style={{ position: "absolute", inset: 0, height: "100%", width: "100%", display: "block" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/estio-loader-alt.png"
        alt=""
        aria-hidden
        className="grpB"
        style={{ position: "absolute", inset: 0, height: "100%", width: "100%", display: "block" }}
      />
    </div>
  );
}
