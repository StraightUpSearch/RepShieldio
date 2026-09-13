// Test project-level imports to find the crash
export default async function handler(req: any, res: any) {
  const loaded: string[] = [];
  try {
    await import("../shared/schema"); loaded.push("shared/schema");
    await import("../server/config/database"); loaded.push("server/config/database");
    await import("../server/db"); loaded.push("server/db");
    await import("../server/validation"); loaded.push("server/validation");
    await import("../server/error-handler"); loaded.push("server/error-handler");
    await import("../server/rate-limiter"); loaded.push("server/rate-limiter");
    await import("../server/stripe"); loaded.push("server/stripe");
    await import("../server/email"); loaded.push("server/email");
    await import("../server/storage"); loaded.push("server/storage");
    await import("../server/simple-auth"); loaded.push("server/simple-auth");
    await import("../server/analytics"); loaded.push("server/analytics");
    await import("../server/openai"); loaded.push("server/openai");
    await import("../server/reddit"); loaded.push("server/reddit");
    await import("../server/scrapingbee"); loaded.push("server/scrapingbee");
    await import("../server/telegram"); loaded.push("server/telegram");
    await import("../server/webscraping"); loaded.push("server/webscraping");
    await import("../server/ticket-lifecycle"); loaded.push("server/ticket-lifecycle");
    await import("../server/db-init"); loaded.push("server/db-init");
    await import("../server/routes"); loaded.push("server/routes");
    res.status(200).json({ ok: true, loaded });
  } catch (err: any) {
    res.status(500).json({
      error: err?.message,
      loaded,
      failedAfter: loaded[loaded.length - 1] || "none"
    });
  }
}
