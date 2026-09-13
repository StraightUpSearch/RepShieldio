# RepShield — SaaS Commercial & Product Optimization Report

**Prepared:** February 2026
**Repository:** RepShieldio
**Stack:** React 18 + Express.js + Drizzle ORM + PostgreSQL/SQLite
**Domain:** Reputation Intelligence SaaS — Reddit Content Removal & Brand Monitoring

---

## 1) Executive Summary

### Commercial Strengths

- **High-intent lead funnel already operational.** The free brand scan captures name, email, company, and brand — four data points before any sales contact. This is structurally sound for a high-ticket service business.
- **Telegram-based admin alerting creates sub-2-hour response loops.** Real-time lead routing to admin Telegram with full scan context (risk level, sentiment, mention count) gives the ops team an edge over competitors relying on CRM queue polling.
- **Dual-path lead qualification** (premium vs. standard) built into the scanner allows immediate triage of leads by conversion intent before human touch.
- **Service pricing anchors aggressively.** $199/comment and $899/post positions RepShield in the premium tier, consistent with the "specialist-driven" brand. The Enterprise tier (custom pricing) opens a ceiling for managed-service contracts.
- **Blog CMS and SEO infrastructure** (sitemap, robots.txt, structured data, meta tags) are production-ready — a distribution channel that most early-stage SaaS tools neglect.

### Core Monetization Risks

1. **Stripe integration is fully deprecated.** There is zero automated payment processing. Every transaction requires manual intervention. This is the single largest monetization bottleneck — it caps throughput at the admin team's bandwidth and introduces friction at the exact moment of purchase intent.
2. **Credit system is scaffolded but non-functional.** The database has `creditsRemaining` and `accountBalance` fields on the users table, and a `transactions` table exists, but no code path reads or writes to these in any meaningful workflow. The entire self-serve revenue tier is unrealized.
3. **Fake scan data in fallback paths.** The brand scanner frontend (`brand-scanner.tsx:211-254`) generates synthetic results with `Math.random()` when the live API path isn't triggered. The comprehensive scan's web platform scanner (`live-scanner.ts:282-289`) also returns random mock data. This means prospects may receive fabricated risk scores, undermining trust if they discover the data isn't real.
4. **Unauthenticated admin endpoints expose all user and order data.** The `/api/data-admin/*` routes require no authentication (`routes.ts:244-309`). Any actor can read the full user list, all orders, and create arbitrary users/orders. This is a critical security vulnerability and a reputational risk for a company selling trust-based services.
5. **No client-facing email on quote delivery.** When a specialist quotes a ticket (`routes.ts:882-886`), there's a `TODO` comment but no email is sent. The client must independently log in and check the dashboard — a conversion killer for a high-ticket service where speed and responsiveness drive close rates.

### Immediate Leverage Opportunities

- Re-enable Stripe (or a comparable processor) for single-click payment on quoted tickets — this alone could increase conversion-to-close by 40-60% based on typical SaaS payment friction data.
- Activate the credit system to create a self-serve revenue stream with near-zero marginal cost per scan.
- Send automated emails at every ticket state transition (pending → quoted → approved → in_progress → completed) to keep prospects engaged without human effort.
- Lock down `/api/data-admin/*` endpoints behind admin authentication immediately.

---

## 2) Product Architecture Review

### Code Structure & Modularity

**Monorepo with clear separation:** The `/client`, `/server`, and `/shared` directories provide a clean boundary. Shared Zod schemas in `/shared/schema.ts` enforce type parity between frontend and backend — this is a strong foundation for rapid iteration.

**Database abstraction is environment-aware but fragile.** The schema file (`shared/schema.ts`) uses runtime `isPostgres` branching to define tables for both SQLite and PostgreSQL. This works for dev/prod parity but doubles the maintenance surface for every schema change and prevents using Postgres-specific features (e.g., full-text search, materialized views) that would improve scan result storage and querying.

