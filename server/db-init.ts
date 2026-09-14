import { getDatabaseConfig } from './config/database';
import postgres from 'postgres';
import { createRequire } from 'module';

const config = getDatabaseConfig();
const isPostgres = config.type === 'postgresql';

/**
 * Initialize database tables if they don't exist
 * This ensures compatibility across different deployment environments
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔧 Initializing database tables...');

  try {
    if (isPostgres) {
      await initializePostgresql();
    } else {
      const require = createRequire(import.meta.url);
      const { createClient } = require('@libsql/client');
      const dbPath = config.url.replace('sqlite://', '');
      const client = createClient({ url: `file:${dbPath}` });

      await ensureTable(client, 'password_reset_tokens', `
        CREATE TABLE password_reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at INTEGER NOT NULL,
          used INTEGER DEFAULT 0,
          created_at INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      await ensureTable(client, 'scan_results', `
        CREATE TABLE scan_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT REFERENCES users(id),
          brand_name TEXT NOT NULL,
          scan_type TEXT NOT NULL,
          total_mentions INTEGER DEFAULT 0,
          risk_level TEXT,
          risk_score INTEGER DEFAULT 0,
          platform_data TEXT,
          processing_time INTEGER,
          scan_id TEXT NOT NULL,
          created_at INTEGER
        )
      `);

      await ensureTable(client, 'subscriptions', `
        CREATE TABLE subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT NOT NULL REFERENCES users(id),
          plan_id TEXT NOT NULL,
          status TEXT DEFAULT 'active' NOT NULL,
          stripe_subscription_id TEXT,
          stripe_customer_id TEXT,
          current_period_start INTEGER,
          current_period_end INTEGER,
          cancelled_at INTEGER,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      await ensureTable(client, 'funnel_events', `
        CREATE TABLE funnel_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          event_type TEXT NOT NULL,
          user_id TEXT,
          session_id TEXT,
          metadata TEXT,
          created_at INTEGER
        )
      `);

      await ensureTable(client, 'transactions', `
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT NOT NULL REFERENCES users(id),
          ticket_id INTEGER REFERENCES tickets(id),
          type TEXT NOT NULL,
          amount TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'completed' NOT NULL,
          created_at INTEGER
        )
      `);

      // Core tables that Drizzle migrations should create, but ensure they exist
      await ensureTable(client, 'sessions', `
        CREATE TABLE sessions (
          sid TEXT PRIMARY KEY NOT NULL,
          sess TEXT NOT NULL,
          expire INTEGER NOT NULL
        )
      `);

      await ensureTable(client, 'users', `
        CREATE TABLE users (
          id TEXT PRIMARY KEY NOT NULL,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          profile_image_url TEXT,
          password TEXT,
          role TEXT DEFAULT 'user' NOT NULL,
          account_balance TEXT DEFAULT '0.00',
          credits_remaining INTEGER DEFAULT 0,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      await ensureTable(client, 'tickets', `
        CREATE TABLE tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT NOT NULL REFERENCES users(id),
          type TEXT NOT NULL,
          status TEXT DEFAULT 'pending' NOT NULL,
          priority TEXT DEFAULT 'standard' NOT NULL,
          assigned_to TEXT,
          title TEXT NOT NULL,
          description TEXT,
          reddit_url TEXT,
          amount TEXT,
          progress INTEGER DEFAULT 0,
          request_data TEXT,
          notes TEXT,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      await ensureTable(client, 'audit_requests', `
        CREATE TABLE audit_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          company TEXT NOT NULL,
          website TEXT,
          message TEXT,
          processed INTEGER DEFAULT 0,
          created_at INTEGER
        )
      `);

      await ensureTable(client, 'quote_requests', `
        CREATE TABLE quote_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          reddit_url TEXT NOT NULL,
          email TEXT NOT NULL,
          processed INTEGER DEFAULT 0,
          created_at INTEGER
        )
      `);

      await ensureTable(client, 'brand_scan_tickets', `
        CREATE TABLE brand_scan_tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          company TEXT NOT NULL,
          brand_name TEXT NOT NULL,
          processed INTEGER DEFAULT 0,
          created_at INTEGER
        )
      `);

      await ensureTable(client, 'blog_posts', `
        CREATE TABLE blog_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          excerpt TEXT,
          content TEXT NOT NULL,
          meta_title TEXT,
          meta_description TEXT,
          keywords TEXT,
          featured_image TEXT,
          author TEXT NOT NULL,
          status TEXT DEFAULT 'draft',
          category TEXT,
          tags TEXT,
          reading_time INTEGER,
          published_at INTEGER,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      await ensureTable(client, 'blog_categories', `
        CREATE TABLE blog_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          meta_title TEXT,
          meta_description TEXT,
          created_at INTEGER
        )
      `);

      await ensureTable(client, 'ticket_messages', `
        CREATE TABLE ticket_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          ticket_id INTEGER NOT NULL REFERENCES tickets(id),
          sender_id TEXT REFERENCES users(id),
          sender_role TEXT NOT NULL,
          message TEXT NOT NULL,
          is_internal INTEGER DEFAULT 0,
          created_at INTEGER
        )
      `);

      // Create indexes for common query patterns (SQLite)
      console.log('📋 Creating database indexes...');
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_audit_requests_processed ON audit_requests(processed)',
        'CREATE INDEX IF NOT EXISTS idx_quote_requests_processed ON quote_requests(processed)',
        'CREATE INDEX IF NOT EXISTS idx_brand_scan_tickets_processed ON brand_scan_tickets(processed)',
        'CREATE INDEX IF NOT EXISTS idx_brand_scan_tickets_email ON brand_scan_tickets(email)',
        'CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type ON funnel_events(event_type)',
        'CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON funnel_events(created_at)',
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)',
        'CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)',
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)',
        'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)',
      ];
      await client.batch(indexes.map(sql => ({ sql, args: [] })));
      console.log('✅ Database indexes created');

      try {
        await seedBlogPostsSqlite(client);
      } catch (seedErr) {
        console.error('Blog seed failed (non-fatal):', seedErr);
      }
    }

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw - let the application start even if this fails
  }
}

const SEED_POSTS = [
  {
    title: 'How to Remove False Reddit Posts About Your Business',
    slug: 'how-to-remove-false-reddit-posts',
    excerpt: 'A step-by-step guide to getting defamatory or false content removed from Reddit — and what to do when standard reporting fails.',
    content: `Reddit is one of the most trusted domains on the internet, which makes false or defamatory posts about your business especially damaging. A single thread on a popular subreddit can surface on the first page of Google within hours and stay there for years.\n\nHere is the process professionals use to remove harmful Reddit content.\n\n## Step 1: Document Everything\n\nBefore taking any action, screenshot the post, note the subreddit, author username, and timestamp. This evidence is critical if you need to escalate.\n\n## Step 2: Assess the Claim\n\nIs the content demonstrably false? Does it make specific factual claims that can be disproven? Content that crosses into defamation (false statements of fact presented as true) has the strongest removal grounds.\n\n## Step 3: Report to Reddit\n\nUse the native report button for content that violates Reddit's Content Policy — particularly rules around doxxing, harassment, and misinformation. Reddit's Trust & Safety team reviews flagged content.\n\n## Step 4: Contact the Subreddit Moderators\n\nSubreddit moderators have wide discretion to remove posts. A polite, evidence-backed message explaining why the content is false is often more effective than the platform report.\n\n## Step 5: Work With a Professional\n\nIf both steps fail, a reputation management specialist can escalate through Reddit's business channels, send formal legal notices, and in some cases negotiate with the original poster. RepShield handles over 1,650 cases per year with a 95% success rate.\n\n## What Not to Do\n\nAvoid engaging with the post publicly. Replies often resurface the thread in search results and can appear to validate the claims. Similarly, avoid asking friends or employees to downvote — coordinated voting manipulation violates Reddit's rules and can make your situation worse.`,
    metaTitle: 'How to Remove False Reddit Posts About Your Business | RepShield',
    metaDescription: 'Step-by-step guide to removing defamatory Reddit posts. Learn what works, what to avoid, and when to call a professional.',
    keywords: 'remove reddit post, reddit defamation, false reddit review, reddit reputation management',
    author: 'RepShield Team',
    category: 'guides',
    tags: ['reddit removal', 'defamation', 'reputation management'],
    readingTime: 5,
  },
  {
    title: "Reddit's Hidden Risk to SaaS Companies: What Founders Need to Know",
    slug: 'reddit-risk-saas-companies',
    excerpt: 'A single negative thread about a SaaS product can suppress trial signups for months. Here is why Reddit is a unique threat — and how leading founders are managing it.',
    content: `For SaaS founders, Reddit occupies a strange position in the marketing stack. On one hand, organic mentions in communities like r/SaaS, r/Entrepreneur, and product-specific subreddits drive high-intent signups. On the other, a single negative experience posted to the right community can become a persistent SEO liability that suppresses conversions for years.\n\n## Why Reddit Ranks So Well\n\nReddit pages consistently appear in the top five results for brand-name searches. Google treats Reddit as a trusted source due to its domain authority and high engagement signals. A post asking "Is [YourProduct] legit?" that receives ten replies will almost certainly outrank your own landing page for that query.\n\n## The Compounding Effect\n\nUnlike a tweet that disappears in hours, a Reddit thread ages well in search engines. A complaint posted during your beta in 2022 is still findable in 2025. Worse, dormant threads can be "necroposted" — a new user adds a comment years later, refreshing the page's freshness signal in Google's eyes.\n\n## Common Trigger Points for SaaS\n\n- Billing disputes (especially unexpected renewals)\n- Failed cancellation attempts\n- Data loss or downtime events\n- Founder public statements taken out of context\n- Competitor-initiated negative posts (more common than founders realise)\n\n## What Smart Founders Do\n\nMonitoring is the first line of defence. Tools that alert you within hours of a new brand mention let you respond constructively before a thread gains traction. When content crosses into false or defamatory territory, professional removal via established Reddit channels achieves 95%+ success rates.\n\nRepShield scans Reddit for your brand name in seconds and surfaces any risk content.`,
    metaTitle: 'Reddit Reputation Risk for SaaS Companies | RepShield',
    metaDescription: 'Why Reddit is a unique SEO and reputation threat for SaaS founders, and how to manage it before a single thread suppresses your signups.',
    keywords: 'saas reddit reputation, reddit brand mentions, saas negative reviews reddit',
    author: 'RepShield Team',
    category: 'industry',
    tags: ['saas', 'reddit monitoring', 'brand risk'],
    readingTime: 6,
  },
  {
    title: "What Reddit's Content Policy Actually Allows You to Remove",
    slug: 'reddit-content-policy-removal-guide',
    excerpt: 'Most businesses do not know what Reddit will actually remove. This plain-language breakdown of Reddit\'s Content Policy tells you exactly what qualifies — and what does not.',
    content: `Reddit's Content Policy is the rulebook that determines what gets removed from the platform. Understanding it is the difference between a successful removal request and weeks of wasted effort.\n\n## What Reddit Will Remove\n\n### Personal Information (Doxxing)\nReddit prohibits posting someone's private information without consent. If a post includes your home address, personal phone number, or private email, this is a strong removal ground.\n\n### Harassment\nContent that constitutes targeted harassment of an individual or organisation — including repeated unwanted contact or coordinated abuse — violates the policy.\n\n### Misinformation About Public Health and Voting\nReddit has specific rules against health and electoral misinformation, though these rarely apply to business reputation cases.\n\n### Impersonation\nImpersonating your brand, your employees, or your executives in a misleading way is a policy violation.\n\n### Illegal Content\nContent that is defamatory under applicable law, or that constitutes an illegal threat, may be removed — though Reddit requires a formal legal notice for most defamation removals.\n\n## What Reddit Will NOT Remove\n\n- Negative but genuine customer reviews\n- Opinions clearly framed as opinions\n- Satire and parody (when clearly labelled)\n- Factually accurate negative coverage\n\n## The Gap: False Factual Claims\n\nThis is where most businesses get stuck. A post stating "Company X stole my deposit and never delivered" may be entirely false — but if it is framed as a personal account, Reddit's platform-level tools have limited reach. This is where moderator outreach and legal notices become the more effective route.\n\nRepShield specialises in cases that fall into this gap. We know which escalation paths work for which types of content, and we only take cases we believe we can win.`,
    metaTitle: "What Reddit's Content Policy Allows You to Remove | RepShield",
    metaDescription: "Plain-language guide to Reddit's Content Policy. Know exactly what qualifies for removal and what doesn't before you file a report.",
    keywords: "reddit content policy, reddit removal policy, what can be removed from reddit, reddit defamation",
    author: 'RepShield Team',
    category: 'guides',
    tags: ['reddit policy', 'content removal', 'defamation'],
    readingTime: 7,
  },
];

async function seedBlogPostsSqlite(client: any): Promise<void> {
  try {
    const result = await client.execute({ sql: 'SELECT COUNT(*) as count FROM blog_posts', args: [] });
    const count = result.rows[0]?.count ?? result.rows[0]?.[0] ?? 0;
    if (Number(count) > 0) return; // already seeded

    const now = Math.floor(Date.now() / 1000);
    for (const post of SEED_POSTS) {
      await client.execute({
        sql: `INSERT INTO blog_posts (title, slug, excerpt, content, meta_title, meta_description, keywords, author, status, category, tags, reading_time, published_at, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?)`,
        args: [
          post.title, post.slug, post.excerpt, post.content,
          post.metaTitle, post.metaDescription, post.keywords,
          post.author, post.category,
          JSON.stringify(post.tags), post.readingTime,
          now, now, now,
        ],
      });
    }
    console.log('✅ Blog posts seeded (3 posts)');
  } catch (err) {
    console.error('❌ Blog seed failed:', err);
  }
}

/**
 * Initialize PostgreSQL tables using CREATE TABLE IF NOT EXISTS
 * Matches the Drizzle schema in shared/schema.ts
 */
