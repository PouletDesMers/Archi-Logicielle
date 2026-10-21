// ADAPTATEUR SECONDAIRE : notification « e-mail » simulée dans la console.
export class ConsoleNotifier {
  async orderPlaced(order) {
    const { id, customerId, total } = order;
    console.log(
      `  [e-mail simulé] Commande ${id} confirmée pour ${customerId} : ${total} €`,
    );
  }
}
