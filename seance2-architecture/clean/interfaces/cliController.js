// ADAPTATEUR d'interface : traduit une entrée (ici la ligne de commande)
// en appel du cas d'utilisation, puis formate la réponse.
export function makeCliController(transferMoney) {
  return async function handle(fromId, toId, amountText) {
    try {
      const result = await transferMoney.execute({
        fromId,
        toId,
        amount: Number(amountText),
      });
      const { fromBalance, toBalance } = result;
      const soldes = `${fromId}=${fromBalance} €, ${toId}=${toBalance} €`;
      return `✓ Virement de ${amountText} € : ${soldes}`;
    } catch (e) {
      return `✗ Refusé : ${e.message}`;
    }
  };
}
