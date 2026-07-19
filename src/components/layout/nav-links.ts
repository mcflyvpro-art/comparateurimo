// Liens de navigation partagés (header + footer). Source unique.
export const navLinks = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "FAQ" },
  { href: "/a-propos", label: "À propos" },
] as const;

export const footerGroups = [
  {
    title: "Produit",
    links: [
      { href: "/comment-ca-marche", label: "Comment ça marche" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
    ],
  },
] as const;
