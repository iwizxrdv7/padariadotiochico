export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const CLIENT_ID = process.env.BEEHIVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.BEEHIVE_SECRET;

    const token = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const { orderId, amount, items, customer } = req.body;

    const payload = {
      amount,
      paymentMethod: "pix",
      customer: {
        name: customer.nome,
        document: { type: "cpf", number: customer.cpf },
        phone: customer.whats
      },
      items: items.map(item => ({
        title: item.name,
        unitPrice: Math.round(item.price * 100),
        quantity: item.qty
      })),
      pix: { expiresInDays: 1 },
      metadata: { orderId },
      postbackUrl: `https://${req.headers.host}/api/webhook`
    };

    const response = await fetch("https://api.conta.paybeehive.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return res.status(response.status).json({
      pix: {
        qrcode: data.qrCode,        // código copia e cola
        code: data.qrCode,          // compat
        qrcodeImage: data.qrCodeImage // imagem base64
      }
    });

  } catch (e) {
    console.log("PIX ERROR =>", e);
    return res.status(500).json({ error: "Falha interna ao gerar PIX" });
  }
}
