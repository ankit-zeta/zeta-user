/**
 * Growth Professional (₹4,000) curriculum definitions.
 * Guided text-based masterclass (~2.5 hours, 12 modules). Resources live
 * in growthResources.ts. Stored in Convex so admins can edit everything.
 */

export interface GrowthLessonDef {
  title: string;
  slug: string;
  content: string;
  durationMinutes: number;
  sortOrder: number;
  isPreview: boolean;
}

export interface GrowthModuleDef {
  title: string;
  description: string;
  sortOrder: number;
  lessons: GrowthLessonDef[];
}

export const GROWTH_PROGRAM_PATCH = {
  duration: "2.5 Hours",
  accessDuration: "Lifetime Access",
  shortDescription:
    "A guided 2.5-hour masterclass that teaches how businesses actually use Meta Ads, Google Ads, content, and SEO to attract customers — and how to plan and test campaigns yourself.",
  description:
    "The Growth Professional Masterclass is a guided, text-based course (approx. 2.5 hours, 12 modules) covering the full digital marketing system: the ecosystem and customer journey, Meta Ads from zero (structure, objectives, audiences, placements, creative), Google Ads (search, keywords, bidding, measurement), deeper SEO, how content becomes viral, advanced (but legitimate) marketing tactics, four complete campaign case studies, analytics with a diagnostic framework, complete funnels, and a practical 7-day marketing challenge. Every module pairs with the 28-file Growth Bundle (campaign planners, worksheets, templates, checklists, and trackers) so you learn by planning real campaigns.",
  whatIncluded: [
    "12 Modules · Guided Text-Based Masterclass (~2.5 hours)",
    "Meta & Google Ads Campaign Planning Templates",
    "28-File Growth Bundle: Paid Ads, SEO, Marketing, Creative & Analytics",
    "Creative Testing System (hooks × creatives × offers)",
    "4 Complete Campaign Case Studies",
    "7-Day Practical Marketing Challenge",
    "Work Marketplace Eligibility",
    "Verified Certificate of Completion",
  ],
  outcomes: [
    "Explain how businesses use Meta, Google, content, and SEO to attract customers",
    "Structure a Meta Ads campaign (Campaign → Ad Set → Ad) for a given objective and budget",
    "Build cold, warm, and hot audiences and choose when to target precisely",
    "Create ads people actually notice, using the creative testing system",
    "Plan a Google Search campaign: keywords, match types, ad groups, landing pages",
    "Apply the analytics diagnostic framework when a campaign underperforms",
  ],
  faqs: [
    {
      question: "What exactly do I get with the Growth Professional Masterclass?",
      answer:
        "You get a guided 2.5-hour text course (12 modules, including 4 full campaign case studies and a 7-day challenge) plus the complete Growth Bundle: 28 downloadable files covering Meta and Google Ads planners, audience research, ad-copy templates, hook and CTA libraries, UGC scripts, SEO worksheets, funnel and offer planners, competitor research, and analytics trackers.",
    },
    {
      question: "Is this program refundable?",
      answer:
        "No. Because access to the course and all digital resources is delivered instantly, the Growth Professional Masterclass is non-refundable and non-returnable. Please review the program contents carefully before purchasing.",
    },
    {
      question: "Do I need prior marketing experience?",
      answer:
        "No. The Growth Masterclass starts from the marketing ecosystem itself and builds up. It goes deep quickly, so completing the Starter Program first is recommended if you are brand new to digital content.",
    },
    {
      question: "How long do I have access?",
      answer:
        "Lifetime access through your ZetaGrow dashboard, including all 28 bundle files and future content updates.",
    },
  ],
};

