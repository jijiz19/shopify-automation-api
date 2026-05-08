export default async function handler(req, res) {
  try {
    const order = req.body;

    console.log("🔥 RAW ORDER:", order);

    // Build the payload to match your Apps Script data names
    const payload = {
      order_id: order?.id || "",
      customer_name: order?.customer?.first_name
        ? `${order.customer.first_name} ${order.customer.last_name || ""}`
        : "Guest",
      email: order?.email || "",
      total_price: order?.total_price || "",
      // ADDED: This maps through line_items to get product names for Column E
      items: order?.line_items 
        ? order.line_items.map(item => item.title).join(", ") 
        : "",
      // This fills Column F
      financial_status: order?.financial_status || ""
    };

    console.log("📦 SENDING TO GSHEET:", payload);

    // Sending data to Google Apps Script
    await fetch("https://script.google.com/macros/s/AKfycbyzMghOaW_Vl59pvDBdz2bqsb4bWb3uADRwe5gL8-5Kl4om1jcHNMgj7wlTvsHkvluttQ/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("❌ ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
