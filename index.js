const express = require("express");
const puppeteer = require("puppeteer");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/screenshot", async (req, res) => {
  console.log("🔥 Screenshot route hit");

  const { tool_id, website_url } = req.body;
  console.log("🛠️ Incoming screenshot request:", { tool_id, website_url });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(website_url, { waitUntil: "networkidle2", timeout: 30000 });

    const screenshotBuffer = await page.screenshot({ fullPage: true });
    await browser.close();

    const filename = `tool-${tool_id}.png`;

    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(filename, screenshotBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase
      .storage
      .from("screenshots")
      .getPublicUrl(filename);

    await supabase
      .from("tools")
      .update({ screenshot_url: publicData.publicUrl })
      .eq("id", tool_id);

    console.log("✅ Screenshot saved to DB and Supabase Storage");
    res.json({ success: true, screenshot_url: publicData.publicUrl });
  } catch (err) {
    console.error("❌ Screenshot error:", err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
