const PS_DEFAULT_PCT = 17.2;
const IS_DEFAULT_PCT = 25;

export type TaxRegime = "nu_micro" | "nu_reel" | "lmnp_micro" | "lmnp_reel" | "sci_ir" | "sci_is";

/** Entrées communes aux 6 régimes — mêmes chiffres, seule la règle de calcul
 *  du revenu imposable change d'un régime à l'autre. Formules provisoires. */
export type TaxInput = {
  annualRent: number;
  annualCharges: number;
  annualInterest: number;
  annualAmortissement: number;
  tmiPct: number;
  psPct?: number;
  isPct?: number;
};

export type TaxResult = {
  regime: TaxRegime;
  label: string;
  taxableIncome: number;
  annualTax: number;
};

const REGIME_LABELS: Record<TaxRegime, string> = {
  nu_micro: "Location nue — micro-foncier",
  nu_reel: "Location nue — réel",
  lmnp_micro: "LMNP — micro-BIC",
  lmnp_reel: "LMNP — réel",
  sci_ir: "SCI à l'IR",
  sci_is: "SCI à l'IS",
};

export function computeTaxNuMicro(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(0, input.annualRent * 0.7); // abattement forfaitaire 30 %
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "nu_micro", label: REGIME_LABELS.nu_micro, taxableIncome, annualTax };
}

export function computeTaxNuReel(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(0, input.annualRent - input.annualCharges - input.annualInterest);
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "nu_reel", label: REGIME_LABELS.nu_reel, taxableIncome, annualTax };
}

export function computeTaxLmnpMicro(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(0, input.annualRent * 0.5); // abattement forfaitaire 50 %
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "lmnp_micro", label: REGIME_LABELS.lmnp_micro, taxableIncome, annualTax };
}

export function computeTaxLmnpReel(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(
    0,
    input.annualRent - input.annualCharges - input.annualInterest - input.annualAmortissement,
  );
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "lmnp_reel", label: REGIME_LABELS.lmnp_reel, taxableIncome, annualTax };
}

export function computeTaxSciIr(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(0, input.annualRent - input.annualCharges - input.annualInterest);
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "sci_ir", label: REGIME_LABELS.sci_ir, taxableIncome, annualTax };
}

export function computeTaxSciIs(input: TaxInput): TaxResult {
  const isPct = input.isPct ?? IS_DEFAULT_PCT;
  const taxableIncome = Math.max(
    0,
    input.annualRent - input.annualCharges - input.annualInterest - input.annualAmortissement,
  );
  const annualTax = taxableIncome * (isPct / 100);
  return { regime: "sci_is", label: REGIME_LABELS.sci_is, taxableIncome, annualTax };
}

/** Les 6 régimes calculés à paramètres égaux, triés du plus favorable
 *  (impôt le plus faible) au moins favorable — pour le tableau comparateur. */
export function compareTaxRegimes(input: TaxInput): TaxResult[] {
  return [
    computeTaxNuMicro(input),
    computeTaxNuReel(input),
    computeTaxLmnpMicro(input),
    computeTaxLmnpReel(input),
    computeTaxSciIr(input),
    computeTaxSciIs(input),
  ].sort((a, b) => a.annualTax - b.annualTax);
}
