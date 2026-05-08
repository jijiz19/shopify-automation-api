export default async function handler(req, res) {
  try {
    const order = req.body;
    console.log("🔥 Incoming Order:", order.id);

    // Smart Data Extraction
    const payload = {
      order_id: order?.name || order?.id || "N/A",
      customer_name: order?.customer?.first_name 
        ? `${order.customer.first_name} ${order.customer.last_name || ""}` 
        : (order?.shipping_address?.name || order?.billing_address?.name || "Guest"),
      email: order?.email || order?.contact_email || order?.customer?.email || "",
      total_price: order?.total_price || "0.00",
      items: order?.line_items ? order.line_items.map(item => item.title).join(", ") : "No items",
      financial_status: order?.financial_status || "pending"
    };

    // ONLY SEND TO GOOGLE SHEETS
    // Google will handle the Email part internally
    await fetch("https://script.google.com/macros/s/AKfycbxLODQr3-9CUoQ6RY7bJGehFpbCl_JxB2Ur9jbmiaKKBnfOS9LLxs5cSGsOECTwCOgvGQ/exec", {
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