**Route file is a monolith.** `server/routes.ts` is 1500+ lines containing all endpoint definitions, business logic, and inline data transformation. Route handlers embed database calls, email triggers, Telegram notifications, and validation in flat procedural blocks. This creates high coupling — a change to the ticket creation flow requires touching multiple scattered locations in a single file.

**Missing service layer.** There is no dedicated service module for core business operations (ticket lifecycle management, credit transactions, user state machines). Business rules are scattered across route handlers, which will cause inconsistencies as endpoints multiply.

### Monetizable Feature Extensions

| Extension | Current State | Revenue Lever |
|-----------|---------------|---------------|
| Credit-based scanning | DB fields exist, no logic | Self-serve revenue at ~90% margin |
| Recurring monitoring subscriptions | Endpoint stub at `/api/monitoring/subscribe`, no Stripe | MRR anchor — the only path to predictable revenue |
| Automated report generation | Manual specialist reply only | AI-templated reports could 10x specialist throughput |
| Multi-platform scanning | Mock data for web platforms | Expand TAM beyond Reddit-only customers |
| API access tier | No external API offering | Enterprise integration revenue |

### Recommended Technical Upgrades

1. **Extract a service layer** (`server/services/`) with dedicated modules: `TicketService`, `CreditService`, `ScanService`, `NotificationService`. Each should own its business logic, emit events for side effects (emails, Telegram), and be independently testable.

2. **Migrate to PostgreSQL-only schema.** Drop SQLite support for production code paths. This unlocks `JSONB` indexing for `requestData` queries (e.g., "find all tickets where risk > 70"), full-text search on scan results, and `LISTEN/NOTIFY` for real-time admin dashboards.

3. **Add a job queue** (BullMQ + Redis or pg-boss). Scans, email sends, and Telegram notifications should be async jobs, not inline `await` calls in route handlers. This prevents request timeouts during scan API failures and enables retry logic.

4. **Implement event sourcing for tickets.** The current model updates ticket status in-place. An event log (`ticket_events` table: ticketId, eventType, data, timestamp) enables audit trails, funnel analytics, and undo capabilities — all features enterprise customers expect.

### Missing Data Pipelines

- **No scan result persistence.** Quick scan results are stored in an in-memory `Map` (`activeScanSessions`) with 1-hour TTL. After cleanup, the data is gone. There is no historical scan database for trend analysis, re-engagement campaigns, or benchmarking.
- **No funnel analytics.** There's no tracking of conversion events (scan → lead form → ticket → quote → payment → completion). Without this data, pricing optimization and CAC analysis are impossible.
- **No usage metering.** If credits are activated, there's no infrastructure to track API calls per user, enforce rate limits by tier, or generate usage-based invoices.

---

## 3) Revenue Optimization Opportunities

### Upgrade Path: Free → Credit → Managed Service

The current architecture supports only two states: free (scan with paywall) and manual-quote (specialist service). The credit tier — the bridge between these — is entirely absent in logic despite existing in schema.

**Recommended credit system implementation:**

```
Free Scan (1/day, 1 platform, blurred results)
    ↓
Starter Credits ($49 for 10 scans — Reddit only, full results, PDF export)
    ↓
Pro Credits ($199/mo — unlimited scans, multi-platform, API access, monitoring alerts)
    ↓
Managed Service (custom pricing — dedicated specialist, SLA, bulk removal)
```

Each tier should gate specific features:

| Feature | Free | Starter | Pro | Managed |
|---------|------|---------|-----|---------|
| Reddit scan | 1/day | 10 credits | Unlimited | Unlimited |
| Full mention URLs | No | Yes | Yes | Yes |
| Sentiment detail | Preview | Full | Full + Historical | Full + Analyst Review |
| PDF report | No | Basic | Branded | Analyst-Signed |
| Multi-platform | No | No | Yes | Yes |
| Monitoring alerts | No | No | Real-time | Real-time + Response |
| Removal service | Quote only | 10% discount | 20% discount | Volume pricing |
| API access | No | No | Yes | Custom SLA |

