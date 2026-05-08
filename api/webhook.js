export default async function handler(req, res) {
  try {
    const order = req.body;

    console.log("📦 Shopify Order Received:", JSON.stringify(order, null, 2));

    // ----------------------------
    // SAFE + COMPLETE DATA EXTRACTION
    // ----------------------------
    const payload = {
      order_id: order?.id || "",

      customer_name:
        order?.billing_address?.first_name
          ? `${order.billing_address.first_name} ${order.billing_address.last_name || ""}`
          : order?.customer?.first_name
            ? `${order.customer.first_name} ${order.customer.last_name || ""}`
            : order?.billing_address?.name || "Guest",

      email_address:
        order?.email ||
        order?.contact_email ||
        order?.billing_address?.email ||
        order?.customer?.email ||
        "",

      total_amount:
        order?.total_price ||
        order?.total_price_set?.shop_money?.amount ||
        "0.00",

      financial_status: order?.financial_status || "unknown"
    };

    console.log("📊 Payload Sent:", payload);

    // ----------------------------
    // SEND TO GOOGLE SHEETS
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
    // SEND EMAIL (RESEND)
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
            <p><b>Status:</b> ${payload.financial_status}</p>
            <br/>
            <p>We are processing your order.</p>
          `
        })
      });

      console.log("📧 Email sent");
    } else {
      console.log("⚠️ No email found");
    }

    return res.status(200).json({
      success: true,
      message: "Order processed"
    });

  } catch (error) {
    console.error("❌ Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
