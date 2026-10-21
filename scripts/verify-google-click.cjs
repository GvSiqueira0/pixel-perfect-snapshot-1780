const { chromium } = require("playwright");

// Clicks "Continuar com Google" on /auth and verifies the OAuth redirect target.
// Usage: node scripts/verify-google-click.cjs [origin]
const origin = process.argv[2] || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ channel: "chromium" });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text());
  });

  await page.goto(`${origin}/auth`, { waitUntil: "networkidle" });

  const google = await page.getByRole("button", { name: "Continuar com Google" }).count();
  const apple = await page.getByText("Continuar com Apple").count();
  if (google !== 1) throw new Error(`expected 1 Google button, got ${google}`);
  if (apple !== 0) throw new Error(`Apple button should be gone, got ${apple}`);

  await page.getByRole("button", { name: "Continuar com Google" }).click();
  await page.waitForURL((u) => u.href.includes("accounts.google.com"), { timeout: 15000 });

  const url = new URL(page.url());
  const redirectUri = url.searchParams.get("redirect_uri");
  const responseType = url.searchParams.get("response_type");
  console.log(`destination: ${url.host}`);
  console.log(`redirect_uri: ${redirectUri}`);
  console.log(`response_type: ${responseType}`);
  console.log(`console errors: ${errors.length ? JSON.stringify(errors) : "none"}`);

  if (!redirectUri || !redirectUri.endsWith("/auth/v1/callback")) {
    throw new Error(`unexpected redirect_uri: ${redirectUri}`);
  }
  if (responseType !== "code") throw new Error(`unexpected response_type: ${responseType}`);
  if (errors.length) throw new Error("console errors present");

  await browser.close();
  console.log("OK: Google OAuth redirect is wired correctly");
})().catch((e) => {
  console.error("FAILED: " + e.message);
  process.exit(1);
});