### Feature Gating Strategy

The current paywall in `brand-scanner.tsx` blurs results with a CSS gradient overlay. This is easily bypassable by inspecting the DOM — the full text content is rendered and merely visually obscured. True feature gating requires server-side enforcement:

- The `/api/live-scan` endpoint should return truncated data for unauthenticated users (mention count + risk level only, no URLs, no content snippets).
- Full scan data should require authentication + credit balance check.
- The frontend paywall becomes cosmetic reinforcement of a server-enforced gate, not the gate itself.

### Usage-Based Pricing Refinements

Current flat-rate pricing ($199/comment, $899/post) leaves money on the table for high-value removals and overprices low-effort ones. Consider:

- **Complexity-based pricing:** Reddit comments in small subreddits (< 10K subscribers) vs. front-page posts in r/technology — these should not cost the same.
- **Urgency surcharge:** 24-hour removal carries a 2x premium over 7-day standard. The database `priority` field already supports this (standard, high, urgent) but pricing doesn't differentiate.
- **Bundle pricing:** "Clean Sweep" packages for brands with 10+ negative mentions — bulk discount with volume commitment.

### AI-Powered Report Upsells

The specialist reply is currently free-text entered by the admin. Templating this with AI-generated reports creates a scalable upsell:

- **Free tier:** Risk score + mention count (automated, zero cost).
- **Credit tier:** AI-generated sentiment report with specific mention analysis, recommended response strategies, and removal priority ranking (automated, near-zero marginal cost).
- **Managed tier:** AI-generated draft + specialist review and sign-off (lower specialist time per report, higher margin).

### Enterprise Tier Opportunities

The Enterprise tier on the pricing page is "contact us" with no further specification. Enterprise buyers need concrete scope:

- **Monitoring SLA:** Guaranteed scan frequency (hourly, daily, weekly) with defined alert thresholds.
- **API access:** Integrate RepShield scanning into their existing brand monitoring stack.
- **Multi-brand support:** Agencies managing multiple client brands need sub-accounts.
- **Compliance reporting:** Exportable audit logs for legal teams.
- **SSO/SAML:** Enterprise auth requirements.

---

## 4) Conversion & Funnel Engineering

### Reducing Friction in Free Scan

**Current flow:** Enter brand name → Wait 3 seconds (fake loading) → See results with blur → Click "Get Full Professional Analysis" → Fill 3-field form → Submit → Confirmation page.

**Issues identified:**

1. **The 3-second fake loading timer** (`brand-scanner.tsx:211`) generates synthetic data client-side when the live API isn't called. This creates a jarring UX disconnect — the "scanning subreddits" animation plays while `Math.random()` runs. If the live API is available, this code path is redundant. If it isn't, the product is delivering fabricated results.

2. **Daily scan limit of 1** is enforced via `localStorage` (`brand-scanner.tsx:193-199`). This is trivially bypassable (clear storage, use incognito). Server-side rate limiting exists but doesn't coordinate with the frontend limit. Recommendation: enforce limits server-side via IP fingerprinting or session tokens; remove the localStorage check.

3. **The lead capture form requires "company" as mandatory.** For solopreneurs, freelancers, and personal brands — a large segment of the ICP — this creates unnecessary friction. Make it optional with a "Personal brand" checkbox that auto-fills the field.

4. **No progressive disclosure.** The user sees blurred results, then must fill a full form. Alternative: show the first mention unblurred, blur the rest, ask for email only to unlock one more, then require full form for the complete report. This micro-commitment ladder increases form completion rates.

### Increasing Perceived Value of Credit Scan

The credit scan doesn't exist yet, but when it does, perceived value is critical:

