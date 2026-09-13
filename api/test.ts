// Progressively import modules to find the crash
export default async function handler(req: any, res: any) {
  const loaded: string[] = [];
  try {
    // Test basic imports
    await import("express"); loaded.push("express");
    await import("compression"); loaded.push("compression");
    await import("passport"); loaded.push("passport");
    await import("passport-local"); loaded.push("passport-local");
    await import("express-session"); loaded.push("express-session");
    await import("connect-pg-simple"); loaded.push("connect-pg-simple");
    await import("postgres"); loaded.push("postgres");
    await import("stripe"); loaded.push("stripe");
    await import("drizzle-orm"); loaded.push("drizzle-orm");
    await import("drizzle-orm/postgres-js"); loaded.push("drizzle-orm/postgres-js");
    await import("openai"); loaded.push("openai");
    await import("zod"); loaded.push("zod");

    res.status(200).json({ ok: true, loaded });
  } catch (err: any) {
    res.status(500).json({
      error: err?.message,
      loaded,
      failedAfter: loaded[loaded.length - 1] || "none"
    });
  }
}
