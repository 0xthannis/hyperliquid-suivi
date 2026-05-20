import { Share } from 'react-native';
import type { HistoryEvent } from './calculations';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function shareHistoryCsv(events: HistoryEvent[]): Promise<void> {
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

  await Share.share({
    message: csv,
    title: `at-capital-journal-${new Date().toISOString().slice(0, 10)}.csv`,
  });
}