- **Show the delta.** Display a side-by-side of what the free scan shows vs. what credits unlock — specific URLs, full comment text, author profiles, subreddit traffic data, removal feasibility scores.
- **Historical trending.** "Your brand was mentioned 23 times this month, up 45% from last month." Trending data is inherently more valuable than point-in-time snapshots.
- **Competitive benchmarking.** "Brands in your industry average 15 Reddit mentions. You have 47." This contextualizes risk and creates urgency.

### In-Product Upgrade Triggers

Currently, the only upgrade trigger is the blurred results paywall. Additional triggers:

1. **Post-scan risk alert email** (automated, not specialist): "Your brand risk score is 72/100. 3 high-visibility posts need attention. [View Full Report →]"
2. **Dashboard widget** for logged-in users: "You have 5 unmonitored mentions since your last scan. Upgrade to Pro for real-time alerts."
3. **Ticket completion follow-up:** After a successful removal, offer monitoring: "Content removed. Protect against future posts with automated monitoring — $49/mo."
4. **Time-decayed scan results:** "Your last scan was 30 days ago. Reddit moves fast. [Re-scan now →]"

### Behavioral Nudges

- **Urgency framing on scan results:** "This post has been viewed an estimated X times" (calculate from Reddit upvote ratio and subreddit subscriber count).
- **Social proof on pricing page:** "47 brands protected this month" (derived from completed ticket count in admin stats).
- **Loss aversion on results page:** "Every day this content stays live, an estimated X potential customers see it."

### Trust & Authority Elements

- The current `95%+ success rate` claim on the pricing page has no backing data. Implement a live success counter derived from the `tickets` table: `completedTickets / (completedTickets + failedTickets) * 100`. Display this dynamically.
- **Case study generation:** Each completed ticket (with client permission) becomes a case study asset. The data is already in the system — subreddit, content type, time to resolution, outcome.
- **Specialist profiles:** The admin dashboard assigns specialists, but the client-facing dashboard shows generic "Senior Analyst." Surface real specialist credentials — years of experience, removals completed, specialization areas.

### Ticket-to-Sale Optimization

The current flow has a critical gap between "ticket created" and "sale closed":

1. **No automated follow-up sequence.** After a ticket is created, the only outbound communication is a Telegram message to the admin. If the admin doesn't act within the "2 hours" promise, the lead goes cold with no automated re-engagement.

2. **The specialist reply doesn't trigger a client email** (`routes.ts:882-886` has a `TODO` comment). The client must independently check the dashboard. For a $199-899 purchase, email notification of the quote is table stakes.

3. **No quote expiration.** Quotes sit in perpetuity. Adding a 72-hour expiration with an automated "Your quote expires tomorrow" email creates urgency.

4. **No payment link in quote.** Even when Stripe is re-enabled, the checkout flow should embed a one-click payment link directly in the quote email: "Your specialist recommends removal of [URL]. Cost: $899. [Pay & Start Removal →]"

---

## 5) Competitive Positioning Enhancements

### Differentiation Angles

1. **"Real-time Reddit Intelligence" as a category.** Most ORM (Online Reputation Management) tools are review-site focused (Trustpilot, Google, Yelp). Reddit is underserved because its pseudonymous, community-moderated structure makes removal complex. RepShield's specialization is its moat — lean into it.

2. **Transparency as brand.** The ORM industry has a trust problem. Competitors promise results through opaque methods. RepShield's "100% legal and ethical" positioning should be substantiated with a public methodology page: how removals work, what's possible vs. impossible, typical timelines with real data.

3. **Scan-first GTM.** Most competitors require a sales call before delivering any value. RepShield delivers data (scan results) before asking for money. This is a structural go-to-market advantage — double down by making the free scan genuinely valuable (real data, not mock).

### Data Moat Opportunities

1. **Historical Reddit mention database.** Every scan should persist results. Over time, this creates a proprietary dataset of brand mentions across Reddit — timestamp, subreddit, sentiment, engagement metrics. This data enables trend analysis, industry benchmarking, and predictive risk scoring that competitors cannot replicate without the same scan volume.

