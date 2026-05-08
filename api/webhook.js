export default async function handler(req, res) {
  try {
    const order = req.body;

    const payload = {
      order_id: order.id,
      customer_name: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`,
      email: order.email,
      total_price: order.total_price,
      items: (order.line_items || []).map(i => i.title).join(", ")
    };

    // 1. SEND TO GOOGLE SHEETS
    await fetch("https://script.google.com/macros/s/AKfycbyzMghOaW_Vl59pvDBdz2bqsb4bWb3uADRwe5gL8-5Kl4om1jcHNMgj7wlTvsHkvluttQ/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // 2. SEND EMAIL (RESEND)
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Shop Orders <onboarding@resend.dev>",
        to: payload.email,
        subject: "Order Confirmation #" + payload.order_id,
        html: `
          <h1>Thank you for your order!</h1>
          <p><b>Order ID:</b> ${payload.order_id}</p>
          <p><b>Total:</b> ${payload.total_price}</p>
          <p><b>Items:</b> ${payload.items}</p>
        `
      })
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "failed" });
  }
}
