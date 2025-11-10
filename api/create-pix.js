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
      amount, // já vem em centavos do frontend
      paymentMethod: "pix",
      
      customer: {
        name: customer.nome,
        documents: [
          { type: "cpf", number: customer.cpf }
        ],
        phoneNumber: customer.whats
      },

      items: items.map(item => ({
        title: item.name,
        unitPrice: Math.round(item.price * 100),
        quantity: item.qty,
        tangible: false
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

    console.log("BEEHIVE RESPONSE =>", data); // deixa isso pra debug

    return res.status(response.status).json({
      pix: {
        qrcode: data.qrCode,
        code: data.qrCode,
        qrcodeImage: data.qrCodeImage
      }
    });

  } catch (e) {
    console.log("PIX ERROR =>", e);
    return res.status(500).json({ error: "Falha interna ao gerar PIX" });
  }
}
