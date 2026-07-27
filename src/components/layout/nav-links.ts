// Source unique de la navigation publique (menu plein écran + pied de page).

export const primaryNav = [
  { href: "/comment-ca-marche", label: "Le produit", sub: "Comment ça marche" },
  { href: "/tarifs", label: "Formules", sub: "Free · Pro · Expert" },
  { href: "/faq", label: "Questions", sub: "Ce qu'on nous demande" },
] as const;

export const secondaryNav = {
  entreprise: [
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ],
  compte: [
    { href: "/connexion", label: "Se connecter" },
    { href: "/inscription", label: "Créer un compte" },
  ],
  legal: [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/confidentialite", label: "Confidentialité" },
    { href: "/cgu", label: "CGU" },
  ],
} as const;

export const footerGroups = [
  { title: "Produit", links: primaryNav.map((l) => ({ href: l.href, label: l.label })) },
  { title: "Entreprise", links: secondaryNav.entreprise },
  { title: "Compte", links: secondaryNav.compte },
  { title: "Légal", links: secondaryNav.legal },
] as const;