async function initializePostgresql(): Promise<void> {
  const sql = postgres(config.url);

  try {
    // Order matters: parent tables first, then tables with foreign keys
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        password VARCHAR,
        role VARCHAR DEFAULT 'user' NOT NULL,
        account_balance VARCHAR DEFAULT '0.00',
        credits_remaining INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        type VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'pending' NOT NULL,
        priority VARCHAR DEFAULT 'standard' NOT NULL,
        assigned_to VARCHAR,
        title TEXT NOT NULL,
        description TEXT,
        reddit_url TEXT,
        amount VARCHAR,
        progress INTEGER DEFAULT 0,
        request_data JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        ticket_id INTEGER REFERENCES tickets(id),
        type VARCHAR NOT NULL,
        amount VARCHAR NOT NULL,
        description TEXT,
        status VARCHAR DEFAULT 'completed' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        token VARCHAR NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_requests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        website TEXT,
        message TEXT,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        reddit_url TEXT NOT NULL,
        email TEXT NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS brand_scan_tickets (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        brand_name TEXT NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS scan_results (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id),
        brand_name VARCHAR NOT NULL,
        scan_type VARCHAR NOT NULL,
        total_mentions INTEGER DEFAULT 0,
        risk_level VARCHAR,
        risk_score INTEGER DEFAULT 0,
        platform_data JSONB,
        processing_time INTEGER,
        scan_id VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        plan_id VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'active' NOT NULL,
        stripe_subscription_id VARCHAR,
        stripe_customer_id VARCHAR,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancelled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS funnel_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR NOT NULL,
        user_id VARCHAR,
        session_id VARCHAR,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        meta_title VARCHAR(60),
        meta_description VARCHAR(160),
        keywords TEXT,
        featured_image VARCHAR,
        author VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'draft',
        category VARCHAR,
        tags TEXT[],
        reading_time INTEGER,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS blog_categories (
        id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(60),
        meta_description VARCHAR(160),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ticket_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id),
        sender_id VARCHAR REFERENCES users(id),
        sender_role VARCHAR NOT NULL,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for common query patterns
    await sql.unsafe(`
      -- User lookups
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      -- Ticket queries
      CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

      -- Admin queue filtering
      CREATE INDEX IF NOT EXISTS idx_audit_requests_processed ON audit_requests(processed);
      CREATE INDEX IF NOT EXISTS idx_quote_requests_processed ON quote_requests(processed);
      CREATE INDEX IF NOT EXISTS idx_brand_scan_tickets_processed ON brand_scan_tickets(processed);
      CREATE INDEX IF NOT EXISTS idx_brand_scan_tickets_email ON brand_scan_tickets(email);

      -- Funnel analytics
      CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type ON funnel_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON funnel_events(created_at);

      -- Blog post lookups
      CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

      -- Password reset token lookups
      CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

      -- Ticket messages
      CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);
    `);

    // Create index on session expire (connect-pg-simple creates the session table itself)
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);
    `).catch(() => {
      // Ignore - session table may not exist yet (connect-pg-simple creates it on first request)
    });

    console.log('✅ PostgreSQL tables initialized');
  } finally {
    await sql.end();
  }
}

async function ensureTable(client: any, tableName: string, createSQL: string): Promise<void> {
  try {
    const result = await client.execute({
      sql: `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      args: [tableName],
    });
    if (result.rows.length === 0) {
      console.log(`📋 Creating ${tableName} table...`);
      await client.execute(createSQL);
      console.log(`✅ ${tableName} table created`);
    } else {
      console.log(`✅ ${tableName} table already exists`);
    }
  } catch (error) {
    console.error(`❌ Error ensuring ${tableName} table:`, error);
  }
}
