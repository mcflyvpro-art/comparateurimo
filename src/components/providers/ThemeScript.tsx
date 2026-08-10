/**
 * Le thème doit être posé sur <html> AVANT la première peinture, sinon la page
 * s'affiche en clair puis bascule — un clignotement blanc d'autant plus visible
 * qu'on vient d'une page sombre. Un composant client ne peut pas le faire : il
 * s'exécute après l'hydratation. D'où ce script inline, synchrone, dans <head>.
 *
 * Il duplique volontairement la logique de `lib/theme.ts` : ce code doit tenir
 * en une chaîne de caractères, sans import ni compilation.
 */
const SCRIPT = `(function(){try{
var t=localStorage.getItem("estio.theme")||"light";
var r=t==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;
var d=localStorage.getItem("estio.density")||"confortable";
var e=document.documentElement;
e.dataset.theme=r;e.dataset.density=d;
}catch(_){document.documentElement.dataset.theme="light";}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
