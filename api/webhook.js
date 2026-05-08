export default async function handler(req, res) {
  try {
    const order = req.body;
    
    // YOUR RESEND API KEY FROM THE SCREENSHOT
    const RESEND_API_KEY = 're_TfEfT4xu_PRQTu3ssRMW4TfTSyW7MmWd8'; 

    console.log("🔥 RAW ORDER:", order);

    // 1. Prepare the payload
    const payload = {
      order_id: order?.id || "",
      customer_name: order?.customer?.first_name
        ? `${order.customer.first_name} ${order.customer.last_name || ""}`
        : "Guest",
      email: order?.email || "",
      total_price: order?.total_price || "",
      items: order?.line_items 
        ? order.line_items.map(item => item.title).join(", ") 
        : "",
      financial_status: order?.financial_status || ""
    };

    console.log("📦 SENDING TO GSHEET:", payload);

    // 2. Action 1: Send data to Google Sheets
    await fetch("https://script.google.com/macros/s/AKfycbyzMghOaW_Vl59pvDBdz2bqsb4bWb3uADRwe5gL8-5Kl4om1jcHNMgj7wlTvsHkvluttQ/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // 3. Action 2: Send Email via Resend
    if (payload.email) {
      console.log("📧 SENDING EMAIL TO:", payload.email);
      
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: "Store <onboarding@resend.dev>", // Change this once you verify a domain
          to: [payload.email],
          subject: `Order Confirmation #${payload.order_id}`,
          html: `
            <h2>Hi ${payload.customer_name}!</h2>
            <p>Thanks for your order. Here are the details:</p>
            <p><strong>Order ID:</strong> ${payload.order_id}</p>
            <p><strong>Items:</strong> ${payload.items}</p>
            <p><strong>Total Price:</strong> ${payload.total_price}</p>
            <p><strong>Status:</strong> ${payload.financial_status}</p>
          `
        })
      });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("❌ ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
