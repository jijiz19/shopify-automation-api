export default async function handler(req, res) {
  try {
    const order = req.body;

    console.log("🔥 RAW ORDER:", JSON.stringify(order, null, 2));

    // ----------------------------
    // FINAL MATCHED PAYLOAD (BASED ON YOUR REAL SHOPIFY DATA)
    // ----------------------------
    const payload = {
      order_id: order?.id || "",

      customer_name:
        order?.customer?.first_name
          ? `${order.customer.first_name} ${order.customer.last_name || ""}`
          : "Guest",

      email_address: order?.email || "",

      total_amount: order?.total_price || "0.00",

      financial_status: order?.financial_status || "unknown"
    };

    console.log("📦 FINAL PAYLOAD:", payload);

    // ----------------------------
    // SEND TO GOOGLE APPS SCRIPT
    // ----------------------------
    await fetch("YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("✅ Sent to Google Sheets");

    // ----------------------------
    // SEND EMAIL (RESEND)
    // ----------------------------
    if (payload.email_address) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: payload.email_address,
          subject: `Order Confirmation #${payload.order_id}`,
          html: `
            <h2>Thank you for your order!</h2>
            <p><b>Order ID:</b> ${payload.order_id}</p>
            <p><b>Total:</b> $${payload.total_amount}</p>
            <p><b>Status:</b> ${payload.financial_status}</p>
          `
        })
      });

      console.log("📧 Email response:", await emailResponse.text());
    } else {
      console.log("⚠️ No email found, skipping email");
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
