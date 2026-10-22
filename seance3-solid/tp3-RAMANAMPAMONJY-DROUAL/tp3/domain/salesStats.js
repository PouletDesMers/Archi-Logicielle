export function computeStats(orders, month) {
  const monthOrders = orders.filter(order => order.date.startsWith(month));
  let revenueHT = 0;
  let count = 0;
  const byCategory = {};

  for (const order of monthOrders) {
    if (order.status === 'CANCELLED') continue;
    count++;
    for (const line of order.lines) {
      const amount = line.qty * line.unitPrice;
      revenueHT += amount;
      byCategory[line.category] = (byCategory[line.category] || 0) + amount;
    }
  }

  const vat = Math.round(revenueHT * 0.2 * 100) / 100;
  const revenueTTC = revenueHT + vat;
  const average = count === 0 ? 0 : Math.round((revenueHT / count) * 100) / 100;

  return { month, count, revenueHT, vat, revenueTTC, average, byCategory };
}
