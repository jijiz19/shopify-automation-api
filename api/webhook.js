export default async function handler(req, res) {
  try {
    const order = req.body;

    console.log("📦 Shopify Order Received:", order);

    // ----------------------------
    // SAFE DATA EXTRACTION
    // ----------------------------
    const payload = {
      order_id: order.id || "",

      customer_name:
        order.customer?.first_name
          ? `${order.customer.first_name} ${order.customer.last_name || ""}`
          : order.billing_address?.name || "Guest",

      email:
        order.email ||
        order.contact_email ||
        order.customer?.email ||
        "",

      total_price: order.total_price || "0.00",

      items: (order.line_items || [])
        .map(item => item.title)
        .join(", ")
    };

    console.log("📊 Formatted Payload:", payload);

    // ----------------------------
    // 1. SEND TO GOOGLE SHEETS
    // ----------------------------
    await fetch("https://script.google.com/macros/s/AKfycbyzMghOaW_Vl59pvDBdz2bqsb4bWb3uADRwe5gL8-5Kl4om1jcHNMgj7wlTvsHkvluttQ/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("✅ Sent to Google Sheets");

    // ----------------------------
    // 2. SEND EMAIL (RESEND)
    // ----------------------------
    if (payload.email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Shop Orders <onboarding@resend.dev>",
          to: payload.email,
          subject: `Order Confirmation #${payload.order_id}`,
          html: `
            <h2>Thank you for your order!</h2>
            <p><b>Order ID:</b> ${payload.order_id}</p>
            <p><b>Total:</b> ₱${payload.total_price}</p>
            <p><b>Items:</b> ${payload.items}</p>
            <br/>
            <p>We will process your order soon.</p>
          `
        })
      });

      console.log("📧 Email sent");
    } else {
      console.log("⚠️ No email found, skipping email send");
    }

    // ----------------------------
    // RESPONSE
    // ----------------------------
    return res.status(200).json({
      success: true,
      message: "Order processed successfully"
    });

  } catch (error) {
    console.error("❌ Webhook Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
