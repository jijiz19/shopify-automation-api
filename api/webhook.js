export default async function handler(req, res) {
  try {
    const order = req.body;
    
    // YOUR RESEND API KEY
    const RESEND_API_KEY = 're_TfEfT4xu_PRQTu3ssRMW4TfTSyW7MmWd8'; 

    console.log("🔥 RAW ORDER RECEIVED:", order.id);

    // DITO TAYO NAG-UPGRADE: "Smart Data Extraction"
    const payload = {
      order_id: order?.name || order?.id || "N/A",
      
      // Check Customer Name -> if none, check Shipping Address name -> if none, "Guest"
      customer_name: order?.customer?.first_name 
        ? `${order.customer.first_name} ${order.customer.last_name || ""}` 
        : (order?.shipping_address?.name || order?.billing_address?.name || "Guest"),

      // Check Email -> if none, check Contact Email -> if none, check Customer profile email
      email: order?.email || order?.contact_email || order?.customer?.email || "",

      total_price: order?.total_price || "0.00",
      items: order?.line_items 
        ? order.line_items.map(item => item.title).join(", ") 
        : "No items",
      financial_status: order?.financial_status || "pending"
    };

    console.log("📦 PAYLOAD READY:", payload);

    // 1. Send data to Google Sheets
    await fetch("https://script.google.com/macros/s/AKfycbw7KN0G2Ja5w-lWEV3bl0BIHLhaWjOI9xwn6ZyvkrNcr9GC8llOsoJ8pMpjUWjNj3vjGA/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // 2. Send Email via Resend
    // Siguraduhin na may email bago mag-send
    if (payload.email && payload.email.includes("@")) {
      console.log("📧 SENDING EMAIL TO:", payload.email);
      
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: "Store <onboarding@resend.dev>", 
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
    } else {
      console.log("⚠️ No email address found, skipping Resend.");
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("❌ ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