2. **Removal success rate by subreddit.** Track which subreddits have the highest removal success rates, average time to removal, and moderator responsiveness. This operational data is a competitive intelligence asset — it enables accurate quoting, prioritization, and client expectation management.

3. **Brand mention velocity index.** Measure the rate of new mentions over time, not just volume. A brand with 10 mentions that appeared in the last 24 hours is a hotter lead than one with 50 mentions over 6 months. This velocity metric could become a proprietary RepShield-specific score.

### Proprietary Scoring Models

The current risk score (`live-scanner.ts:167-207`) uses a basic weighted formula. Enhancements:

- **Subreddit Influence Score:** Weight mentions by subreddit subscriber count, daily active users, and Google search ranking of subreddit.
- **Content Virality Predictor:** Reddit posts follow a predictable lifecycle (surge → plateau → decay). A post that's still gaining upvotes at 24 hours has materially different risk than one that peaked in the first hour.
- **Removal Feasibility Score:** Based on historical success data — content type (post vs. comment), subreddit moderation style, content age, whether it violates Reddit TOS.
- **Financial Impact Estimator:** "This mention is estimated to cost your brand $X in lost revenue based on subreddit traffic, search visibility, and sentiment severity."

### Platform Expansion Beyond Reddit

The codebase already has scaffolding for multi-platform scanning (`webscraping.ts` mentions Twitter, Trustpilot, G2, Capterra, news, forums). Prioritize by:

1. **Glassdoor** — employee reviews directly impact recruiting costs. High willingness-to-pay from HR/People teams.
2. **Google Maps/Business reviews** — local businesses are an entirely different ICP but high volume, lower ticket.
3. **Twitter/X** — brand monitoring, though removal is different (DMCA, defamation claims vs. community moderation).
4. **TikTok** — emerging brand risk surface, very few competitors have scanning capability.

---

## 6) Automation & Internal Efficiency

### Systemizing Ticket Handling

**Current state:** Tickets are created with status `pending`. An admin checks the admin dashboard or receives a Telegram notification. The admin manually reviews the content, writes a report, and updates the ticket via the specialist reply endpoint. There are no SLAs, no automated routing, and no escalation rules.

**Recommended automation:**

1. **Auto-classification on creation.** When a ticket is created, the scan results (if attached) should auto-set priority:
   - Risk score ≥ 70 → priority: `urgent`, SLA: 1 hour
   - Risk score ≥ 40 → priority: `high`, SLA: 4 hours
   - Risk score < 40 → priority: `standard`, SLA: 24 hours

2. **SLA tracking and escalation.** Add `slaDeadline` field to tickets. A background job checks every 15 minutes for tickets approaching SLA breach and sends escalation Telegram messages.

3. **Auto-assignment.** When multiple specialists exist, round-robin or load-balanced assignment based on current open ticket count per specialist.

4. **Status transition automation.** When a ticket moves to `quoted`, automatically email the client. When a ticket is `approved` and payment confirmed, automatically move to `in_progress` and notify the specialist.

### AI-Assisted Internal Review Workflows

The specialist currently does full manual review. AI can reduce review time by 70%:

1. **Pre-analysis on ticket creation.** When a removal request ticket is created with a Reddit URL:
   - Auto-fetch the Reddit content (already have `redditAPI`).
   - Auto-classify: Is this a post or comment? What subreddit? What's the content's age? Does it violate Reddit TOS?
   - Auto-generate a draft quote based on content type and historical pricing.
   - Auto-generate a draft specialist report with removal strategy.

2. **The specialist then reviews, edits, and sends** — reducing their time from 30-60 minutes of analysis to 5-10 minutes of review.

3. **Template library.** Common removal scenarios (defamation, false review, competitor attack, disgruntled employee) should have pre-built report templates that AI populates with case-specific details.

### Report Templating System

The specialist reply field (`notes` in tickets table) is unstructured text. Implement structured report objects:

