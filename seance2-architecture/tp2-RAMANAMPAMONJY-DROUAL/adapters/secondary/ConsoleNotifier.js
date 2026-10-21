// ADAPTATEUR SECONDAIRE : notification « e-mail » simulée dans la console.
export class ConsoleNotifier {
  async orderPlaced(order) {
    console.log(`[e-mail simulé] Commande ${order.id} payée : ${order.total} €`);
  }
}
