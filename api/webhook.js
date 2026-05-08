export default async function handler(req, res) {
  try {
    const order = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const payload = {
      order_id: order.id,
      customer_name: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`,
      email: order.email,
      total_price: order.total_price,
      items: (order.line_items || []).map(i => i.title).join(", ")
    };

    const response = await fetch("https://script.google.com/macros/s/AKfycbyzMghOaW_Vl59pvDBdz2bqsb4bWb3uADRwe5gL8-5Kl4om1jcHNMgj7wlTvsHkvluttQ/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log("Apps Script response:", text);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed" });
  }
}
