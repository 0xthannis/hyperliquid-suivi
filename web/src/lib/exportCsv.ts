import type { HistoryEvent } from './calculations';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportHistoryCsv(events: HistoryEvent[], filename?: string): void {
  const header = ['Date', 'Actif', 'Operation', 'PnL_net', 'Type'];
  const rows = events.map((e) => [
    new Date(e.time).toISOString(),
    e.coin,
    e.label,
    e.isClose ? String(e.netPnl) : '',
    e.isClose ? 'Fermeture' : 'Ouverture',
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((c) => escapeCsv(String(c))).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    filename ?? `at-capital-journal-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
