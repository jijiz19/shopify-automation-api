export default async function handler(req, res) {
  try {
    // Get Shopify order data
    const order = req.body;

    console.log("New Shopify Order Received:", order);

    // Format data for Google Sheets
    const payload = {
      order_id: order.id,
      customer_name: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`,
      email: order.email,
      total_price: order.total_price,
      items: (order.line_items || []).map(item => item.title).join(", ")
    };

    // Send to Google Apps Script (Google Sheets)
    await fetch("https://script.google.com/macros/s/AKfycbyzMghOaW_Vl59pvDBdz2bqsb4bWb3uADRwe5gL8-5Kl4om1jcHNMgj7wlTvsHkvluttQ/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return res.status(200).json({
      success: true,
      message: "Order processed successfully"
    });

  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
}
