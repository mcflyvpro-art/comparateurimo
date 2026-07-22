export type AmortizationRow = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
};

export type AnnualAmortizationRow = {
  year: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
};

/** Mensualité d'un prêt amortissable classique. Retourne 0 si les entrées
 *  sont invalides (jamais NaN/Infinity). */
export function computeMonthlyPayment(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/** Tableau d'amortissement MENSUEL complet (prêt amortissable), avec un
 *  différé partiel optionnel (intérêts seuls pendant `deferralMonths`).
 *  L'UI (Task 10) regroupe ces lignes par 12 pour la vue annuelle — un seul
 *  calcul sous-jacent, jamais deux logiques. */
export function computeAmortizationSchedule(
  principal: number,
  annualRatePct: number,
  months: number,
  deferralMonths = 0,
): AmortizationRow[] {
  if (principal <= 0 || months <= 0) return [];
  const monthlyRate = annualRatePct / 100 / 12;
  const rows: AmortizationRow[] = [];
  let balance = principal;

  const deferral = Math.min(Math.max(deferralMonths, 0), months - 1);
  for (let m = 1; m <= deferral; m++) {
    const interest = balance * monthlyRate;
    rows.push({ month: m, payment: interest, interest, principal: 0, remainingBalance: balance });
  }

  const remainingMonths = months - deferral;
  const payment = computeMonthlyPayment(balance, annualRatePct, remainingMonths);
  for (let m = deferral + 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(payment - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    rows.push({ month: m, payment, interest, principal: principalPaid, remainingBalance: balance });
  }
  return rows;
}

/** Tableau d'amortissement d'un prêt in fine : intérêts seuls chaque mois,
 *  capital remboursé en une fois au dernier mois. */
export function computeInFineSchedule(principal: number, annualRatePct: number, months: number): AmortizationRow[] {
  if (principal <= 0 || months <= 0) return [];
  const monthlyRate = annualRatePct / 100 / 12;
  const rows: AmortizationRow[] = [];
  for (let m = 1; m < months; m++) {
    const interest = principal * monthlyRate;
    rows.push({ month: m, payment: interest, interest, principal: 0, remainingBalance: principal });
  }
  const lastInterest = principal * monthlyRate;
  rows.push({
    month: months,
    payment: lastInterest + principal,
    interest: lastInterest,
    principal,
    remainingBalance: 0,
  });
  return rows;
}

/** Regroupe un tableau mensuel en récapitulatif annuel (une ligne par
 *  paquet de 12 mois) — utilisé par le toggle annuel/mensuel de l'UI. */
export function groupAmortizationByYear(schedule: AmortizationRow[]): AnnualAmortizationRow[] {
  const years: AnnualAmortizationRow[] = [];
  for (let i = 0; i < schedule.length; i += 12) {
    const chunk = schedule.slice(i, i + 12);
    if (chunk.length === 0) continue;
    const last = chunk[chunk.length - 1];
    years.push({
      year: Math.floor(i / 12) + 1,
      payment: chunk.reduce((s, r) => s + r.payment, 0),
      interest: chunk.reduce((s, r) => s + r.interest, 0),
      principal: chunk.reduce((s, r) => s + r.principal, 0),
      remainingBalance: last.remainingBalance,
    });
  }
  return years;
}

export type FinancingScenarioInput = {
  askingPrice: number;
  worksEstimate: number;
  apportPct: number;
  notaryFeesPct: number;
  dossierFees: number;
  guaranteeFees: number;
  brokerFees: number;
};

export type FinancingCosts = {
  loanPrincipal: number;
  notaryFees: number;
  totalFinancingCosts: number;
  totalProjectCost: number;
};

/** Coût total du financement : frais annexes (notaire/dossier/garantie/
 *  courtage) financés dans l'emprunt, capital emprunté = coût total du
 *  projet moins l'apport, plus ces frais. */
export function computeFinancingCosts(input: FinancingScenarioInput): FinancingCosts {
  const totalCost = input.askingPrice + input.worksEstimate;
  const apport = totalCost * (input.apportPct / 100);
  const notaryFees = input.askingPrice * (input.notaryFeesPct / 100);
  const totalFinancingCosts = notaryFees + input.dossierFees + input.guaranteeFees + input.brokerFees;
  const loanPrincipal = Math.max(0, totalCost - apport + totalFinancingCosts);
  return {
    loanPrincipal,
    notaryFees,
    totalFinancingCosts,
    totalProjectCost: totalCost + totalFinancingCosts,
  };
}