```json
{
  "contentAnalysis": {
    "type": "post|comment",
    "subreddit": "string",
    "violationsDetected": ["defamation", "tos_violation", "doxxing"],
    "removalFeasibility": "high|medium|low",
    "estimatedTimeline": "24-48 hours"
  },
  "pricingBreakdown": {
    "basePrice": 899,
    "urgencySurcharge": 0,
    "bulkDiscount": 0,
    "total": 899
  },
  "removalStrategy": "string (templated)",
  "clientRecommendations": ["string"],
  "analystSignoff": {
    "name": "string",
    "date": "ISO"
  }
}
```

This structured data enables:
- Consistent client-facing PDF reports (auto-generated from JSON).
- Analytics on pricing patterns, removal types, and success rates.
- AI training data for improving auto-generated reports.

### CRM Integration

The current system is the CRM — tickets are leads are accounts. For scale:

1. **HubSpot/Pipedrive webhook integration.** On ticket creation, push lead to CRM with scan data. On ticket status change, update deal stage. This gives the sales team pipeline visibility without checking two systems.

2. **Lead scoring automation.** Score leads based on: company size (from email domain), risk score, lead type (premium vs. standard), scan engagement (did they click through to results?). Push score to CRM for prioritization.

3. **Email sequence triggers.** CRM-driven sequences:
   - Day 0: "Your scan results are ready" (already exists as Telegram notification, needs email version).
   - Day 1: "Your specialist has reviewed your brand mentions" (on ticket status → quoted).
   - Day 3: "Your quote expires in 72 hours" (if not yet approved).
   - Day 7: "Your brand was mentioned 5 more times this week" (re-engagement).
   - Day 30: "Monthly reputation check-in" (retention / upsell).

---

## 7) Top 10 Commercial Enhancements

### Ranked by Revenue Impact

