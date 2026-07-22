/** Rendement net annuel = (loyer effectif − charges − gestion) / coût total, en %.
 *  `null` si prix/loyer insuffisants (jamais 0/NaN). */
export function computeRendementNetPct(input: {
  asking_price: number | null;
  works_estimate: number;
  estimated_rent: number | null;
  monthly_copro_charges: number;
  property_tax: number;
  management_fees_pct: number;
  vacancy_pct: number;
}): number | null {
  const price = input.asking_price;
  const rent = input.estimated_rent;
  if (!price || price <= 0 || !rent || rent <= 0) return null;
  const totalCost = price + input.works_estimate;
  if (totalCost <= 0) return null;
  const effectiveAnnualRent = rent * 12 * (1 - input.vacancy_pct / 100);
  const managementFees = effectiveAnnualRent * (input.management_fees_pct / 100);
  const annualNetIncome =
    effectiveAnnualRent - input.monthly_copro_charges * 12 - input.property_tax - managementFees;
  return (annualNetIncome / totalCost) * 100;
}

/** Rendement net-net = rendement net moins l'impôt annuel rapporté au coût total. */
export function computeRendementNetNetPct(
  rendementNetPct: number | null,
  annualTax: number,
  totalCost: number,
): number | null {
  if (rendementNetPct === null || totalCost <= 0) return null;
  return rendementNetPct - (annualTax / totalCost) * 100;
}

/** Cash-flow mensuel avant impôt = loyer effectif − charges − mensualité − assurance. */
export function computeCashflowBeforeTax(input: {
  estimated_rent: number | null;
  monthly_copro_charges: number;
  property_tax: number;
  management_fees_pct: number;
  vacancy_pct: number;
  monthlyPayment: number;
  monthlyInsurance: number;
}): number | null {
  const rent = input.estimated_rent;
  if (!rent || rent <= 0) return null;
  const effectiveRent = rent * (1 - input.vacancy_pct / 100);
  const managementFees = effectiveRent * (input.management_fees_pct / 100);
  return (
    effectiveRent -
    input.monthly_copro_charges -
    input.property_tax / 12 -
    managementFees -
    input.monthlyPayment -
    input.monthlyInsurance
  );
}

export function computeCashflowAfterTax(
  cashflowBeforeTaxMonthly: number | null,
  annualTax: number,
): number | null {
  if (cashflowBeforeTaxMonthly === null) return null;
  return cashflowBeforeTaxMonthly - annualTax / 12;
}

/** Effort d'épargne mensuel = combien il faut sortir de sa poche si le
 *  cash-flow après impôt est négatif (0 sinon). */
export function computeEffortEpargne(cashflowAfterTaxMonthly: number | null): number | null {
  if (cashflowAfterTaxMonthly === null) return null;
  return cashflowAfterTaxMonthly < 0 ? -cashflowAfterTaxMonthly : 0;
}

export function computeCashOnCash(
  cashflowAfterTaxMonthly: number | null,
  apportInvested: number,
): number | null {
  if (cashflowAfterTaxMonthly === null || apportInvested <= 0) return null;
  return ((cashflowAfterTaxMonthly * 12) / apportInvested) * 100;
}

/** Point mort = % du loyer effectif nécessaire pour couvrir charges + mensualité + assurance. */
export function computePointMort(input: {
  estimated_rent: number | null;
  vacancy_pct: number;
  monthly_copro_charges: number;
  property_tax: number;
  monthlyPayment: number;
  monthlyInsurance: number;
}): number | null {
  const rent = input.estimated_rent;
  if (!rent || rent <= 0) return null;
  const effectiveRent = rent * (1 - input.vacancy_pct / 100);
  if (effectiveRent <= 0) return null;
  return (
    ((input.monthly_copro_charges + input.property_tax / 12 + input.monthlyPayment + input.monthlyInsurance) /
      effectiveRent) *
    100
  );
}

/** TRI (taux de rendement interne) par Newton-Raphson sur des flux annuels
 *  (flux[0] = investissement initial négatif). Retourne `null` si la série
 *  ne converge pas en 100 itérations — jamais NaN/Infinity affiché.
 *
 *  Correction par rapport au brief initial : Newton-Raphson diverge (rate → +∞)
 *  quand la série de flux n'a pas de racine réelle (ex. tous les flux du même
 *  signe). Dans ce cas `dnpv` finit par sous-passer vers 0 par underflow flottant
 *  après plusieurs itérations, et le taux courant peut avoir explosé à une valeur
 *  absurde (ex. 1e+176) tout en restant `Number.isFinite` — donc silencieusement
 *  accepté par le garde-fou du brief (`Number.isFinite(rate) && rate > -1`), qui
 *  ne vérifie jamais que `npv` est réellement proche de 0. On borne désormais la
 *  progression du taux (`nextRate > 1000` ⇒ abandon) et on ne renvoie plus jamais
 *  ce taux « en sortie de boucle » : seule la convergence effective à l'intérieur
 *  de la boucle (`Math.abs(npv) < 1e-6`) produit un résultat ; toute sortie de
 *  boucle sans convergence (non-convergence en 100 itérations, dérivée nulle,
 *  ou taux hors bornes) renvoie `null`. */
export function computeTRI(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null;
  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / Math.pow(1 + rate, t);
      if (t > 0) dnpv -= (t * cashflows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 1e-6) return rate * 100;
    if (dnpv === 0) break;
    const nextRate = rate - npv / dnpv;
    if (!Number.isFinite(nextRate) || nextRate <= -1 || nextRate > 1000) break;
    rate = nextRate;
  }
  return null;
}

/** Enrichissement net = capital du prêt effectivement remboursé à l'horizon. */
export function computeEnrichissementNet(loanPrincipal: number, remainingBalanceAtHorizon: number): number {
  return Math.max(0, loanPrincipal - remainingBalanceAtHorizon);
}

/** Plus-value nette estimée à l'horizon, après frais de vente (7 % par défaut). */
export function computePlusValueNetteEstimee(
  totalCost: number,
  appreciationPctPerYear: number,
  horizonYears: number,
  sellingCostsPct = 7,
): number {
  const futureValue = totalCost * Math.pow(1 + appreciationPctPerYear / 100, horizonYears);
  const sellingCosts = futureValue * (sellingCostsPct / 100);
  return futureValue - sellingCosts - totalCost;
}
