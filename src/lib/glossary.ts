/**
 * GLOSSAIRE — source unique des termes techniques.
 *
 * Règle : aucun terme de métier n'apparaît dans l'interface sans être défini
 * ici. Les définitions sont écrites pour quelqu'un qui achète son premier bien,
 * pas pour un comptable — une phrase, un ordre de grandeur quand c'est utile,
 * et si possible ce que le chiffre change concrètement.
 *
 * Deuxième règle : quand un terme de métier a un équivalent français clair, on
 * affiche l'équivalent. « Rendement net-net » ne veut rien dire à personne ;
 * « rendement après impôt », si.
 */

export type Term = {
  /** Le libellé affiché — français clair de préférence. */
  label: string;
  /** La définition, une à trois phrases, sans jargon. */
  def: string;
  /** Réservé aux investisseurs avertis : masqué par défaut dans la fiche. */
  expert?: boolean;
};

export const GLOSSARY = {
  /* --- Rendements ------------------------------------------------------- */
  rendementBrut: {
    label: "Rendement brut",
    def: "Une année de loyer divisée par le prix total. C'est le chiffre affiché partout dans les annonces, mais il ignore les charges et l'impôt : il est toujours flatteur.",
  },
  rendementNet: {
    label: "Rendement net",
    def: "Le rendement une fois les charges retirées : copropriété, taxe foncière, gestion, vacance. Nettement plus proche de la réalité que le brut.",
  },
  rendementApresImpot: {
    label: "Rendement après impôt",
    def: "Ce qui vous reste réellement, charges ET impôt payés. C'est le seul rendement qui permette de comparer honnêtement deux biens.",
  },
  cashOnCash: {
    label: "Rendement de l'apport",
    def: "Ce que votre trésorerie annuelle rapporte, rapporté à l'argent que vous avez réellement sorti de votre poche.",
    expert: true,
  },
  tri: {
    label: "Rentabilité totale",
    def: "Le rendement annuel moyen de votre apport sur toute la durée, revente comprise. C'est l'indicateur qui permet de comparer l'immobilier à un placement financier. Les professionnels l'appellent TRI.",
    expert: true,
  },

  /* --- Trésorerie -------------------------------------------------------- */
  cashflow: {
    label: "Trésorerie mensuelle",
    def: "Ce qui entre moins ce qui sort, chaque mois. Positive, le bien se paie tout seul. Négative, vous complétez de votre poche.",
  },
  cashflowApresImpot: {
    label: "Trésorerie après impôt",
    def: "La trésorerie mensuelle une fois l'impôt sur les loyers payé. C'est le chiffre qui décide si l'opération est tenable pour votre budget.",
  },
  effortEpargne: {
    label: "Effort d'épargne",
    def: "La somme que vous sortez chaque mois pour que l'opération tienne. Zéro ou moins signifie que le bien s'autofinance.",
  },
  pointMort: {
    label: "Seuil de rentabilité",
    def: "La part du loyer nécessaire pour couvrir toutes les charges et la mensualité. À 80 %, vous pouvez perdre un cinquième du loyer sans être à découvert.",
    expert: true,
  },

  /* --- Patrimoine -------------------------------------------------------- */
  capitalRembourse: {
    label: "Capital remboursé",
    def: "La part du prêt que les loyers auront remboursée à l'horizon choisi. C'est du patrimoine constitué sans effort supplémentaire.",
    expert: true,
  },
  plusValue: {
    label: "Plus-value estimée",
    def: "Le gain à la revente si le marché évolue selon l'hypothèse retenue. C'est un scénario explicite, jamais une promesse.",
    expert: true,
  },

  /* --- Financement ------------------------------------------------------- */
  apport: {
    label: "Apport",
    def: "La part du prix que vous financez sans emprunter. Plus il est élevé, plus la mensualité baisse — mais plus votre argent est immobilisé.",
  },
  taux: {
    label: "Taux d'intérêt",
    def: "Le taux annuel de votre crédit, hors assurance. Un point de taux en plus, c'est environ 10 % de mensualité en plus sur vingt ans.",
  },
  duree: {
    label: "Durée du prêt",
    def: "Plus la durée est longue, plus la mensualité baisse et plus le coût total monte.",
  },
  pretAmortissable: {
    label: "Prêt amortissable",
    def: "Le prêt classique : chaque mensualité rembourse une part d'intérêts et une part de capital. Au début, surtout des intérêts.",
  },
  pretInFine: {
    label: "Prêt in fine",
    def: "Vous ne payez que les intérêts pendant toute la durée, puis remboursez le capital d'un seul coup à la fin. Réservé aux profils patrimoniaux.",
    expert: true,
  },
  differe: {
    label: "Différé de remboursement",
    def: "Le nombre de mois avant que le remboursement du capital ne commence. Utile quand des travaux retardent la mise en location.",
    expert: true,
  },
  fraisNotaire: {
    label: "Frais de notaire",
    def: "Environ 7 à 8 % du prix dans l'ancien, 2 à 3 % dans le neuf. Ce sont surtout des taxes ; le notaire n'en garde qu'une petite part.",
  },
  assuranceEmprunteur: {
    label: "Assurance emprunteur",
    def: "L'assurance exigée par la banque sur le crédit. Comptez 0,10 à 0,40 % du capital par an selon l'âge et l'état de santé.",
  },

  /* --- Fiscalité --------------------------------------------------------- */
  tmi: {
    label: "Votre tranche d'imposition",
    def: "Le taux auquel votre dernier euro de revenu est imposé (0, 11, 30, 41 ou 45 %). Il détermine ce que vos loyers vous coûteront en impôt.",
  },
  lmnp: {
    label: "Location meublée (LMNP)",
    def: "Louer meublé sans être professionnel. Régime souvent très avantageux : il permet d'amortir comptablement le bien, donc de réduire fortement l'impôt pendant des années.",
  },
  microFoncier: {
    label: "Micro-foncier",
    def: "Le régime simplifié de la location nue : un abattement forfaitaire de 30 % sur les loyers, sans aucun justificatif à fournir.",
  },
  regimeReel: {
    label: "Régime réel",
    def: "Vous déduisez vos charges réelles au lieu d'un abattement forfaitaire. Plus de paperasse, mais presque toujours moins d'impôt dès qu'il y a un crédit.",
  },

  /* --- Exploitation ------------------------------------------------------ */
  vacanceLocative: {
    label: "Vacance locative",
    def: "La part de l'année où le logement reste vide entre deux locataires. Comptez 5 % en zone tendue, davantage ailleurs.",
  },
  fraisGestion: {
    label: "Frais de gestion",
    def: "Ce que prend une agence pour gérer la location à votre place : 6 à 9 % du loyer. À zéro si vous gérez vous-même.",
  },
  gli: {
    label: "Assurance loyers impayés",
    def: "Elle vous rembourse si le locataire cesse de payer. Coûte 2 à 4 % du loyer, et impose des critères de solvabilité au locataire.",
  },
  pno: {
    label: "Assurance propriétaire",
    def: "L'assurance du logement lorsqu'il est loué ou vide. Obligatoire en copropriété. On l'appelle aussi PNO.",
  },
  provisionTravaux: {
    label: "Provision travaux",
    def: "Ce que vous mettez de côté chaque année pour les réparations à venir. Ignorer cette ligne est l'erreur la plus fréquente des premiers investissements.",
  },

  /* --- Le bien ----------------------------------------------------------- */
  surfaceCarrez: {
    label: "Surface habitable",
    def: "La surface officielle mesurée sous 1,80 m de hauteur, dite « loi Carrez ». C'est celle qui figure à l'acte de vente.",
  },
  dpe: {
    label: "Diagnostic énergétique",
    def: "La note énergétique du logement, de A à G. Les logements classés G puis F sont progressivement interdits à la location — c'est un risque, pas un détail.",
  },
  prixM2: {
    label: "Prix au m²",
    def: "Le prix affiché divisé par la surface. Le repère le plus rapide pour situer un bien dans son marché.",
  },

  /* --- Le marché --------------------------------------------------------- */
  prixM2Notarie: {
    label: "Prix au m² du secteur",
    def: "Le prix moyen des ventes réellement enregistrées chez le notaire aux alentours. Bien plus fiable qu'un prix affiché en vitrine.",
  },
  loyerMarche: {
    label: "Loyer du secteur",
    def: "Le loyer mensuel moyen observé pour ce type de logement dans le quartier. Sert de garde-fou face au loyer annoncé par le vendeur.",
  },
  tensionLocative: {
    label: "Tension locative",
    def: "Le rapport entre la demande et l'offre de logements à louer. Plus c'est tendu, plus vous relouez vite et moins vous négociez le loyer.",
  },
  granularite: {
    label: "Précision géographique",
    def: "Ces valeurs sont établies à l'échelle de la commune ou du quartier, jamais de l'immeuble. Deux logements d'une même rue partagent donc les mêmes chiffres de marché.",
  },
} as const satisfies Record<string, Term>;

export type TermKey = keyof typeof GLOSSARY;

export function term(key: TermKey): Term {
  return GLOSSARY[key];
}

/** Vrai si le terme relève de l'analyse avancée (masqué par défaut). */
export function isExpert(key: TermKey): boolean {
  return Boolean((GLOSSARY[key] as Term).expert);
}
