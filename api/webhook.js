export default async function handler(req, res) {
  try {
    const order = req.body;

    console.log("📦 Shopify Order Received:", order);

    // ----------------------------
    // FORMAT DATA (MATCH GOOGLE SHEETS)
    // ----------------------------
    const payload = {
      order_id: order.id || "",

      customer_name:
        order.customer?.first_name
          ? `${order.customer.first_name} ${order.customer.last_name || ""}`
          : order.billing_address?.name || "Guest",

      email_address:
        order.email ||
        order.contact_email ||
        order.customer?.email ||
        "",

      total_amount: order.total_price || "0.00",

      financial_status: order.financial_status || "unknown"
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
    if (payload.email_address) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Shop Orders <onboarding@resend.dev>",
          to: payload.email_address,
          subject: `Order Confirmation #${payload.order_id}`,
          html: `
            <h2>Thank you for your order!</h2>
            <p><b>Order ID:</b> ${payload.order_id}</p>
            <p><b>Total Amount:</b> ₱${payload.total_amount}</p>
            <p><b>Financial Status:</b> ${payload.financial_status}</p>
            <br/>
            <p>We are processing your order now.</p>
          `
        })
      });

      console.log("📧 Email sent");
    } else {
      console.log("⚠️ No email found, skipping email");
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
