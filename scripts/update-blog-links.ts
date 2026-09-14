/**
 * Updates blog post content with improved internal linking.
 * Run with: npx tsx --env-file=.env.seed scripts/update-blog-links.ts
 */
import { db } from '../server/config/database.js';
import { blogPosts } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const updates = [
  {
    slug: "how-to-remove-a-reddit-post",
    content: `Reddit has become one of the most powerful forces in online reputation. A single post can rank on the first page of Google within hours, reach hundreds of thousands of readers, and haunt someone's search results for years. If you're dealing with a harmful Reddit post, you're not alone — and you have options.

## Can Reddit posts be removed?

Yes — but it depends on what the post says and who posted it. Reddit offers several official removal mechanisms, each suited to different situations.

## Option 1: Report the post to Reddit directly

If a post violates Reddit's content policy (harassment, doxxing, spam, illegal content), you can report it using the built-in report button. This works well for clear-cut policy violations but is often ineffective for defamatory content that doesn't break Reddit's rules on its face.

**Success rate:** Low to moderate for reputation-damaging content.

## Option 2: Contact the subreddit moderators

Every subreddit has a team of volunteer moderators. If the post violates subreddit rules — many communities have strict standards around personal attacks or unverified claims — a mod removal request can work quickly.

**Success rate:** Moderate, highly dependent on the subreddit.

## Option 3: Ask the original poster to delete it

If you know the poster or can reach them, a direct, non-confrontational message sometimes works. Avoid legal threats in your first message — they often make people dig in.

**Success rate:** Low to moderate.

## Option 4: Legal removal via DMCA or defamation notice

For false, defamatory content, a formal legal notice submitted to Reddit's trust and safety team is the most reliable path. Reddit is a US company and responds to properly formatted defamation claims and DMCA takedown notices.

This is where professional help pays off. A well-prepared legal submission is far more effective than a user report, and the process requires understanding Reddit's specific escalation routes. [See our pricing](/pricing) — we charge only if the removal succeeds.

**Success rate:** High (90%+) when properly executed.

## The sooner you act, the better

Reddit posts hit peak visibility in the first 72 hours. [How long removal actually takes](/blog/reddit-post-removal-time) depends on the method — professional legal removal typically resolves in 24–72 hours, while DIY options can stretch to weeks or never.

If you're not sure whether a post qualifies for removal, [run a free brand scan](/scan) first — it shows what's ranking and flags harmful content automatically.

If you have a Reddit post that's harming your reputation, the fastest path to removal is a professional case review. We assess eligibility for free and only charge if we succeed.

[Submit your Reddit URL for a free case review →](/contact)`,
  },
  {
    slug: "reddit-defamation",
    content: `False statements of fact published on Reddit can cause serious, measurable harm to your reputation, your business, and your career. When those false statements are shared publicly and indexed by search engines, the damage compounds over time. Here's what you need to know about Reddit defamation and how to act.

## What is defamation?

Defamation is a false statement of fact presented as true that damages another person's reputation. It takes two forms:

- **Libel**: Written or published defamation (which includes Reddit posts)
- **Slander**: Spoken defamation

For a statement to be defamatory, it generally must be:

1. A statement of fact (not opinion)
2. False
3. Published to a third party
4. Damaging to the subject's reputation

Reddit posts tick all four boxes for most situations involving false claims about a person or business.

## Common examples of Reddit defamation

- False accusations of fraud, theft, or illegal activity
- Fabricated customer complaints presented as real experiences
- False claims about product quality or business practices
- Untrue statements about someone's personal character or professional conduct
- Coordinated competitor attacks posing as genuine consumer reviews

## What's NOT defamation

Pure opinion ("I think this company is overpriced") is generally protected. Satire, when clearly labeled, is typically not actionable. Truthful statements, no matter how damaging, are also not defamation.

## How to take action against Reddit defamation

**Step 1: Document everything.** Screenshot the post, URL, upvote count, and date. Use a tool like Archive.org to create a permanent record before it's deleted or edited.

**Step 2: Scan your brand.** Use the [free brand scan](/scan) to see exactly which posts and comments are ranking for your name and how much risk they pose.

**Step 3: Identify the removal mechanism.** Reddit responds to properly formatted legal notices for defamatory content. Direct reports often go unreviewed; legal submissions get escalated. Read the full [step-by-step removal guide](/blog/how-to-remove-a-reddit-post) for each method's success rates.

**Step 4: Consider professional removal.** Legal removal requires a submission that cites the specific defamatory statements, provides evidence of falsity, and follows Reddit's internal escalation process. This is where professional services have a significant advantage over DIY attempts. [See our transparent pricing](/pricing) — you only pay if the content is removed.

**Step 5: Act quickly.** The longer defamatory content remains indexed by Google, the harder it is to contain. Posts that stay up more than a few weeks often appear in searches for months or years afterward.

If you're dealing with a false Reddit post affecting your reputation, submit it for a free case review. We assess eligibility at no cost and only charge if the removal is successful.

[Get a free defamation case review →](/contact)`,
  },
  {
    slug: "reddit-post-removal-time",
    content: `One of the most common questions we hear is: "How long does Reddit post removal take?" The honest answer is: it depends heavily on the method you use. Here's a breakdown of realistic timelines for each approach.

## Method 1: Reddit's standard report system

**Timeline: Days to never**

Using Reddit's built-in report button sends your complaint into a queue reviewed by Reddit's trust & safety team. For clear violations like illegal content or spam, response times can be 24–72 hours. For reputation-damaging content that doesn't obviously break Reddit's rules, reports are often dismissed or go unreviewed entirely.

If you rely solely on user reports for defamatory but non-policy-violating content, you may wait indefinitely.

## Method 2: Subreddit moderator removal

**Timeline: Hours to days**

Subreddit mods can remove posts immediately if they violate subreddit rules. Response time depends on how active the mod team is — major subreddits often have staff checking queues hourly; smaller communities may go days without a review. This path only works if the post genuinely violates the subreddit's specific rules.

## Method 3: The original poster deletes it

**Timeline: Unpredictable**

Asking someone to delete their own post can work — or it can prompt them to double down. This approach is most viable when the original poster has something to lose (e.g., a competitor whose identity you can verify) or when you have an ongoing relationship with them.

## Method 4: Professional legal removal

**Timeline: 24–72 hours in most cases**

This is the fastest and most reliable path for defamatory or harmful content. A professional submission to Reddit's legal and trust & safety team, citing the specific defamatory statements and applicable law, typically receives a response within one to three business days.

Our average resolution time across all cases is 36 hours. Complex cases — multiple posts, cross-posted content, or posts in heavily moderated subreddits — may take up to 7 days. [See our pricing](/pricing) — we only charge after the content is gone.

## Why timing matters

Reddit posts don't stay static. In the first 24–72 hours, a post is at peak visibility — it appears in subreddit feeds, potentially reaches /r/popular, and gets indexed by Google. After 72 hours:

- Google often has a cached version that can persist even after the original post is removed
- The post accumulates replies and cross-posts that extend its footprint
- Users screenshot and re-share the content on other platforms

Every day of delay is another day the content reaches more people. The most effective removals happen within the first 48 hours of a post going live.

## What to do right now

Start by running a [free brand scan](/scan) — it shows which posts are currently ranking for your name, their risk score, and whether they're eligible for removal. If you've identified something harmful, read our [full removal guide](/blog/how-to-remove-a-reddit-post) to understand all your options, or go straight to a case review.

We can typically have a post removed within 24–72 hours of case acceptance. Submit your URL for a free eligibility review — no cost, no commitment.

[Submit your Reddit URL →](/contact)`,
  },
];

async function update() {
  console.log('Updating blog post content with improved internal links...');
  for (const update of updates) {
    try {
      const result = await db
        .update(blogPosts)
        .set({ content: update.content })
        .where(eq(blogPosts.slug, update.slug))
        .returning({ id: blogPosts.id, slug: blogPosts.slug });

      if (result.length > 0) {
        console.log(`✅ Updated: ${result[0].slug} (id ${result[0].id})`);
      } else {
        console.log(`⚠️  Not found: ${update.slug}`);
      }
    } catch (err: any) {
      console.error(`❌ Failed: ${update.slug}`, err.message);
    }
  }
  console.log('Done.');
  process.exit(0);
}

update();
