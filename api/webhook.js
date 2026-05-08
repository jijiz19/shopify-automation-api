export default async function handler(req, res) {
  try {

    console.log("🔥 RAW SHOPIFY PAYLOAD:");
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).json({
      success: true,
      message: "Logged payload"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