export const GROWTH_MODULES: GrowthModuleDef[] = [
  {
    title: "Module 1: How Digital Marketing Actually Works",
    description:
      "The ecosystem, the customer journey, offers, and why most campaigns fail before any advertising starts.",
    sortOrder: 1,
    lessons: [
      {
        title: "Lesson 1: How Digital Marketing Actually Works",
        slug: "how-digital-marketing-actually-works",
        durationMinutes: 8,
        sortOrder: 1,
        isPreview: true,
        content: `## How Digital Marketing Actually Works

Digital marketing is not "posting and hoping." It is a system that moves a person from not knowing you exist to paying you. This module builds that system in your head.

### The ecosystem in one picture

- **Owned media** — channels you control: website, email list, WhatsApp channel, social profiles.
- **Paid media** — attention you rent: Meta Ads, Google Ads, YouTube ads.
- **Earned media** — attention you win: shares, reviews, mentions, organic reach.

Most businesses need all three. Paid media is the accelerator; owned media is where the value lives; earned media is proof you are worth it.

### Organic vs paid — the honest difference

- **Organic** is free attention but slow and unpredictable. Great for trust and long-term compounding.
- **Paid** is rented attention: fast, controllable, but it stops the moment you stop paying.
- The skill is knowing **when to spend** — usually to amplify content that already works organically.

### The journey: Awareness → Consideration → Conversion

1. **Awareness** — the person learns you exist (an ad, a reel, a Google search).
2. **Consideration** — the person evaluates you (your page, reviews, content, offer).
3. **Conversion** — the person acts (purchase, lead form, call, checkout).

> **Traffic ≠ Leads ≠ Sales.** Traffic is eyeballs, leads are contact details or intent signals, sales are money. Marketing is the machine that moves people down this chain — every stage needs its own message.

### The two questions that decide everything

**1. What is the offer?** An offer is what the customer gets, for what price, with what guarantee, and why now. Without a clear offer, every ad is a guess.

**2. Who is the target customer?** Not "everyone." A business with one clear customer profile writes sharper ads, picks better placements, and wastes less budget.

### Why campaigns fail before advertising starts

- No clear offer ("learn more about our services")
- No defined customer ("everyone needs this")
- No landing page or next step for the ad to send people to
- No measurement set up, so nothing can be learned

### Real example

A local salon ran ₹20,000 of Meta ads to "get customers." No offer, no booking page — ₹20,000 of awareness. The fix: an offer ("First haircut ₹299 — book today"), a landing page with a booking button, and a lead objective. Same budget, measurable result.

> **Practical (5 min):** Take one hypothetical business (a tutoring academy, a clothing store, a freelancer). Write its customer journey: awareness → consideration → conversion. Who are they? What do they see first? What makes them trust you? Where do they buy? Keep this — you will use it in every later module.`,
      },
    ],
  },
  {
    title: "Module 2: Meta Ads From Zero",
    description:
      "Business Portfolio, Ads Manager, the Campaign → Ad Set → Ad structure, objectives, and a full ₹5,000-budget walkthrough.",
    sortOrder: 2,
    lessons: [
      {
        title: "Lesson 2: Meta Ads From Zero",
        slug: "meta-ads-from-zero",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Meta Ads From Zero

This module teaches the Meta ads system the way Meta itself structures it: objectives, audiences, budget and placements, creative, and campaign analysis.

### The account structure

- **Business Portfolio** (formerly Business Manager) — the container for your business assets: pages, ad accounts, pixels, and team access.
- **Ads Manager** — the tool where campaigns are built and measured.
- **Pixel** (Meta Pixel) — a small code on your website that tells Meta who visited and what they did. Set it up before any conversion campaign.

### The structure: Campaign → Ad Set → Ad

1. **Campaign** — one marketing objective (what you want the ads to achieve).
2. **Ad Set** — who sees the ad, where, when, and for what budget.
3. **Ad** — the actual creative: image/video, text, headline, and CTA button.

> **Golden rule:** One campaign = one objective. Never mix "get sales" and "get likes" in one campaign.

### Campaign objectives (the 6 you must know)

- **Sales** — optimize for purchases or conversions (most important for business).
- **Leads** — collect contacts via forms or messenger.
- **Engagement** — likes, comments, shares.
- **Traffic** — clicks to your website or app.
- **Awareness** — maximum reach and impressions.
- **App promotion** — app installs and activity.

Choose the objective closest to your actual business goal. A "Traffic" campaign does not generate sales; a "Sales" campaign does not guarantee cheap clicks.

### Conversion location

Where does the conversion happen?

- **Website** — requires the Pixel; best for e-commerce and service booking.
- **Messenger / WhatsApp** — conversation-based; strong for service businesses in India.
- **Instant form (Lead Ads)** — lowest friction; Meta hosts the form.

### Ad Set decisions

- **Audience** — who sees it (Module 3 goes deep).
- **Placements** — Meta recommends "Advantage+ placements" (all placements) for most beginners; manually restricting to one placement usually raises costs.
- **Budget** — daily vs lifetime. Start small; never start with your whole month's budget.
- **Schedule** — run always, or during business hours if you need to answer calls/WhatsApp immediately.

### Creative decisions (the Ad level)

- **Creative format** — reel-style video, static image, carousel.
- **Primary text** — the copy people read; hook first, benefit, then CTA.
- **Headline + CTA button** — "Shop Now", "Send WhatsApp Message", "Learn More".

### Case: ₹5,000 budget, digital product

You sell a ₹999 digital course on Excel skills. How do you plan the campaign?

1. **Objective:** Sales (conversions on your payment page). Pixel already installed.
2. **Audience:** Broad + interest in Excel, data entry, office jobs; gender all; age 18–45.
3. **Budget:** ₹500/day for 10 days — enough for ~50–80 test clicks.
4. **Creative:** One reel-style video, hook = "Why your Excel skills are not getting you hired." CTA = "Learn More" → landing page.
5. **Landing page:** Simple page with the offer, price, 3 benefits, and a "Buy" button.
6. **Success number:** If the page converts 2–3% and the click costs ₹60, you need ~₹2,000 for 30–40 clicks to see your first 1–2 sales. The first ₹5,000 is a learning investment, not a profit machine.

> **Practical (10 min):** Open the **Meta Ads Campaign Planning Template** PDF from your dashboard and fill it in for your hypothetical business: objective, budget, schedule, conversion location, and the single most important message.`,
      },
    ],
  },
  {
    title: "Module 3: Meta Audience & Targeting",
    description:
      "Broad, interest, custom, and lookalike audiences; retargeting; exclusions; and when NOT to over-target.",
    sortOrder: 3,
    lessons: [
      {
        title: "Lesson 3: Meta Audience & Targeting",
        slug: "meta-audience-targeting",
        durationMinutes: 12,
        sortOrder: 1,
        isPreview: false,
        content: `## Meta Audience & Targeting

Targeting decides who sees the ad. The most common beginner mistake is over-targeting: too small an audience, too many interests, and no retargeting at all.

### The four audience types

1. **Broad targeting** — Meta finds people using the Pixel data and your creative. Often the best choice for cold audiences; Meta's machine learning needs scale.
2. **Interest targeting** — people who follow or engage with topics (e.g. "digital marketing", "Excel tips"). Useful for niche products, but interests are not intent.
3. **Custom audiences** — people who already interacted: website visitors, video viewers (25%/50%/75%), engaged users (likes/comments/shares), customer lists, and WhatsApp/messenger contacts.
4. **Lookalike audiences** — Meta finds people similar to a custom audience (e.g. your 500 best customers). Great for scaling after you have data.

### The three temperature levels

- **Cold** (never heard of you) — broad or interest targeting. Message: problem → solution → credibility.
- **Warm** (saw content, visited site, engaged) — retargeting with custom audiences. Message: proof, case studies, offer.
- **Hot** (viewed product page, added to cart, replied) — direct offer, urgency, direct CTA.

> **The pattern:** cold audiences get education, warm audiences get proof, hot audiences get the offer. One ad for all three wastes budget.

### Retargeting: the highest-ROI habit

- **Video viewers (50%)** — people who watched half your video are genuinely interested.
- **Website visitors (30–90 days)** — people who clicked but didn't convert.
- **Engaged users (90 days)** — likes, comments, shares, saves.
- **Cart abandoners** — custom audience from Pixel events; retarget with a stronger offer.

### Exclusions and overlap

- **Exclude** people who already purchased (no point paying to show ads to buyers) and exclude audiences you are targeting in another active campaign to avoid overlap.
- **Audience overlap** happens when two ad sets target the same people — they bid against each other and raise your costs. Check the "Audience overlap" tool in Ads Manager.

### When NOT to over-target

- When your audience estimate is under ~500,000 people, broaden it.
- When you have no conversion data yet, let Meta learn with broad targeting.
- When your product serves everyone (local services often serve a whole city), use broad + location + age instead of interest lists.

> **Practical (10 min):** Use the **Audience Research Worksheet** PDF. Build three audiences for your business: **Cold** (broad + 2 interests), **Warm** (video viewers + engaged users), **Hot** (website visitors + cart abandoners). Write the one-line message for each.`,
      },
    ],
  },
  {
    title: "Module 4: Creating Ads That People Actually Notice",
    description:
      "Hooks, structure, formats, visual hierarchy, and the Creative Testing System: 3 hooks × 3 creatives × 2 offers.",
    sortOrder: 4,
    lessons: [
      {
        title: "Lesson 4: Creating Ads That People Actually Notice",
        slug: "creating-ads-people-notice",
        durationMinutes: 18,
        sortOrder: 1,
        isPreview: false,
        content: `## Creating Ads That People Actually Notice

Most ads fail because nobody notices them. This module teaches the anatomy of a working ad — and the testing system that finds winners instead of gambling on one ad.

### The 7 building blocks of a strong ad

1. **Hook** — the first 1–3 seconds (or first line) that stops the scroll: bold claim, question, pattern interrupt, or curiosity gap.
2. **Problem** — name the customer's pain precisely: "Your ads get clicks but no sales."
3. **Curiosity** — open a loop the creative must close: "The reason your ₹5,000 ads returned nothing…"
4. **Demonstration** — show the product or process working: before/after, screen recording, demo clip.
5. **Social proof** — real numbers, testimonials, reviews, follower counts, case results.
6. **Offer** — the concrete deal: price, what's included, guarantee, deadline.
7. **CTA** — one clear next action: "Buy Now", "Send WhatsApp", "Book a Free Call".

### Visual hierarchy

The eye reads: first frame → text overlay → CTA button → primary text. Make the first frame tell the story in 1 second (no logos, no "Welcome"). Use big text overlays — most viewers watch on mute.

### Formats and when to use them

- **Short-form video (reels-style)** — highest engagement; hook in frame one.
- **Static image** — cheap, fast to produce; strong for retargeting and lead forms.
- **Carousel** — 3–10 cards; perfect for step-by-step education and product ranges.
- **UGC-style** — "amateur" look, person holds the product, speaks to camera; builds trust.
- **Founder-style** — the owner tells the story; great for local businesses and personal brands.
- **Testimonial ads** — customer reviews reenacted or screenshotted; the most persuasive for hot audiences.
- **Educational ads** — teach one thing in the ad itself; positions you as the expert and pre-qualifies viewers.

### The Creative Testing System (this is the real secret)

Instead of one ad and hope, build a test matrix:

> **3 hooks × 3 creatives × 2 offers = 18 combinations → test in 2–3 ad sets**

1. Pick 3 hooks from your Hook Library (one claim, one question, one pattern interrupt).
2. Pair them with 3 creatives (e.g. video demo, UGC-style, static carousel).
3. Run 2 offers (e.g. full price vs first-purchase discount).
4. Give each ad set a small equal budget; let it run 3–5 days.
5. Kill the weak creatives, double the budget on the winners, then iterate.

> **The rule:** Never judge an ad in 48 hours and never scale a creative you haven't tested against two others. Creative wins campaigns — targeting only decides who sees them.

### Practical (15 min)

Open the **Creative Brief Template** and **Creative Testing Matrix** PDFs. Write one brief for your hypothetical business: the hook, the problem, the proof, the offer, the CTA, and the formats you'll test. Then fill the 3×3×2 matrix with your combinations.`,
      },
    ],
  },
  {
    title: "Module 5: Google Ads",
    description:
      "The Google Ads ecosystem: Search, Display, YouTube, Shopping — keywords, match types, ad groups, landing pages, bidding, and measurement.",
    sortOrder: 5,
    lessons: [
      {
        title: "Lesson 5: Google Ads",
        slug: "google-ads",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Google Ads

Meta shows ads to people while they browse. Google shows ads to people **while they search** — that intent is the difference. This module gives you the complete working map.

### The ecosystem

- **Search Ads** — text ads on Google results for a keyword. Highest intent; this is where beginners should start.
- **Display Ads** — image/banner ads across websites. Low intent; use for retargeting.
- **YouTube/Video Ads** — in-stream and Shorts ads; great for demos and awareness.
- **Shopping Ads** — product listings with photo and price; essential for e-commerce.

> **Beginner strategy:** Start with Search. It is the most understandable, measurable, and highest-intent traffic in digital marketing.

### Search intent: the heart of Google Ads

Every keyword carries intent:

- **Informational** — "how to edit reels" (no purchase intent — don't spend money here)
- **Commercial** — "best digital marketing course" (comparing — great for ads)
- **Transactional** — "buy excel course online" (ready to buy — your highest-value keyword)

### Keywords and match types

- **Broad** — matches variations and related terms (wide; needs smart bidding).
- **Phrase** — matches the phrase and close variations ("digital marketing course" also matches "online digital marketing course").
- **Exact** — matches the keyword and very close variants only. Best for testing and control.
- **Negative keywords** — terms you exclude ("free", "job", "salary") to stop wasted spend.

### Ad groups and campaign structure

1. **Campaign** → 2. **Ad Groups** (one theme each) → 3. **Ads** + **Keywords**.

Example for a course seller:
- Campaign: "Digital Marketing Course — Search"
- Ad group 1: "digital marketing course" (commercial keywords)
- Ad group 2: "learn digital marketing online" (informational-commercial)

> **Rule:** One ad group = one theme = 5–15 tightly related keywords. Never dump 100 keywords into one ad group.

### Ad copy and the landing page

- Ad: headline 1 = keyword + offer; headline 2 = differentiator ("Lifetime access • Certificate"); description = benefit + CTA.
- **Landing page must match the ad** ("message matching"): same keyword, same offer, same CTA. A generic homepage kills search ads.
- One conversion goal per landing page. Remove navigation that distracts from the action.

### Bidding and quality concepts

- **Bid strategy:** start with "Maximize conversions" (with a target CPA if you have history) or "Maximize clicks" with a max CPC when data is thin.
- **Quality Score** — Google's relevance rating (expected CTR, ad relevance, landing page experience). Higher quality = cheaper clicks. Fix quality issues before raising bids.
- **Conversion tracking** — install the Google tag/conversion action before launching. You cannot optimize what you cannot measure.

### Case walkthrough: "best digital marketing course for beginners"

The marketer thinks:

1. **Keyword** → "best digital marketing course for beginners" — commercial intent.
2. **Intent** → comparing options; wants credibility + price + outcomes.
3. **Ad** → headline "Best Beginner Digital Marketing Course — ₹4,000", description with certificate + lifetime access.
4. **Landing page** → dedicated page: syllabus, outcomes, testimonials, price, one "Enroll" button.
5. **Measurement** → conversion action = purchase, tracked from ad click to checkout.

> **Practical (10 min):** Open the **Google Ads Campaign Planning Template** PDF. For your hypothetical business: write 10 keywords with their match types, 3 negative keywords, 2 ad groups with one ad each, and the landing page message.`,
      },
    ],
  },
  {
    title: "Module 6: SEO That Actually Matters",
    description:
      "Intent, keyword research, long-tail keywords, content clusters, on-page SEO, technical basics, local SEO, and measurement.",
    sortOrder: 6,
    lessons: [
      {
        title: "Lesson 6: SEO That Actually Matters",
        slug: "seo-that-actually-matters",
        durationMinutes: 12,
        sortOrder: 1,
        isPreview: false,
        content: `## SEO That Actually Matters

SEO is the slow, compounding channel: content that earns clicks for months without ad spend. This module goes deeper than the Starter Program's basics.

### Search intent is the filter

Before any keyword work, classify intent:

- **Informational** — "what is digital marketing" → blog content.
- **Commercial** — "best marketing course" → comparison content + ads.
- **Transactional** — "buy marketing course" → product page.

> **Rule:** Match the content type to the intent. A blog post cannot rank for a transactional keyword, and a product page cannot rank for informational queries.

### Keyword research and long-tail keywords

- **Head terms** are competitive ("digital marketing course"). **Long-tail** keywords are specific and winnable: "digital marketing course for beginners in Hindi", "social media marketing course for small business".
- Long-tail = lower volume, higher conversion, faster ranking. Beginners should build long-tail first.
- Use Google autocomplete, "People Also Ask", and competitor pages for ideas.

### Content clusters

Pick one pillar topic ("digital marketing for beginners"). Write 5–8 supporting articles that answer specific sub-questions. Each supporting article links UP to the pillar; the pillar links DOWN to the articles. This structure tells Google you own the topic.

### On-page SEO checklist

- **Title tag** — keyword first, under 60 characters, with a reason to click.
- **Meta description** — 155 characters, benefit + CTA.
- **Heading structure** — one H1 (the keyword), logical H2/H3.
- **Content** — answer the question completely in the first paragraph; use natural keyword variations.
- **Internal links** — link related pages; every page links to at least 2 others.
- **Images** — descriptive file names and alt text.

### Basic technical SEO

- Mobile-friendly, fast-loading pages (compress images).
- Simple URLs: example.com/digital-marketing-course (not ?id=392).
- HTTPS, XML sitemap submitted to Google Search Console.

### Local SEO basics

- Google Business Profile complete and verified (name, address, phone, hours, photos).
- Consistent NAP across the web.
- Reviews: ask every happy customer; reply to all reviews.

### Measuring organic performance

- **Google Search Console** — impressions, clicks, position per page.
- Watch: clicks rising while impressions fall = ranking higher. Impressions rising, clicks flat = title/description needs work.

> **Practical (10 min):** Open the **Keyword Research Worksheet** and **SEO Content Planner** PDFs. Pick one keyword for your hypothetical business, classify its intent, write 5 long-tail variations, and outline a 3-article mini cluster around it.`,
      },
    ],
  },
  {
    title: "Module 7: How Content Goes Viral",
    description:
      "Why people stop scrolling, the Viral Content Framework, and why a 1M-view video can be worth less than a 20K-view one.",
    sortOrder: 7,
    lessons: [
      {
        title: "Lesson 7: How Content Goes Viral",
        slug: "how-content-goes-viral",
        durationMinutes: 12,
        sortOrder: 1,
        isPreview: false,
        content: `## How Content Goes Viral

Virality is not magic and not a button. It is the intersection of a psychological trigger, a strong opening, and content that earns a specific action. This module teaches the framework — honestly.

### Why people stop scrolling

Every scroll is a decision. Content earns attention when it triggers one of:

- **Curiosity** — an open loop: "The 1-second mistake that ruins your reels…"
- **Emotion** — joy, anger, inspiration, fear of missing out.
- **Novelty** — a format, angle, or fact the viewer hasn't seen 40 times this week.
- **Relevance** — "this is literally me" precision targeting of one specific audience.
- **Pattern interruption** — the opposite of what the feed looks like (silence, slow motion, an unexpected visual).

### The Viral Content Framework

> **Hook → Curiosity → Value/Story → Payoff → Share/Action**

1. **Hook (0–3s)** — stop the scroll with one of the triggers above.
2. **Curiosity** — the loop the content must close.
3. **Value/Story** — the middle: teach, entertain, or show a transformation.
4. **Payoff** — deliver the loop: the answer, the reveal, the result.
5. **Share/Action** — ask for the action that matches the value: "Tag someone who needs this", "Save this", "Comment your experience".

### Watch-time and retention

- Algorithms reward completion rate over raw views. Cut every second that doesn't serve the loop.
- **Shareability** — content people share is content that has identity value ("this is me", "this is useful to my friend").
- **Saveability** — checklists and step-by-step content gets saved; saved content gets re-served.
- **Comments** — ask a question only an insider can answer; reply to every comment in the first hour.

### Trends: adapt, don't chase

- A trend is a format people already accept. Adapt it to YOUR niche: same format, your topic, your angle.
- **Timing matters:** ride a trend in its first 3 days or skip it.
- **Cultural relevance** — local language, local references, current events that fit your niche.
- **Content–market fit** — the content must match the audience you actually have. A B2B consultant doing meme trends will confuse their buyers.

### The 1M-views lesson

> A video with 1,000,000 views can generate less business than a 20,000-view video.

Why? Views are not intent. A million views of funny content builds reach but not trust; a 20K-view video watched by your exact customer — who saves it, comments, and clicks your link — generates enquiries and sales. **Measure business outcomes, not view counts.** Reach is vanity; the right 20,000 people are an asset.

> **Practical (10 min):** Open the **Hook Library** PDF. Take one product message for your business and write 5 hooks — one curiosity, one emotion, one novelty, one relevance, one pattern interrupt. Then structure one of them into the full framework: Hook → Curiosity → Value → Payoff → Action.`,
      },
    ],
  },
  {
    title: "Module 8: Marketing Tricks & Advanced Tactics",
    description:
      "Legitimate, less-obvious tactics that work — and the reasoning behind each one.",
    sortOrder: 8,
    lessons: [
      {
        title: "Lesson 8: Marketing Tricks & Advanced Tactics",
        slug: "marketing-tricks-advanced-tactics",
        durationMinutes: 12,
        sortOrder: 1,
        isPreview: false,
        content: `## Marketing Tricks & Advanced Tactics

There are no "secret hacks nobody knows" — but there are dozens of legitimate tactics most beginners never apply. This module teaches the tactics and, more importantly, the reasoning behind them.

### Test the offer before scaling ad spend

The offer is the highest-leverage variable. Before raising budget, change the offer: add a bonus, a discount, a guarantee, a deadline. A better offer with the same ad lifts everything.

### Test creative before blaming targeting

When results disappoint, the instinct is "wrong audience." Usually it's the creative. Change the creative first; keep the audience. Targeting is rarely the problem in the first two weeks.

### Retarget engaged viewers

People who watched 50% of your video are your warmest cold audience. Retarget them within 3 days with proof and the offer while the interest is fresh.

### Build separate messages for cold and warm audiences

Cold: problem + education. Warm: proof + offer. Hot: offer + urgency. One message for everyone is the most common (and most expensive) mistake.

### Use customer objections as ad copy

List every objection you hear ("too expensive", "no time", "won't work for me"). Each objection is an ad angle or a landing-page section. "Too expensive" → "What it actually costs vs what it saves you."

### Turn FAQs into ad creatives

Every genuine question from customers is a content idea: "Can beginners do this?", "How long until results?", "What if I don't like it?" — answer each as a reel, a carousel, or a lead-magnet hook.

### Reuse winning hooks in new creatives

A hook that stopped the scroll is a proven asset. Keep the hook, change the body, the format, or the audience. Do not let a winning hook die with its creative.

### Build creative variations instead of endlessly changing campaigns

Stability wins: keep the campaign and ad sets, and swap creatives in and out. Constant restructuring resets the learning phase and raises costs.

### Analyze competitors' messaging

Once a week, look at competitors' ads (Meta Ad Library is free). Note their hooks, offers, and CTAs. You are not copying — you are learning what the market already responds to.

### Create content around buyer objections

Publish one objection-answering piece per week. It builds trust, feeds your retargeting pool, and gives sales content for hot audiences.

### Use landing-page message matching

The ad and the landing page must feel like one continuous message: same headline, same offer, same CTA. Break this chain and you pay for clicks that leave.

### Reduce steps between ad and conversion

Every extra step (signup forms, "call us for price", multiple pages) leaks conversions. For a lead: name + phone on one page. For a product: one-page checkout.

### Use small-budget experiments before scaling

₹500/day experiments test the idea. ₹5,000/day scales what already works. Never scale a hypothesis; scale results.

### Stop weak creatives instead of emotionally defending them

Your favourite ad is not your best ad. The data decides. Kill it, learn from it, move on.

> **Practical (10 min):** Open the **Optimization Checklist** PDF. List 3 objections your customers voice, write one ad hook for each, and decide which creative variation you will stop defending and replace this week.`,
      },
    ],
  },
  {
    title: "Module 9: Real Campaign Case Studies",
    description:
      "Four complete fictional campaigns: local business, e-commerce, personal brand, and digital product — from audience to metrics.",
    sortOrder: 9,
    lessons: [
      {
        title: "Lesson 9: Real Campaign Case Studies",
        slug: "real-campaign-case-studies",
        durationMinutes: 12,
        sortOrder: 1,
        isPreview: false,
        content: `## Real Campaign Case Studies

Theory is cheap; this module shows four complete campaigns end to end. Each follows: audience → offer → creative → campaign → landing/lead flow → follow-up → metrics. These are realistic fictional examples — the thinking, not the numbers, is what you take.

### Case 1 — Local Business (leads)

- **Business:** "Sharma Fitness Studio", a 6-month-old gym in Jaipur. Goal: 40 trial bookings.
- **Audience:** broad, 18 km radius, ages 20–45, both genders.
- **Offer:** "₹299 — 7-day gym trial + 1 personal training session." Limited to first 100.
- **Creative:** founder-style reel — "Why the first month at the gym is the hardest… and how we make it easy." CTA: "Book Trial".
- **Campaign:** Leads objective, WhatsApp/messenger conversion location, ₹400/day, 10 days.
- **Landing/lead flow:** Lead ad with instant form → automatic WhatsApp template → call within 30 minutes.
- **Follow-up:** Every lead gets a WhatsApp with trial timing, trainer intro, and a reminder 24h before.
- **Metrics:** ₹4,000 spend → 96 leads → 41 showed up → 18 converted to monthly plans (₹1,500/mo). Cost per lead ₹42; cost per member ~₹222.

### Case 2 — E-commerce (purchases)

- **Business:** "Loom & Linen", a home-textile store. Goal: direct sales.
- **Product:** ₹1,899 bedsheet set with ₹200 first-order coupon.
- **Creative:** UGC-style reel — unboxing + side-by-side wash test. Carousel of 4 designs for retargeting.
- **Campaign:** Sales objective, Pixel tracking purchases, broad audience + lookalike of 1,000 buyers, ₹500/day.
- **Retargeting:** cart-abandoners get a 10% discount ad within 24h.
- **Google Search:** "bedsheet set online" exact match, ₹200/day, landing page = product page.
- **Metrics:** Meta ROAS 2.1, Search ROAS 4.3; 60% of sales came from retargeting. Lesson: retargeting carried the revenue.

### Case 3 — Personal Brand (audience + clients)

- **Business:** "Priya", a freelance content writer. Goal: 5,000 followers + 3 clients/month.
- **Content:** 3 reels/week on "content writing for business owners"; one LinkedIn post/week.
- **Organic strategy:** every reel ends with "Follow for weekly writing tips"; replies to every comment.
- **Lead magnet:** "The 7-part Content Checklist" PDF via link in bio.
- **Meta promotion:** boost the 2 best-performing reels per month to a lookalike of engagers, ₹300/day for 3 days.
- **Conversion:** checklist downloads → 3 follow-up DMs/week → discovery call → proposal.
- **Metrics:** ₹5,400/month → 4,100 followers, 320 checklist downloads, 3 clients (₹12,000 total project value). ROAS isn't the goal — client cost per acquisition is.

### Case 4 — Digital Product (qualified sales)

- **Business:** "Hindi Excel Mastery", a ₹999 video course.
- **Funnel:** Content → Ad → Landing Page → Checkout.
- **Content:** weekly shorts "Excel mistake that wastes 2 hours a week".
- **Ad:** video demo reel — hook "Your boss will notice this Excel skill"; retarget viewers at 50%.
- **Landing page:** syllabus, sample lesson, 40+ reviews, price anchor (₹2,999 → ₹999), guarantee details.
- **Checkout:** one-page, UPI + cards, instant access.
- **Metrics:** ₹15,000 spend → 4.2% landing-page conversion → 47 sales (₹46,853 revenue, 3.1x ROAS). Break-even point found on day 6; scaled winning creative ×2.

> **Takeaway across all four:** the winning pattern is always the same — clear audience, clear offer, tested creative, message-matched landing page, and a defined next step for the lead. The platforms differ; the system doesn't.

> **Practical (10 min):** Open the **Campaign Reporting Template** PDF. Pick the case closest to your business and write its full campaign plan in the template, line by line.`,
      },
    ],
  },
  {
    title: "Module 10: Analytics & Optimization",
    description:
      "Every metric that matters — and the diagnostic framework for deciding what to change when a campaign underperforms.",
    sortOrder: 10,
    lessons: [
      {
        title: "Lesson 10: Analytics & Optimization",
        slug: "analytics-optimization",
        durationMinutes: 12,
        sortOrder: 1,
        isPreview: false,
        content: `## Analytics & Optimization

Metrics are only useful when they point at a decision. This module teaches the metric set, then the diagnostic framework that turns numbers into actions.

### The metric set

- **Impressions** — times the ad was shown.
- **Reach** — unique people who saw it.
- **Frequency** — impressions ÷ reach (how many times each person saw it).
- **CPM** — cost per 1,000 impressions (attention price).
- **CTR** — clicks ÷ impressions (message relevance).
- **CPC** — cost per click.
- **CPL** — cost per lead.
- **CPA** — cost per acquisition/sale.
- **Conversion rate** — conversions ÷ clicks or ÷ landing visitors.
- **ROAS** — revenue ÷ ad spend.
- **Engagement** — likes/comments/shares/saves (relationship signal).
- **Retention** — for video: average watch time and completion rate.

### The diagnostic framework

When a campaign underperforms, do not "optimize everything." Diagnose with this logic:

> **Low CTR (below ~0.8–1% for feed ads)?**
> → Creative/message problem. The ad is not earning attention. Change hook, format, or first frame. Do NOT change the audience first.

> **Good CTR but no conversions?**
> → Landing page/offer/conversion problem. People click because the ad works; they leave because the page, offer, or checkout fails. Fix the landing page, the offer, or the steps between.

> **Good conversions but expensive?**
> → Economics/targeting/creative/bidding problem. Check CPM and CPC first: if both are high, creative fatigue or audience saturation; if clicks are cheap but CPA high, the conversion rate is the leak. Then test bidding strategy and exclusions.

> **High frequency + declining performance?**
> → Creative fatigue/audience saturation. Frequency above ~3–4 with falling CTR means the same people have seen the ad too many times. Refresh creative or widen the audience.

### Weekly optimization rhythm

1. Monday: review KPIs against last week (not against last year).
2. Kill or pause anything below your test threshold for 5+ days.
3. Double budget on the top 1–2 performers only.
4. Launch exactly one new test (one variable changed).
5. Record learnings in the KPI tracker — so decisions are memory, not feelings.

> **Practical (10 min):** Open the **KPI Tracker** and **ROAS/CPA Analysis Sheet** PDFs. For your hypothetical campaign, fill in 7 days of realistic numbers and run the diagnostic framework: what would you change, and why?`,
      },
    ],
  },
  {
    title: "Module 11: Building a Complete Marketing Funnel",
    description:
      "Traffic → Landing Page → Lead/Purchase → Follow-up → Retargeting → Repeat Purchase/Referral — demonstrated end to end.",
    sortOrder: 11,
    lessons: [
      {
        title: "Lesson 11: Building a Complete Marketing Funnel",
        slug: "building-complete-marketing-funnel",
        durationMinutes: 6,
        sortOrder: 1,
        isPreview: false,
        content: `## Building a Complete Marketing Funnel

A funnel is the system that turns strangers into customers and customers into repeat buyers. Most businesses run ads with no funnel; this module builds the whole chain.

### The six stages

1. **Traffic** — paid ads + organic content bring people in.
2. **Landing page** — the message-matched destination with ONE action.
3. **Lead / Purchase** — the conversion: a form, a WhatsApp message, a checkout.
4. **Follow-up** — the unsung stage: respond fast, nurture, deliver value, answer objections.
5. **Retargeting** — ads to everyone who didn't convert (they are your warmest audience).
6. **Repeat purchase / Referral** — the profit stage: email/WhatsApp offers, referral rewards, reviews.

> **The leak principle:** every stage leaks. A 2% leak at each of 6 stages removes ~11% of your potential revenue. Fix the biggest leak first — that is where the money is.

### Complete funnel demonstration (service business)

- **Traffic:** Meta Leads ads (₹500/day) + 2 educational reels/week.
- **Landing page:** "Free 15-min strategy call" — headline, 3 benefits, booking calendar. No menu, no links.
- **Lead:** instant form (name + phone only).
- **Follow-up:** WhatsApp within 30 minutes with 2 available slots; reminder before the call.
- **Retargeting:** 3-day retargeting ad for non-responders with a testimonial; 7-day ad for call no-shows with a different angle.
- **Repeat/Referral:** post-call follow-up with a "refer a friend" offer and a review request.

### Common funnel failures (and fixes)

- No follow-up system → leads go cold (fix: templates + speed).
- Retargeting missing → 80% of visitors never see you again (fix: custom audience + retargeting ad set).
- No repeat-purchase plan → every sale starts from zero (fix: email/WhatsApp sequence + referral offer).

> **Practical (10 min):** Open the **Funnel Planner** PDF. Draw the full funnel for your hypothetical business — every stage with its one metric and its one "leak fix" for the next 30 days.`,
      },
    ],
  },
  {
    title: "Module 12: Practical 7-Day Marketing Challenge",
    description:
      "The final assignment: build a complete, launchable campaign plan for a real business in 7 days.",
    sortOrder: 12,
    lessons: [
      {
        title: "Lesson 12: Practical 7-Day Marketing Challenge",
        slug: "practical-7-day-marketing-challenge",
        durationMinutes: 4,
        sortOrder: 1,
        isPreview: false,
        content: `## Practical 7-Day Marketing Challenge

This course is not finished until you have built a complete campaign plan. This challenge turns the last 2.5 hours into one real deliverable. Use the bundle files — every day maps to one worksheet.

### The challenge

**Day 1 — Business + audience.** Choose a real business (yours, a friend's, or a local shop you can observe). Define the target customer in the Customer Persona Template. What is their one problem?

**Day 2 — Research competitors.** Use the Competitor Research Template. Find 3 competitors. What offers do they run? What hooks? What do they miss that you can do better?

**Day 3 — Create the offer.** Offer Worksheet: what does the customer get, for what price, with what guarantee, and why now? Make it specific — "free consultation" is not an offer.

**Day 4 — Create 3 ad concepts.** Hook Library + Creative Brief: one video concept, one static, one carousel/UGC. Write the hook, the value, and the CTA for each.

**Day 5 — Create the campaign structure.** Meta Ads Campaign Planning Template: objective, budget, schedule, audience (cold/warm/hot), placements, naming convention. Fill the same for Google if Search fits your business.

**Day 6 — Create the landing page/message.** Landing-Page Checklist: headline that matches the ad, one CTA, social proof, and a working lead form or checkout step.

**Day 7 — Review metrics and optimize.** KPI Tracker: set your 3 success metrics for week one and your thresholds. Run the diagnostic framework against your plan — what would make you change course?

### Rules

- 30–45 minutes per day is enough. Do not skip days.
- If you have no budget to launch, that's fine — the plan itself is the deliverable, and small experiments (₹500/day) are the next step.
- Share your plan with someone who knows your industry. The feedback loop is part of the process.

> **Completion:** Mark this lesson complete. When all 12 lessons are completed, your verified certificate is issued automatically. Then run Day 1 — the challenge starts today.`,
      },
    ],
  },
];