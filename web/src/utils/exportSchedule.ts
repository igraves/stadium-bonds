import type { AmortizationRow, SimulationSummary } from '../types';
import type { BondParams, LocalAddInsConfig, StreamOverrides } from '../types';
import { RAW_TAX_BASES, DEFAULT_GROCERY_EXEMPTIONS, RevenueStreamType } from '../types';

interface ExportParams {
  schedule: AmortizationRow[];
  summary: SimulationSummary;
  bondParams: BondParams;
  localAddIns: LocalAddInsConfig;
  streamOverrides: StreamOverrides;
  paydownPct: number;
}

/**
 * Format a number as currency for CSV (no $ symbol, just formatted number)
 */
function formatCsvCurrency(value: number): string {
  return value.toFixed(2);
}

/**
 * Format a percentage for display
 */
function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Escape a CSV field (wrap in quotes if contains comma, newline, or quote)
 */
function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate assumptions section for the CSV
 */
function generateAssumptionsSection(params: ExportParams): string[][] {
  const { summary, bondParams, localAddIns, streamOverrides, paydownPct } = params;

  const rows: string[][] = [];

  rows.push(['STAR Bond Financing Model - Export']);
  rows.push([`Generated: ${new Date().toISOString()}`]);
  rows.push([]);

  // Bond Parameters
  rows.push(['=== BOND PARAMETERS ===']);
  rows.push(['Principal', `$${(bondParams.principal / 1_000_000).toFixed(1)}M`]);
  rows.push(['Interest Rate', formatPercent(bondParams.interestRate)]);
  rows.push(['Term (Years)', String(bondParams.termYears)]);
  rows.push(['Coverage Ratio', `${bondParams.coverageRatio.toFixed(2)}x`]);
  rows.push(['Max Capitalization Years', String(bondParams.maxCapYears)]);
  rows.push(['Excess Paydown %', formatPercent(paydownPct)]);
  rows.push([]);

  // Tax Stream Settings
  rows.push(['=== TAX REVENUE STREAMS ===']);

  // State Sales Tax
  const salesOverride = streamOverrides[RevenueStreamType.STATE_SALES_TAX];
  const salesGroceryExempt = salesOverride?.groceryExemption ?? DEFAULT_GROCERY_EXEMPTIONS.stateSalesTax;
  const salesRawBase = RAW_TAX_BASES.stateSalesTax;
  const salesEffectiveBase = salesOverride?.base ?? (salesRawBase * (1 - salesGroceryExempt));
  const salesGrowth = salesOverride?.growthRate ?? 0.025;
  rows.push(['State Sales Tax - Raw Base', `$${(salesRawBase / 1_000_000).toFixed(1)}M`]);
  rows.push(['State Sales Tax - Grocery Exemption', formatPercent(salesGroceryExempt)]);
  rows.push(['State Sales Tax - Effective Base', `$${(salesEffectiveBase / 1_000_000).toFixed(1)}M`]);
  rows.push(['State Sales Tax - CAGR', formatPercent(salesGrowth)]);
  rows.push([]);

  // Use Tax
  const useOverride = streamOverrides[RevenueStreamType.USE_TAX];
  const useGroceryExempt = useOverride?.groceryExemption ?? DEFAULT_GROCERY_EXEMPTIONS.useTax;
  const useRawBase = RAW_TAX_BASES.useTax;
  const useEffectiveBase = useOverride?.base ?? (useRawBase * (1 - useGroceryExempt));
  const useGrowth = useOverride?.growthRate ?? 0.025;
  rows.push(['Use Tax - Raw Base', `$${(useRawBase / 1_000_000).toFixed(1)}M`]);
  rows.push(['Use Tax - Grocery Exemption', formatPercent(useGroceryExempt)]);
  rows.push(['Use Tax - Effective Base', `$${(useEffectiveBase / 1_000_000).toFixed(1)}M`]);
  rows.push(['Use Tax - CAGR', formatPercent(useGrowth)]);
  rows.push([]);

  // Other Revenue Streams
  rows.push(['=== OTHER REVENUE STREAMS ===']);
  const otherStreams = [
    { type: RevenueStreamType.LET, name: 'Liquor Enforcement Tax', defaultBase: 17_400_000, defaultGrowth: 0.02 },
    { type: RevenueStreamType.LIQUOR_EXCISE, name: 'Liquor Excise Tax', defaultBase: 8_200_000, defaultGrowth: 0.02 },
    { type: RevenueStreamType.APSK, name: 'APSK (Sports Wagering)', defaultBase: 8_700_000, defaultGrowth: 0.03 },
  ];

  for (const stream of otherStreams) {
    const override = streamOverrides[stream.type];
    const base = override?.base ?? stream.defaultBase;
    const growth = override?.growthRate ?? stream.defaultGrowth;
    rows.push([`${stream.name} - Base`, `$${(base / 1_000_000).toFixed(1)}M`]);
    rows.push([`${stream.name} - CAGR`, formatPercent(growth)]);
  }
  rows.push([]);

  // Local Add-Ins
  rows.push(['=== LOCAL ADD-INS ===']);
  rows.push(['Olathe Local Included', localAddIns.includeOlathe ? 'Yes' : 'No']);
  if (localAddIns.includeOlathe) {
    const olatheOverride = streamOverrides[RevenueStreamType.OLATHE_LOCAL];
    const olatheBase = olatheOverride?.base ?? 65_889_479;
    const olatheGrowth = olatheOverride?.growthRate ?? 0.035;
    rows.push(['Olathe Local - Base', `$${(olatheBase / 1_000_000).toFixed(1)}M`]);
    rows.push(['Olathe Local - CAGR', formatPercent(olatheGrowth)]);
  }
  rows.push(['Wyandotte UG Included', localAddIns.includeWyandotteUG ? 'Yes' : 'No']);
  if (localAddIns.includeWyandotteUG) {
    const wyandotteOverride = streamOverrides[RevenueStreamType.WYANDOTTE_UG_LOCAL];
    const wyandotteBase = wyandotteOverride?.base ?? 107_068_477;
    const wyandotteGrowth = wyandotteOverride?.growthRate ?? 0.035;
    rows.push(['Wyandotte UG - Base', `$${(wyandotteBase / 1_000_000).toFixed(1)}M`]);
    rows.push(['Wyandotte UG - CAGR', formatPercent(wyandotteGrowth)]);
  }
  rows.push([]);

  // Summary Results
  rows.push(['=== SIMULATION RESULTS ===']);
  rows.push(['Capitalization Years', String(summary.capitalizationYears)]);
  rows.push(['Principal After Capitalization', `$${(summary.principalAfterCap / 1_000_000).toFixed(2)}M`]);
  rows.push(['Annual Debt Service', `$${(summary.annualDebtService / 1_000_000).toFixed(2)}M`]);
  rows.push(['Total Interest Capitalized', `$${(summary.totalInterestCapitalized / 1_000_000).toFixed(2)}M`]);
  rows.push(['Total Interest Paid', `$${(summary.totalInterestPaid / 1_000_000).toFixed(2)}M`]);
  rows.push(['Total Interest', `$${(summary.totalInterest / 1_000_000).toFixed(2)}M`]);
  rows.push(['Interest as % of Principal', formatPercent(summary.interestPctOfPrincipal)]);
  rows.push(['30-Year Total Revenue', `$${(summary.totalRevenue30yr / 1_000_000_000).toFixed(2)}B`]);
  rows.push(['Total Extra Principal Paid', `$${(summary.totalExtraPrincipal / 1_000_000).toFixed(2)}M`]);
  rows.push(['Payoff Year', summary.payoffYear ? String(summary.payoffYear) : 'N/A (Full Term)']);
  rows.push(['Interest Savings', `$${(summary.interestSavings / 1_000_000).toFixed(2)}M`]);
  rows.push(['Years Saved', String(summary.yearsSaved)]);
  rows.push(['Viable', summary.viable ? 'Yes' : 'No']);
  rows.push([]);

  return rows;
}