| Rank | Enhancement | Revenue Impact | Dev Complexity | Strategic Advantage |
|------|-------------|----------------|----------------|---------------------|
| **1** | **Re-enable payment processing (Stripe)** | Critical — currently zero automated revenue collection. Every dollar requires manual intervention. | **Medium** — Stripe SDK was previously integrated; re-implementation with Checkout Sessions, Payment Intents, and webhook handling. | Removes the single largest conversion bottleneck. Enables instant payment on quote acceptance, one-click checkout from email links, and subscription billing for monitoring. |
| **2** | **Activate the credit system for self-serve scanning** | High — creates an entirely new revenue stream at ~90% margin. Even at $49/10 scans, 100 users/month = $4,900 MRR with near-zero ops cost. | **Medium** — Schema exists. Requires: credit purchase flow (Stripe), credit deduction on scan, balance checking middleware, usage tracking. | Transforms RepShield from a services company (linear scaling) to a SaaS company (exponential scaling). Self-serve revenue funds specialist team growth. |
| **3** | **Automated email lifecycle on ticket state transitions** | High — directly increases quote acceptance rate. Currently, clients don't know when their quote is ready unless they check the dashboard. Expected 30-50% lift in quote-to-close. | **Low** — SendGrid is already integrated. Requires 5-6 email templates and trigger logic in ticket status update handlers. | Every ORM competitor sends status emails. Not sending them is actively losing deals. |
| **4** | **Replace mock scan data with real-only data paths** | High — trust is the product. One prospect discovering fabricated scan results destroys credibility and invites public backlash (Reddit is exactly the platform where this would be exposed). | **Low** — Remove the `Math.random()` fallback in `brand-scanner.tsx:211-254` and `live-scanner.ts:282-289`. If the API fails, show "scan temporarily unavailable" instead of fake data. | Protects brand integrity. Real data from real scans is the value proposition — undermining it with fakes is existential risk. |
| **5** | **Persist scan results to database with historical tracking** | High — enables trend analysis upsell, re-engagement campaigns, competitive benchmarking, and a proprietary data moat. Currently, scan data evaporates after 1 hour. | **Medium** — New `scan_results` table, write on every scan, dashboard UI for historical view. | Creates irreplaceable switching cost. Once a user has 6 months of brand mention history in RepShield, migrating to a competitor means losing that data. |
| **6** | **Lock down unauthenticated admin endpoints** | Critical (risk mitigation) — `/api/data-admin/*` currently exposes all users, emails, order data, and allows arbitrary user/order creation without authentication. | **Low** — Add `isAuthenticated` + admin role check middleware to the 4 data-admin endpoints. | A data breach at a reputation management company would be catastrophic. This is a 30-minute fix with outsized risk reduction. |
| **7** | **Implement recurring monitoring subscriptions** | High — the only path to predictable MRR. One-time removals create revenue spikes; monitoring subscriptions create a compounding base. At $49/mo, 200 subscribers = $9,800 MRR. | **High** — Requires Stripe Subscriptions, scheduled scan jobs (cron or job queue), alert thresholds, monitoring dashboard, email/SMS notifications. | Transforms unit economics. LTV shifts from ~$500 (single removal) to $500 + ($49 x average subscription months). Reduces churn by keeping users engaged between removal events. |
| **8** | **AI-assisted specialist report generation** | Medium-High — reduces specialist time per ticket by 70%, directly increasing throughput (more tickets/specialist) and margin (lower cost per ticket). | **Medium** — Integrate an LLM API. On ticket creation with Reddit URL, auto-fetch content, auto-generate draft report with removal strategy, feasibility assessment, and pricing recommendation. Specialist reviews and edits. | Operational leverage. One specialist can handle 5-7x the current ticket volume. This is the difference between needing 10 specialists at $50K revenue/month vs. 2 specialists. |
| **9** | **Funnel analytics and conversion tracking** | Medium — enables data-driven optimization of every conversion point. Without it, pricing changes, funnel modifications, and marketing spend are blind bets. | **Medium** — Event tracking table (`funnel_events`), emit events at: scan_started, scan_completed, lead_form_viewed, lead_form_submitted, ticket_created, quote_sent, quote_accepted, payment_completed, removal_completed. Dashboard or analytics export. | Makes every other optimization on this list measurable. CAC, LTV, and conversion rates become real numbers instead of guesses. |
| **10** | **Multi-platform scanning with real data** | Medium — expands TAM beyond Reddit-only customers. The `webscraping.ts` and `live-scanner.ts` already have the architecture; the web platform scanning just returns mock data. | **High** — Each platform requires a dedicated scraping/API integration (Trustpilot API, Google Places API, Twitter/X API, Glassdoor scraping). Each has different rate limits, data structures, and legal considerations. | Repositions RepShield from "Reddit removal tool" to "brand intelligence platform." Justifies higher pricing tiers and opens enterprise sales where multi-platform coverage is table stakes. |

---

## Appendix: Critical Code References

| Issue | File | Line(s) | Severity |
|-------|------|---------|----------|
| Mock scan data generation | `client/src/components/brand-scanner.tsx` | 211-254 | High |
| Mock web platform data | `server/live-scanner.ts` | 282-289 | High |
| Unauthenticated data-admin endpoints | `server/routes.ts` | 244-309 | Critical |
| Missing client email on quote | `server/routes.ts` | 882-886 | High |
| In-memory scan storage (1hr TTL) | `server/live-scanner.ts` | 37, 79-83, 318-325 | Medium |
| Client-side scan limit (localStorage) | `client/src/components/brand-scanner.tsx` | 193-199 | Medium |
| Hardcoded admin email detection | `server/simple-auth.ts` | (admin role assignment) | Medium |
| Stripe fully deprecated | `server/routes.ts` | 4, 23, 1234 | Critical |
| Credit/balance fields unused | `shared/schema.ts` | 34, 47 | High |
| Duplicate route registrations | `server/routes.ts` | 92/984 (`/api/user/orders`), 129/995 (`/api/user/stats`) | Low |
