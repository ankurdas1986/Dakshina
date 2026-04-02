export function hoursUntil(date: Date, now = new Date()): number {
  return Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
}