/**
 * Generate the amortization schedule section for CSV
 */
function generateScheduleSection(schedule: AmortizationRow[]): string[][] {
  const rows: string[][] = [];

  rows.push(['=== AMORTIZATION SCHEDULE ===']);

  // Header row
  rows.push([
    'Year',
    'Available Revenue',
    'Interest Due',
    'Interest Paid',
    'Interest Capitalized',
    'Principal Paid',
    'Extra Principal',
    'Debt Service',
    'Ending Principal',
    'Coverage Ratio',
    'Excess Revenue',
    'In Cap Period',
    'Bonds Retired',
  ]);

  // Data rows
  for (const row of schedule) {
    rows.push([
      String(row.year),
      formatCsvCurrency(row.availableRevenue),
      formatCsvCurrency(row.interestDue),
      formatCsvCurrency(row.interestPaid),
      formatCsvCurrency(row.interestCapitalized),
      formatCsvCurrency(row.principalPaid),
      formatCsvCurrency(row.extraPrincipal),
      formatCsvCurrency(row.debtService),
      formatCsvCurrency(row.endingPrincipal),
      row.coverageRatio !== null ? row.coverageRatio.toFixed(4) : 'N/A',
      formatCsvCurrency(row.excessRevenue),
      row.inCapPeriod ? 'Yes' : 'No',
      row.bondsRetired ? 'Yes' : 'No',
    ]);
  }

  return rows;
}

/**
 * Convert rows to CSV string
 */
function rowsToCsv(rows: string[][]): string {
  return rows
    .map(row => row.map(escapeCsvField).join(','))
    .join('\n');
}

/**
 * Export amortization schedule and assumptions as CSV
 */
export function exportScheduleToCsv(params: ExportParams): void {
  const assumptionsRows = generateAssumptionsSection(params);
  const scheduleRows = generateScheduleSection(params.schedule);

  const allRows = [...assumptionsRows, ...scheduleRows];
  const csvContent = rowsToCsv(allRows);

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `star-bond-schedule-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
