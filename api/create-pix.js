export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Só POST aqui, parça" });
  }

  try {
    const CLIENT_ID = process.env.BEEHIVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.BEEHIVE_SECRET;

    const token = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const { amount, items, customer } = req.body;

    const payload = {
      amount,
      paymentMethod: "pix",
      customer: {
        name: customer.nome,
        document: { type: "cpf", number: customer.cpf },
        phone: customer.whats
      },
      items: items.map(i => ({
        title: i.name,
        unitPrice: Math.round(i.price * 100),
        quantity: i.qty
      })),
      pix: { expiresInDays: 1 },
      metadata: { checkout: "Padaria do Chico" }
    };

    const response = await fetch("https://api.conta.paybeehive.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return res.status(200).json({
      pix: {
        code: data.qrCode,
        qrcodeImage: data.qrCodeImage
      }
    });
  } catch (err) {
    console.log("ERRO PIX =>", err);
    return res.status(500).json({ error: "Falha ao gerar PIX" });
  }
}
