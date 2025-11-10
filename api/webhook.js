export default async function handler(req, res) {
  // A Beehive manda um POST aqui ao confirmar pagamento
  console.log("Webhook recebido:", req.body);

  // quando status === "paid" → já pode considerar pedido pago
  // Exemplo: salvar no banco / enviar mensagem / liberar pedido
  // MAS como você quer abrir o WhatsApp, vamos só responder OK.

  return res.status(200).json({ received: true });
}
