export function truncateWallet(address: string, start = 6, end = 4): string {
  if (address.length <= start + end + 2) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}
