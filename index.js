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
    console.log("🧠 Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    console.log("🌐 Navigating to:", website_url);
    await page.goto(website_url, { waitUntil: "networkidle2", timeout: 30000 });

    console.log("📸 Taking screenshot...");
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    await browser.close();
    console.log("✅ Screenshot taken, browser closed");

    const filename = `tool-${tool_id}.png`;
    console.log("📦 Uploading to Supabase Storage as:", filename);

    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(filename, screenshotBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Upload to Supabase failed:", uploadError);
      throw uploadError;
    }

    const { data: publicData, error: publicUrlError } = supabase
      .storage
      .from("screenshots")
      .getPublicUrl(filename);

    if (publicUrlError) {
      console.error("❌ Getting public URL failed:", publicUrlError);
      throw publicUrlError;
    }

    console.log("📝 Updating screenshot_url in Supabase DB...");
    const { error: dbError } = await supabase
      .from("tools")
      .update({ screenshot_url: publicData.publicUrl })
      .eq("id", tool_id);

    if (dbError) {
      console.error("❌ DB update failed:", dbError);
      throw dbError;
    }

    console.log("✅ Screenshot saved to DB and Supabase Storage");
    res.json({ success: true, screenshot_url: publicData.publicUrl });
  } catch (err) {
    console.error("❌ Screenshot error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
