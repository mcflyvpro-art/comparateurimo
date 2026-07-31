"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_FOCAL } from "@/design/tokens";
import { cx } from "@/lib/cx";

/**
 * LE RETOUR D'ACTION.
 *
 * Trois règles, et elles expliquent chaque choix de ce fichier :
 *
 *   1. Une action réussie doit se voir. Sans quoi l'utilisateur reclique,
 *      doute, ou croit que rien ne s'est passé.
 *   2. Une action destructive doit être annulable. On préfère « c'est fait,
 *      annuler ? » à « êtes-vous sûr ? » : le premier ne coûte rien quand on
 *      a raison, le second taxe tous les cas où l'on avait raison.
 *   3. Le bandeau expire, pas le droit. Cinq secondes suffisent à voir la
 *      bannière ; le doute, lui, arrive souvent après.
 *
 * L'annonce passe par `aria-live="polite"` : elle ne vole jamais le focus.
 */

export type ToastTone = "neutre" | "succes" | "erreur";

type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
  /** Libellé de l'action d'annulation. Absent = pas d'annulation. */
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  duree: number;
};

type ToastInput = Omit<Toast, "id" | "duree"> & { duree?: number };

const ToastContext = createContext<{
  pousser: (t: ToastInput) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé sous <ToastProvider>.");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const compteur = useRef(0);

  const retirer = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const pousser = useCallback((t: ToastInput) => {
    const id = ++compteur.current;
    // Une bannière annulable reste plus longtemps : on doit avoir le temps de lire,
    // de comprendre, puis de décider.
    const duree = t.duree ?? (t.actionLabel ? 7000 : 4000);
    setToasts((cur) => [...cur.slice(-2), { ...t, id, duree }]);
  }, []);

  const valeur = useMemo(() => ({ pousser }), [pousser]);

  return (
    <ToastContext.Provider value={valeur}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <Banniere key={t.id} toast={t} onFermer={() => retirer(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function Banniere({ toast, onFermer }: { toast: Toast; onFermer: () => void }) {
  const reduce = useReducedMotion();
  const [agi, setAgi] = useState(false);

  useEffect(() => {
    const t = setTimeout(onFermer, toast.duree);
    return () => clearTimeout(t);
  }, [toast.duree, onFermer]);

  const teinte =
    toast.tone === "succes"
      ? "border-l-[var(--good)]"
      : toast.tone === "erreur"
        ? "border-l-[var(--risk)]"
        : "border-l-hairline-3";

  return (
    <motion.div
      layout
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
      transition={{ duration: 0.22, ease: EASE_FOCAL }}
      className={cx(
        "pointer-events-auto flex max-w-[min(30rem,calc(100vw-2rem))] items-center gap-4",
        "rounded-md border border-hairline-2 border-l-2 bg-surface-high px-4 py-3",
        "shadow-[var(--lift-3)]",
        teinte,
      )}
    >
      <p className="min-w-0 text-[13px] leading-snug text-text-2">{toast.message}</p>

      {toast.actionLabel && !agi && (
        <button
          type="button"
          onClick={async () => {
            setAgi(true);
            await toast.onAction?.();
            onFermer();
          }}
          className="shrink-0 rounded-sm px-1 text-[13px] font-medium text-brand transition-colors hover:text-brand-hot focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {toast.actionLabel}
        </button>
      )}
    </motion.div>
  );
}
