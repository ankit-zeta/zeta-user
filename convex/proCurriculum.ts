/**
 * Digital Business Pro (₹14,000) curriculum definitions.
 * Guided text-based masterclass (6.5 hours, 18 modules). Resources live
 * in proResources.ts. Stored in Convex so admins can edit everything.
 */

export interface ProLessonDef {
  title: string;
  slug: string;
  content: string;
  durationMinutes: number;
  sortOrder: number;
  isPreview: boolean;
}

export interface ProModuleDef {
  title: string;
  description: string;
  sortOrder: number;
  lessons: ProLessonDef[];
}

export const PRO_PROGRAM_PATCH = {
  name: "Digital Business Pro",
  duration: "6.5 Hours",
  accessDuration: "Lifetime Access",
  shortDescription:
    "A guided 6.5-hour professional masterclass: strategy, offers, branding, websites, SEO, content systems, professional Meta and Google campaigns, funnels, CRM automation, AI operations, sales, agency building, SOPs, finance, and a 30-day implementation project.",
  description:
    "The Digital Business Pro Program is the complete professional system, built as a guided text-based course (18 modules, approx. 6.5 hours). It covers digital business strategy and a business blueprint, a complete offer system (packages, upsells, bundles, risk reduction), brand and professional identity, the full website and landing page system, deep SEO with a 90-day plan, a complete content engine, professional Meta and Google campaign management, four funnel archetypes, automation and CRM with the full lead-to-referral chain, AI-powered business operations with human review, sales and client acquisition, the freelancer-to-agency path, a complete SOP library, analytics and finance with decision frameworks, portfolio building, five real-world case studies, and the 30-day professional implementation project. Every module pairs with the 40-file Pro Resource Library covering Business, Marketing, Ads, SEO, Sales, Operations, and an advanced AI prompt and workflow library.",
  whatIncluded: [
    "18 Modules · Guided Text-Based Masterclass (6.5 Hours)",
    "40-File Pro Resource Library: Business, Marketing, Ads, SEO, Sales, Operations, AI",
    "Advanced AI Business Prompt & Workflow Library",
    "Complete Website & Landing Page System",
    "Complete SOP Template Library",
    "90-Day SEO Roadmap",
    "ZetaGrow Business Suite Access (configurable via Admin Panel)",
    "Work Marketplace Eligibility",
    "Verified Certificate of Completion",
  ],
  outcomes: [
    "Build a complete business blueprint: opportunity, positioning, revenue model, pricing, and plan",
    "Construct a full offer system with packages, upsells, bundles, and risk reduction",
    "Operate the complete customer-facing system: website, landing pages, funnels, CRM, and automation",
    "Run professional Meta and Google campaigns with diagnosis, testing, and scaling",
    "Apply AI workflows with human review across research, content, sales, and operations",
    "Execute the 30-day professional implementation project",
  ],
  faqs: [
    {
      question: "What exactly do I get with the Digital Business Pro Program?",
      answer:
        "A guided 6.5-hour text course (18 modules, including 5 full case studies, 4 funnel archetypes, an analytics decision framework, and a 30-day implementation project) plus the complete Pro Resource Library: 40 downloadable files covering business planning, marketing, Meta and Google ads, SEO, sales, operations, and an advanced AI prompt and workflow library.",
    },
    {
      question: "Is this program refundable?",
      answer:
        "No. Because access to the course and all digital resources is delivered instantly, the Digital Business Pro Program is non-refundable and non-returnable. Please review the program contents carefully before purchasing.",
    },
    {
      question: "What makes this different from the Growth Professional program?",
      answer:
        "This program goes professional: strategy and planning, brand identity, the full website and landing page system, deep SEO with a 90-day roadmap, professional campaign management, CRM and automation architecture, AI-powered operations, the freelancer-to-agency path, SOPs, finance and decision making, portfolio building, and five complete case studies — plus a 40-file resource library and ZetaGrow Business Suite access.",
    },
    {
      question: "How long do I have access?",
      answer:
        "Lifetime access through your ZetaGrow dashboard, including all 40 library files and future content updates.",
    },
  ],
};

export const PRO_MODULES: ProModuleDef[] = [
  {
    title: "Module 1: Digital Business Strategy",
    description:
      "Opportunity, market research, niche, customers, competitors, positioning, business models, value proposition, revenue models, pricing, and a business plan.",
    sortOrder: 1,
    lessons: [
      {
        title: "Lesson 1: Digital Business Strategy",
        slug: "digital-business-strategy",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: true,
        content: `## Digital Business Strategy

Strategy is deciding what to do — and what NOT to do. Every strong digital business started with a blueprint, not a guess.

### Finding a strong business opportunity

A strong opportunity has three marks:

1. **Demand is proven** — people already pay for solutions.
2. **The problem is painful and recurring** — one-time annoyances don't build businesses.
3. **You can reach buyers** — a channel you can afford and control.

Weak signals: "this sounds interesting", "nobody is doing it" (usually nobody wants it), "my friends like it".

### Market research

- **Market size:** how many buyers, what do they spend (top-down), and what do competitors actually earn (bottom-up)?
- **Market growth:** is spend growing? Growing markets forgive mistakes; shrinking markets punish them.
- **Market structure:** who holds the power — a few big players or many small ones? Fragmented markets are the best for a newcomer.

### Niche selection

A niche = intersection of skill, demand, and reach (from the ₹8K program). Go one level deeper: pick a niche where you can become the obvious expert within 6 months. "Digital marketing" is not a niche; "marketing for local gyms" is.

### Customer research

- Interview 5-10 real customers; collect 20+ reviews in their words.
- Build the pains: surface, root, emotional (from the ₹8K program).
- **The buying moment:** what event makes them buy NOW? Strategy lives on buying moments.

### Competitor analysis

- Map 5 competitors: offer, price, positioning, channels, strengths, weaknesses.
- The gap analysis decides your position. Compete where they are weak, not where they are strong.

### Market positioning

Positioning = owning one idea in the customer's mind:

> For [customer], [offer] is the [category] that [outcome], unlike [alternative], because [reason].

Test positioning with three words: **clear, credible, different.**

### Business models

- **Transaction:** sell once (courses, products).
- **Subscription/retainer:** recurring revenue (memberships, retainers).
- **Marketplace/commission:** take a cut (affiliate, marketplace).
- **Service-to-product:** deliver service, productize, then scale.
- **Media:** build audience, monetize via ads/affiliates.

Choose the model before the product: the model decides the metrics that matter.

### Product vs service

- Service: fast cash, low ceiling, sells trust.
- Product: slow build, high ceiling, sells scalability.
- Strategy: start with service to validate, productize what works, then sell both.

### Creating a value proposition

The value proposition is the strategy in one sentence: specific customer + specific problem + specific outcome + why you. Write it, kill every vague word, test it against competitors' pages.

### Revenue models

- One-time, subscription, usage-based, tiered, freemium, commission.
- Stack revenue streams deliberately: core product + upsells + recurring + referral. Each stream is a line in the business plan.

### Pricing strategy

- Price against the value of the outcome, with an anchor.
- Price tiers make the middle the default.
- Price is part of positioning: cheapest, premium, or value — pick one and be consistent.

### Building a simple business plan

One page, five sections:

1. **Opportunity** — problem, market, evidence of demand.
2. **Solution** — offer, positioning, revenue model.
3. **Customer** — persona, buying moment, channels.
4. **Economics** — pricing, margin, break-even, LTV:CAC target.
5. **Plan** — 90-day milestones (this program's modules are the plan).

> **Practical (20 min):** Open the **Business Model Canvas** and **Business Plan Template**. Complete both for your niche. This is your blueprint — every later module feeds into it.`,
      },
    ],
  },
  {
    title: "Module 2: Build a Complete Offer",
    description:
      "Product design, customer problems, features vs benefits, positioning, pricing, packages, upsells, cross-sells, bundles, bonuses, risk reduction, and testing.",
    sortOrder: 2,
    lessons: [
      {
        title: "Lesson 2: Build a Complete Offer",
        slug: "build-a-complete-offer",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Build a Complete Offer

An offer is not a product with a price. It is the complete decision the customer makes: what they get, what it costs, why now, and why not the alternative.

### Product/service design

Design backwards from the outcome:

- What result does the customer want?
- What is the shortest credible path to that result?
- What can they do themselves (the alternative)? Your offer must beat the DIY path, not just competitors.

### Understanding customer problems

Use the three-layer pain model: surface (what they say), root (why it hurts), emotional (what it costs them). The offer must resolve the emotional pain; the surface pain is just the doorway.

### Features vs benefits

Every feature needs a benefit chain (from the ₹8K program): feature → benefit → ultimate benefit. Sell the ultimate benefit; list features as proof.

### Offer positioning

Position the offer in its category: "the complete system" vs "the quick fix". The same product positions differently for beginners vs professionals. Choose one buyer and position for them only.

### Pricing

- Value-based with anchor, tiered, margin-checked (Pricing Calculator).
- Price changes ARE tests: raise for new buyers, grandfather existing ones.

### Packages

Three packages: Basic (core), Standard (recommended, most bought), Premium (full). Each with defined scope, deliverables, and price. The package structure sells the middle one — design the middle deliberately.

### Upsells

- After purchase: offer the next natural step (premium tier, add-on module, done-for-you service).
- Upsell at the moment of maximum satisfaction (after delivery, after a win).
- Never upsell before the core promise is delivered.

### Cross-sells

- Related products for the same customer (a template buyer gets the planner).
- Cross-sells work when they solve the next problem the customer hits after using the core product.

### Bundles

- Combine products into a bundle with a clear discount vs buying separately.
- Bundles raise AOV and reduce decision fatigue.
- Bundle around an outcome, not a discount: "The Complete Launch Kit".

### Bonuses

Bonuses reduce risk, save time, or amplify results (never filler). Each bonus must support the outcome.

### Risk reduction

- Guarantees: money-back, first-result, satisfaction.
- Risk reduction raises conversion more than discounting — it removes the fear, not the value.

### Creating a compelling offer

The full offer statement (from the Offer Builder): outcome, package, price with anchor, bonuses, guarantee, urgency. One paragraph, honesty-checked.

### Offer testing

- Test offers BEFORE scaling ads: change one element (price, guarantee, bonus, package) and measure conversion.
- The offer is the highest-leverage variable: a 2x better offer beats a 2x bigger budget.

> **Practical (20 min):** Open the **Offer Builder**. Build the full offer system: 3 packages, upsell, cross-sell, bundle, bonuses, guarantee. Write the one-paragraph offer statement.`,
      },
    ],
  },
  {
    title: "Module 3: Brand & Professional Identity",
    description:
      "Positioning, voice, visual identity, personal vs company branding, logo, colors, typography, profiles, website identity, credibility, consistency.",
    sortOrder: 3,
    lessons: [
      {
        title: "Lesson 3: Brand & Professional Identity",
        slug: "brand-professional-identity",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Brand & Professional Identity

Branding is not a logo. It is the consistent impression that makes people trust you before they buy.

### Brand positioning

Brand positioning = the same positioning sentence from Module 1, expressed in everything you show. Write the sentence; every brand decision must serve it.

### Brand voice

- Define voice on three scales: formal ↔ friendly, professional ↔ casual, bold ↔ measured.
- Write a voice guide: the words you use, the words you never use, and one example of each content type.
- Consistency of voice is trust: the same person across every platform.

### Visual identity

- **Logo:** simple, readable at small sizes, works in one color. A good logo is memorable, not clever.
- **Colors:** pick 2-3. One primary, one accent, one neutral. Colors carry meaning: green = growth/trust, blue = professional, orange = energy.
- **Typography:** 2 fonts max (one heading, one body). Readability beats decoration.

### Personal vs company branding

- Personal: people buy people. Faster trust, harder to sell or scale.
- Company: scalable, sellable, but needs a personality (the brand voice).
- Best hybrid: a founder-led company brand — the face changes, the brand stays.

### Social profiles

- Same name, same photo, same bio formula across platforms: who you help + what you deliver + proof.
- Complete every field; profiles are landing pages.
- Consistent handles matter for search and referrals.

### Website identity

- The website must feel like the same person as the Instagram and the proposal.
- Header/footer consistency, same voice, same visual system.
- About page = the brand story, written in the brand voice.

### Building credibility

- Proof everywhere: numbers, testimonials, case studies, certifications.
- Consistency over time is the credibility engine: the same message repeated for months compounds.

### Consistency across platforms

- One brand kit: logo files, colors, fonts, voice guide, bio template.
- Audit monthly: any platform that feels different weakens all the others.

> **Practical (15 min):** Open the **Brand Worksheet** and **Brand Voice Guide**. Write your positioning sentence, your voice scales, your colors and fonts, and your bio template. Update your top 2 profiles today.`,
      },
    ],
  },
  {
    title: "Module 4: Complete Website & Landing Page System",
    description:
      "Full customer-facing system: site structure, homepage, about, services, landing pages, lead forms, checkout, contact, FAQ, trust, testimonials, conversion, mobile, basic SEO.",
    sortOrder: 4,
    lessons: [
      {
        title: "Lesson 4: Complete Website & Landing Page System",
        slug: "website-landing-page-system",
        durationMinutes: 25,
        sortOrder: 1,
        isPreview: false,
        content: `## Complete Website & Landing Page System

This module builds the complete customer-facing system: the website (trust and SEO) and the landing pages (conversion), wired together.

### Website structure

The classic structure that builds trust:

1. **Homepage** — who you are, who you help, proof, and one clear next step.
2. **About** — the story, the values, the face.
3. **Services/Products** — what you sell, benefits, prices (or "get price").
4. **Landing pages** — one goal each, for campaigns.
5. **Contact** — easy, with response-time promise.
6. **FAQ** — objections answered in advance.
7. **Legal** — terms, privacy, refund policy.

### Homepage

Sections: headline (promise) → subheadline → proof → who you help → what you offer → how it works → testimonials → FAQ → CTA. One primary CTA.

### About page

Story arc: the problem you saw → what you tried → the moment it worked → what you do now → why it matters. Written in the brand voice.

### Services/products pages

One page per offer: outcome, what's included, price with anchor, guarantee, FAQ, CTA. These pages also serve SEO (each is a keyword target).

### Landing pages

From the ₹8K program: one promise, one CTA, message-matched to the ad, proof near decisions, objections answered, mobile-perfect.

### Lead forms

- Minimum fields (name + contact), clear benefit line above the form, button says what happens next ("Get the Checklist").
- Form → CRM/WhatsApp automatically (Module 10).

### Checkout

- One-page checkout, UPI + cards, order summary visible, instant delivery, receipt.
- Remove every extra step: no forced account creation, no hidden fees.

### Contact & FAQ

- Contact: WhatsApp + form + response-time promise ("reply within 2 hours").
- FAQ: the top 10 objections from research, answered honestly. FAQ pages also win Google rich results.

### Trust sections

- Payment badges, guarantees, certifications, "as featured in", client logos.
- Trust lives near decision points: checkout, CTA, pricing.

### Testimonials

- Specific results, real names, photos where possible.
- Video testimonials convert best; text with numbers second.

### Conversion elements

- One CTA per page, repeated after proof.
- Urgency and scarcity only when honest.
- Exit intent / sticky CTA for long pages (desktop and mobile).

### Mobile optimization

- Mobile-first: single column, big buttons, no popups, fast images, tested on mobile data.

### Basic SEO (website layer)

- Clean URLs, one H1 per page, title + meta per page, alt text, internal links, sitemap submitted (deep dive in Module 5).

### The chain: Ad → Landing Page → Lead/Purchase

Wire everything together: every ad points to a message-matched landing page; the landing page has one action; the action feeds the CRM; the CRM triggers the follow-up sequence (Module 10). Test the chain end to end before spending a rupee on ads.

> **Practical (25 min):** Open the **Website Structure & Landing Page Templates**. Draw your site map (all pages) and build the landing page skeleton for your main offer, including the form fields and the ad it matches.`,
      },
    ],
  },
  {
    title: "Module 5: Complete SEO System",
    description:
      "Keyword research, intent, competitor keyword analysis, topic clusters, content strategy, on-page, technical fundamentals, linking, backlinks, local SEO, YouTube SEO, measurement, Search Console, long-term strategy.",
    sortOrder: 5,
    lessons: [
      {
        title: "Lesson 5: Complete SEO System",
        slug: "complete-seo-system",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Complete SEO System

SEO is the compounding channel: content that earns traffic for months without ad spend. This module builds the complete system — deeper than any previous program.

### Keyword research

- Collect keywords from: autocomplete, People Also Ask, competitor pages, Search Console, keyword tools.
- For every keyword record: intent, volume estimate, difficulty, and business value (does a ranking bring buyers?).

### Search intent

- Informational → articles. Commercial → comparison content + ads. Transactional → product pages + ads.
- **Never** force a keyword into the wrong content type — Google matches intent, not effort.

### Competitor keyword analysis

- For your top 3 competitors: which pages rank for which keywords?
- Find their gaps: keywords they rank weakly for, questions they don't answer, topics they cover badly.
- Their best content is your brief: produce the better version.

### Topic clusters

- Pillar page (broad topic) + supporting articles (specific sub-questions), all linked up/down.
- One cluster per month. Depth beats volume: Google ranks authority per topic, not per page.

### Content strategy

- Map content to the funnel: top (informational, build trust), middle (comparison, build preference), bottom (transactional, convert).
- Update cadence: 80% of effort on high-value topics, not daily filler.

### On-page SEO

- Title (keyword first, <60 chars, click-worthy), meta description (155 chars, benefit + CTA), one H1, logical H2/H3, keyword in the first paragraph, natural variations, images with alt text, internal links (2+ per page).

### Technical SEO fundamentals

- Crawlable: clean URLs, XML sitemap, robots.txt correct, no orphan pages.
- Indexable: canonical tags, no duplicate content, structured data for products/articles/FAQs.
- Fast: compressed images, caching, mobile-first performance.

### Internal linking

- Every page links to 2+ related pages with descriptive anchor text.
- Link from strong pages to weak pages (link equity distribution).
- The pillar links down; the articles link up.

### Backlink concepts

- Backlinks = votes. Quality > quantity: one link from a relevant authority beats 50 directories.
- Earn links by being linkable: original data, templates, case studies, expert quotes.
- Never buy links; they poison the domain.

### Local SEO

- Google Business Profile complete and verified; consistent NAP everywhere; reviews requested and answered; local keywords in content.

### YouTube SEO

- Videos are Google results: keyword in title (first 60 chars), description with keyword + timestamps, tags, thumbnail with text, and playlists (clusters for video).
- Watch time is the ranking signal: hook in 3 seconds, deliver the promise.

### Content optimization

- Refresh winners: update the top 20% of pages quarterly (new data, new examples, better title).
- Optimize titles and CTAs for clicks — impressions are worthless without clicks.

### SEO measurement (Search Console concepts)

- Search Console: impressions, clicks, position, CTR per page.
- Read it: impressions up + clicks down = title problem; position up + impressions flat = relevance problem; clicks up = content working.

### Long-term SEO strategy

- SEO compounds over 6-18 months. The plan: clusters, one per month, refreshed quarterly, measured weekly.

> **Practical (20 min):** Open the **Keyword Research** and **90-Day SEO Roadmap**. Pick your cluster, list 10 keywords with intent, and fill the 90-day roadmap: months 1-3 clusters, on-page fixes, and Search Console checkpoints.`,
      },
    ],
  },
  {
    title: "Module 6: Complete Content & Social Media System",
    description:
      "Strategy, pillars, audience research, short and long-form, reels, shorts, carousels, stories, content types, UGC, repurposing, batch production, calendar, analytics.",
    sortOrder: 6,
    lessons: [
      {
        title: "Lesson 6: Complete Content & Social Media System",
        slug: "content-social-media-system",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Complete Content & Social Media System

Content is the organic engine of the business. The system produces it consistently without burning out.

### Content strategy

- Content serves the funnel: top (awareness), middle (preference), bottom (conversion).
- Choose platforms by where your customer is, not where you like posting.
- The strategy statement: "We publish [format] about [topic] for [customer] so they [outcome]."

### Content pillars

3-5 pillars (from the ₹8K program): education, proof, story, product, culture. 80% teach, 20% sell.

### Audience research for content

- Mine comments, DMs, reviews, and questions for content ideas.
- Track what your audience saves, shares, and asks about — that is the content roadmap.

### Short-form content

- Reels/Shorts/TikTok: hook (0-3s), one idea, payoff, CTA. 30-60 seconds.
- Carousels: one concept, 5-10 cards, one takeaway per card, save-bait design.
- Stories: daily authenticity, polls and questions feed research.

### Long-form content

- YouTube and articles: depth builds authority. One strong long-form piece per week beats five weak ones.
- Structure: hook → teach → example → takeaway → CTA.

### Content types

- **Educational:** teach one thing; the trust-builder.
- **Authority:** data, deep-dives, contrarian-but-true takes; builds expertise signals.
- **Promotional:** offers and launches; convert only after trust.

### UGC

- User-generated content: customers, users, or creators in natural settings.
- UGC outperforms polished ads for trust: real person, real product, one clear promise.

### Content repurposing: the content engine

> **1 idea → 1 long video → 5 short videos → 3 posts → 1 article → 1 email**

The engine: one core piece becomes six-plus pieces across platforms. Never let an idea die after one use.

### Batch production

- Plan (1h/week): ideas under each pillar.
- Produce (one session): film/record everything.
- Edit (one session): cut, caption, thumbnail.
- Schedule (30 min): calendar + automation.

### Content calendar

- Weekly grid: day × pillar × format × platform × CTA.
- Monthly review: what worked, what flopped, next month's themes.

### Analytics

- Per platform: reach, engagement rate, saves, shares, watch time, clicks.
- The metric that matters: clicks to your funnel. Views are awareness; clicks are intent.
- Monthly: kill formats below threshold, double down on winners.

> **Practical (20 min):** Open the **Marketing Calendar** and **Creative Testing Framework**. Fill 2 weeks of the calendar (pillar, format, platform, CTA) and run one idea through the full content engine on paper.`,
      },
    ],
  },
  {
    title: "Module 7: Meta Ads — Professional Campaign Management",
    description:
      "Architecture, objectives, audiences, broad, custom, lookalikes, retargeting, creative and offer testing, budget allocation, tracking, diagnosis, scaling, fatigue, saturation.",
    sortOrder: 7,
    lessons: [
      {
        title: "Lesson 7: Meta Ads — Professional Campaign Management",
        slug: "meta-ads-professional",
        durationMinutes: 25,
        sortOrder: 1,
        isPreview: false,
        content: `## Meta Ads — Professional Campaign Management

Professional Meta management is a system: architecture, testing, diagnosis, and scaling — executed on a calendar, not by mood.

### Campaign architecture

- **Account:** Business Portfolio, one Pixel + Conversions API, naming convention everywhere.
- **Campaign = one objective.** **Ad set = one audience + budget + placement. Ad = one creative + message.**
- Structure the account so any teammate can read it in 30 seconds.

### Objectives

- Sales (conversions), Leads, Traffic, Engagement, Awareness.
- Choose the objective closest to the business result; never mix objectives in one campaign.

### Audiences

- **Broad targeting:** let Meta find buyers using pixel data and creative; best for cold when no data exists.
- **Interest targeting:** only for niche products with proven demand; interests are not intent.
- **Custom audiences:** video viewers (50%+), engaged users, website visitors, customer lists.
- **Lookalikes:** similar people to a custom audience; scale after ~500 conversions.

### Retargeting

- The profit center: video viewers → proof; website visitors → objection-handling; cart abandoners → offer + urgency; buyers → upsells.
- 20-30% of budget belongs to retargeting.

### Creative testing

- The 3×3×2 matrix (hooks × creatives × offers) from the ₹4K program, run professionally: equal budgets, 3-5 days, written decision rules.
- Then iterate winners: same hook/new body, same creative/new offer.

### Offer testing

- Test offers in ads AND on the landing page: price, guarantee, bonus, urgency.
- The offer often beats the creative: a weak offer with a great creative converts nobody.

### Budget allocation

- 50-60% cold prospecting, 20-30% retargeting, 10-20% testing.
- Move budget in 20-30% steps from losers to winners; never overnight doubles.

### Conversion tracking

- Pixel + Conversions API + server-side where possible.
- Key events verified before scaling. Untracked traffic is invisible traffic.

### Campaign diagnosis

The professional diagnostic (from the ₹8K program), in order:

1. Is tracking working?
2. Low CTR → creative problem (hook/first frame).
3. Good CTR, no conversions → landing page/offer problem.
4. High costs → CPC/CPM check, then bidding and exclusions.
5. Frequency > 3-4 with falling CTR → fatigue: refresh creative.
6. Rising CPM after scaling → saturation: new audiences or lookalikes.

### Scaling

- Horizontal: new audiences, placements, formats at same budget.
- Vertical: raise budget 20-30% per step, 2-3 days between steps.
- Scale only tested winners; scaling a hypothesis multiplies a guess.

### Creative fatigue & audience saturation

- Fatigue = same people, same ad, repeated (frequency rising, CTR falling). Fix: refresh creative.
- Saturation = audience exhausted (CPM climbing, reach shrinking). Fix: widen or new lookalikes.

### Performance analysis

- Weekly: CTR, CPL, CPA, ROAS vs thresholds; creative ranking; learnings log.
- Monthly: channel economics vs LTV:CAC; budget reallocation; next test plan.

> **Practical (25 min):** Open the **Meta Campaign Template** and **Testing Matrices**. Build a complete campaign plan: objective, 3 audiences, budget split, creative matrix, tracking checklist, and written kill/scale rules.`,
      },
    ],
  },
  {
    title: "Module 8: Google Ads — Professional Campaign Management",
    description:
      "Search campaigns, keyword research, intent, negatives, structure, ad groups, ad copy, landing pages, tracking, bidding, Shopping, YouTube, Display, retargeting, optimization.",
    sortOrder: 8,
    lessons: [
      {
        title: "Lesson 8: Google Ads — Professional Campaign Management",
        slug: "google-ads-professional",
        durationMinutes: 25,
        sortOrder: 1,
        isPreview: false,
        content: `## Google Ads — Professional Campaign Management

Google Ads rewards precision. The professional runs it as a system of intent, structure, and weekly maintenance.

### Search campaigns

- Search is the highest-intent channel: the person typed the problem.
- One campaign per product category or intent group, with its own budget and goal.

### Keyword research

- Sources: autocomplete, PAA, competitor ads, Search Console, search terms report.
- Record intent for every keyword; spend only where intent matches the goal.

### Search intent

- Transactional ("buy", "price") → ads to product pages.
- Commercial ("best", "vs") → ads to comparison/landing pages with proof.
- Informational ("how to") → content, not ads.

### Negative keywords

- Exclude: "free", "job", "salary", "tutorial", "download", brand names you don't target.
- Weekly ritual: export search terms → promote winners to exact → add losers as negatives.

### Campaign structure

- Campaign → Ad Groups (one theme, 5-15 keywords) → Ads (2-3 per group) → Keywords.
- Exact match for testing; phrase after winners are found.
- Separate budgets for brand vs non-brand.

### Ad copy

- Responsive search ads: 8+ headlines, 4+ descriptions.
- Headline formula: keyword + offer, differentiator, proof, CTA.
- Landing page must mirror the ad (message matching) or quality score and conversion die together.

### Landing pages

- Page matches the ad's promise and the keyword's intent.
- One conversion goal per page; price visible for transactional keywords.

### Conversion tracking

- Conversion actions for every step: purchase, lead, call, signup — with values.
- Offline conversion import for calls/leads that close later.

### Bidding concepts

- Maximize conversions with target CPA when data exists; maximize clicks with max CPC to gather data.
- Quality Score = relevance (expected CTR, ad relevance, landing page). Fix quality before raising bids.

### Shopping concepts

- Product feed with titles, prices, images; Shopping campaigns for e-commerce.
- Feed optimization (title = keyword + attribute) moves more than bid changes.

### YouTube advertising

- In-stream and Shorts ads for demos and awareness; funnel top.
- Retarget YouTube viewers (watched > 50%) on Search/Display.

### Display basics

- Low intent; use for retargeting and brand awareness only.
- Placement exclusions and frequency caps mandatory.

### Retargeting

- Search users who didn't convert → Display/YouTube with proof and offers.
- Remarketing lists for search ads (RLSA): adjust bids for past visitors.

### Optimization

- Weekly: search terms, negatives, bid adjustments, quality score review.
- Monthly: pause 30-day losers, test new headlines, audit landing pages.
- Quarterly: promote proven keywords into dedicated campaigns.

> **Practical (25 min):** Open the **Google Ads Template**. Build your campaign structure: 2 campaigns, 4 ad groups with keywords and negatives, ad copy for each, landing page URLs, and your weekly maintenance ritual.`,
      },
    ],
  },
  {
    title: "Module 9: Advanced Marketing Funnels",
    description:
      "Four funnel archetypes — lead generation, e-commerce, creator, service business — and how to choose the right funnel.",
    sortOrder: 9,
    lessons: [
      {
        title: "Lesson 9: Advanced Marketing Funnels",
        slug: "advanced-marketing-funnels",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Advanced Marketing Funnels

One funnel does not fit all businesses. This module teaches four archetypes and how to choose.

### Funnel 1 — Lead generation

> **Ad → Landing Page → Lead → Follow-up → Sales**

For: services, high-ticket offers, local business, B2B.

- Ad (lead objective) → landing page with lead magnet or quote form → lead enters CRM → automated follow-up → qualified leads get sales conversations.
- Metrics: CPL, lead-to-call rate, call-to-client rate.

### Funnel 2 — E-commerce

> **Ad → Product → Checkout → Purchase → Retargeting**

For: physical and digital products sold directly.

- Ad (sales objective) → product page → one-page checkout → order confirmation + onboarding → retargeting for non-buyers → post-purchase upsell + review ask.
- Metrics: CTR, add-to-cart rate, checkout rate, ROAS, repeat rate.

### Funnel 3 — Creator

> **Content → Audience → Lead Magnet → Email → Product**

For: personal brands, educators, niche content creators.

- Free content builds audience → lead magnet (checklist/guide) captures email/WhatsApp → nurture sequence → product launch to warm list → affiliate/upsell streams.
- Metrics: email capture rate, open rate, launch conversion.

### Funnel 4 — Service business

> **Content/Ads → Inquiry → Qualification → Call → Proposal → Client**

For: agencies, freelancers, consultants.

- Content + ads generate inquiries → qualification (fit, budget, timing) → discovery call → proposal → close → onboarding → retainer/referral.
- Metrics: inquiries, qualified rate, proposal win rate, retainer rate.

### Choosing the right funnel

Ask three questions:

1. **What do you sell?** A product (funnel 2), a service (funnel 4), your expertise (funnel 3), or attention for others (funnel 3)?
2. **What is the buying unit?** Impulse price → funnel 2; considered purchase → funnel 1 or 4.
3. **What do you have?** An audience → funnel 3; a product → funnel 2; capacity to serve → funnel 1/4.

Most businesses run TWO funnels: a lead gen funnel for considered purchases and a product funnel for impulse offers.

### Funnel engineering rules

- One goal per stage; every stage feeds the next automatically.
- The biggest leak decides the fix (fix leaks before adding traffic).
- Map the funnel on paper before building anything digital.

> **Practical (20 min):** Open the **Funnel Templates**. Choose your funnel archetype, draw all stages with one metric each, and write the automated handoff between every stage.`,
      },
    ],
  },
  {
    title: "Module 10: Automation & CRM",
    description:
      "CRM structure, lead management, scoring, segmentation, automated follow-ups, email and WhatsApp workflows, onboarding, reminders, abandoned leads, retargeting, reviews, referrals, retention.",
    sortOrder: 10,
    lessons: [
      {
        title: "Lesson 10: Automation & CRM",
        slug: "automation-crm",
        durationMinutes: 25,
        sortOrder: 1,
        isPreview: false,
        content: `## Automation & CRM

The ₹14K differentiator: a system where every lead is captured, qualified, followed up, and nurtured — automatically.

### CRM structure

- The CRM is the system of record: contacts, sources, statuses, history.
- Stages (pipeline): New → Contacted → Qualified → Proposal → Won / Lost → Onboarding → Active → Repeat.
- Every lead enters at the same stage and moves with every interaction. If it's not in the CRM, it doesn't exist.

### Lead management

- Capture everywhere: forms, WhatsApp, calls, checkout → all into the CRM.
- Ownership rules: every lead has an owner and a response-time target (minutes, not days).

### Lead scoring

Score 1-10 (from the ₹8K program): fit (0-4), intent (0-3), timing (0-3).

- 8+: sales action today.
- 4-7: nurture sequence.
- <4: newsletter.

### Segmentation

- Segment by: source, score, stage, behavior (visited pricing, abandoned cart), and purchase history.
- Every automation and message is written per segment, never "to everyone".

### Automated follow-ups

- The sequence pattern: welcome → value → proof → offer → decision. One goal per message.
- Speed automation: instant acknowledgment, first human touch within the target time.

### Email workflows

- Lead sequence, onboarding sequence, re-engagement sequence, launch sequence.
- One CTA per email; track open, click, reply; kill underperformers.

### WhatsApp workflow concepts

- Instant reply templates for common questions.
- Segmented broadcasts (with consent) for offers and reminders.
- Hot leads automatically routed to sales with full context.

### Customer onboarding

- The moment value is delivered: confirmation → access → quick-start → milestones → check-ins.
- Onboarding sets expectations; expectations set reviews.

### Appointment reminders

- Automated reminders: 24h and 2h before calls.
- No-shows get an automated reschedule offer.

### Abandoned leads

- Leads that went quiet: automatic re-engagement after 3, 7, 14 days with different angles (value → proof → decision).

### Retargeting

- CRM + platform sync: high-intent segments appear in retargeting audiences automatically.

### Review requests

- Automated ask after delivery + 7 days, with a direct link.
- Every review gets a personal reply.

### Referral workflows

- After a positive review: referral offer + shareable link, automated.
- Referral reward delivered automatically on the new customer's first purchase.

### Customer retention

- Milestone messages (90 days, re-purchase windows), re-engagement offers, win-back sequences.
- Retention is the cheapest growth: measure churn monthly.

### The complete chain (example)

> **Ad → Lead → CRM → Automatic qualification → Follow-up → Sales → Onboarding → Review → Referral**

Each arrow is an automation trigger. Build the chain once; it runs forever.

> **Practical (25 min):** Open the **Client Onboarding** and **AI Operations Prompts**. Map your full chain with triggers: capture, scoring, sequence, handoff, onboarding, review, referral.`,
      },
    ],
  },
  {
    title: "Module 11: AI-Powered Business Operations",
    description:
      "AI for research, competitors, content, SEO, ads, sales, support, reports, data analysis, SOPs, proposals, email, product development, workflow automation — with human review.",
    sortOrder: 11,
    lessons: [
      {
        title: "Lesson 11: AI-Powered Business Operations",
        slug: "ai-powered-business-operations",
        durationMinutes: 25,
        sortOrder: 1,
        isPreview: false,
        content: `## AI-Powered Business Operations

Beyond content generation: AI becomes your analyst, drafter, and operator — with one non-negotiable rule: AI drafts, humans decide.

### The operating principle

> **AI → human review → business action**

Every AI use follows this chain. No AI output reaches a customer or a decision without review.

### AI for market research

- Summarize reviews, surveys, and transcripts into pain/outcome lists with counts.
- Generate research questions and interview guides from your goals.

### AI for competitor analysis

- Feed competitor data; get offer/price/positioning maps and gap lists.
- Ask for evidence, not vibes: "quote the page lines that support this."

### AI for content

- Outlines, hooks, drafts, repurposing (long-form → shorts → posts → email).
- Always rewrite in your voice; AI drafts at 80% so you can finish at 100%.

### AI for SEO

- Cluster keywords, draft titles and meta, generate FAQ content, audit content against checklists.
- Fact-check everything: AI invents confidently.

### AI for ads

- Hook and copy variations, creative testing ideas, landing page drafts, campaign summaries.
- Feed it your data (CTR, CPA) and let it suggest hypotheses — then test them.

### AI for sales

- Draft outreach, proposal sections, follow-ups, and objection responses from CRM notes.
- Personalization is the point: feed the AI the lead's context.

### AI for customer support

- Answer known questions from your policy and knowledge base; escalate anything uncertain.
- The bot hands over cleanly; it never invents policies.

### AI for business reports

- Turn raw numbers into weekly summaries with flags and one recommended action.
- The recommendation is a hypothesis until a human reviews it.

### AI for data analysis

- Paste CSV exports; ask for patterns, anomalies, and segment comparisons.
- Verify surprising findings against the raw data before acting.

### AI for SOP creation

- After a task is done once: "Turn my notes into an SOP: steps, owner, trigger, done-when."
- Review and adjust; the AI draft is the first version.

### AI for proposals and email

- Proposal drafts from call notes; email sequences from segment descriptions.
- Final pass is always human — tone, accuracy, promises.

### AI for customer research

- Generate interview scripts, survey questions, and hypothesis lists for your ICP.
- Let AI find themes in your interview notes; verify against raw quotes.

### AI for product development

- Feature lists, launch copy, pricing tier drafts, FAQ generation from beta feedback.

### Workflow automation with AI

- The pattern: trigger → prompt → output → human review (from the ₹8K program).
- Automate one boring task at a time; the goal is fewer decisions, not zero.

### The advanced library

Your toolkit includes the **Advanced AI Prompts** and **AI Business Workflows** libraries: research, marketing, sales, SEO, and operations prompt sets — ready to adapt.

> **Practical (25 min):** Open the **Advanced AI Prompts** and **AI Business Workflows**. Build three workflows (one revenue-facing, one operations, one support) with the review step defined for each.`,
      },
    ],
  },
  {
    title: "Module 12: Sales & Client Acquisition",
    description:
      "Finding customers, qualification, cold and warm outreach, discovery calls, conversations, proposals, objections, follow-up, closing, upselling, retention, referrals.",
    sortOrder: 12,
    lessons: [
      {
        title: "Lesson 12: Sales & Client Acquisition",
        slug: "sales-client-acquisition",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Sales & Client Acquisition

Marketing fills the pipeline; sales converts it. This module covers the complete acquisition skill set — outreach to referral.

### Finding customers

- Where buyers already are: platforms, communities, LinkedIn, WhatsApp groups, referrals.
- The highest-quality source is referral: deliver brilliantly, then ask.
- Content as acquisition: case studies attract the exact buyers you want.

### Lead qualification

- The four gates (from the ₹8K program): problem, budget, authority, timing.
- Never sell to an unqualified lead; disqualifying fast is a skill.

### Cold outreach

- Cold outreach works when it is specific: one sentence about THEIR situation, one reason you reached out, one low-friction ask.
- Formula: "I noticed [their situation]. I help [similar customers] with [outcome]. Can I share how? [one link or 10-minute call]."
- Volume + relevance: 20 targeted messages beat 200 generic ones.

### Warm outreach

- To people who engaged: reference the interaction ("you asked about X on my post").
- Warm outreach converts at multiples of cold — feed it with content.

### Discovery calls

- 70/30 listening; situation → past attempts → costs → desired outcome → qualify.
- Mirror their language; the proposal will use their words.

### Sales conversations

- Sell the outcome in their words; one clear recommendation.
- Silence after the ask is a tool — let them answer.

### Proposals

- One page: problem (their words) → solution → investment (anchor) → guarantee → next step.
- Send same day; follow up on a schedule.

### Objection handling

- Cost: compare to the cost of the problem; guarantee removes risk.
- Think: find the missing clarity or trust, address exactly that.
- "Need to think": give a decision framework, not pressure.

### Follow-up

- The sequence: day 1, day 3 (value), day 7 (proof), day 14 (decision).
- Every follow-up adds value.

### Closing

- Ask directly: "Shall I send the payment link?"
- Make buying easy: one page, UPI + cards, instant delivery.

### Upselling

- After delivery: the next natural step (retainer, premium, bundle).
- Upsell only what genuinely helps.

### Retention

- Onboarding, check-ins, milestone messages, re-engagement offers.
- Retention feeds referrals — the loop closes.

### Referrals

- Ask at the peak of satisfaction; automate the reward.
- Referral customers arrive pre-qualified and pre-trusted.

> **Practical (20 min):** Open the **Outreach Templates**, **Sales Scripts**, and **Objection Handling**. Write your cold outreach message, discovery agenda, and your top-5 objection answers.`,
      },
    ],
  },
  {
    title: "Module 13: Freelancing & Agency Building",
    description:
      "Freelancer → specialist → service packages → small team → agency: services, pricing, acquisition, portfolio, contracts, project management, delegation, outsourcing, QC, reporting, retainers, scaling.",
    sortOrder: 13,
    lessons: [
      {
        title: "Lesson 13: Freelancing & Agency Building",
        slug: "freelancing-agency-building",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Freelancing & Agency Building

The path: freelancer → specialist → packages → small team → agency. Each step is a decision, not a wish.

### The ladder

> **Freelancer → Specialist → Service packages → Small team → Agency**

- Freelancer sells hours. Specialist sells a skill. Packages sell outcomes. The team multiplies delivery. The agency sells the system.

### Choosing services

- One flagship service with proven demand, deliverable by a system.
- Expand only after the flagship is packaged and delivered repeatedly.

### Pricing packages

- 3 packages (basic/standard/premium) with defined scope, deliverables, timeline, revision limits.
- Price by outcome with an anchor; raise every 3-6 months.

### Client acquisition

- Portfolio-driven: case studies do the selling.
- Referrals as the core channel: ask at the peak of satisfaction.
- Outreach (Module 12) for the first clients; content compounds after.

### Portfolio

- 3-5 pieces: problem → what you did → result (numbers).
- Spec work is fine for the first portfolio; results matter more than clients.

### Contracts

- Every project in writing: scope, deliverables, timeline, revisions, payment terms, ownership.
- A one-page contract beats a handshake. No exceptions.

### Project management

- Simple system: project board (to-do, doing, review, done), one owner, weekly client update.
- Tools matter less than the rhythm.

### Delegation & outsourcing

- Document the task (SOP), then hand it over with a checklist.
- Start with the most repetitive task; pay fairly and on time.

### Quality control

- The QC checklist (facts, links, spelling, mobile, brand) before every delivery.
- Second pair of eyes for client-facing work.

### Client reporting

- One-page report: what was done, metrics, next steps.
- Reporting builds retention — clients stay when they see progress.

### Retainers

- Convert one-off projects into monthly retainers: ongoing delivery, fixed fee, priority access.
- Retainers smooth revenue and compound trust.

### Scaling

- Hire for the bottleneck: delivery → sales → operations.
- The agency's product is the system (SOPs, checklists, reporting) — not any single person.

### The ZetaGrow connection

This path connects naturally to the ZetaGrow Work ecosystem: your portfolio, case studies, and verified certificates unlock work opportunities and client-facing credibility.

> **Practical (20 min):** Open the **SOP Library** and **Reporting Templates**. Define your ladder position, your 3 packages, and the first task you will document and delegate.`,
      },
    ],
  },
  {
    title: "Module 14: Business Operations & SOPs",
    description:
      "SOPs for content, marketing, sales, onboarding, delivery, support, reporting, hiring, quality control, and financial tracking — a complete SOP library.",
    sortOrder: 14,
    lessons: [
      {
        title: "Lesson 14: Business Operations & SOPs",
        slug: "business-operations-sops",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Business Operations & SOPs

An SOP is the written system that lets the business run without you in every room. This module builds the complete SOP set.

### The SOP format

Task → owner → trigger → numbered steps → tools → done-when → quality bar → failure modes. (From the ₹8K program.)

### Content SOP

- Trigger: weekly planning.
- Steps: ideas → pick 5 → draft (AI-assisted) → edit → schedule → repurpose into 6 pieces.
- Done-when: week scheduled, hooks and CTAs checked.

### Marketing SOP

- Trigger: campaign launch.
- Steps: offer check → landing page live → tracking verified → creative matrix → budget → launch → diagnosis at day 3-5.
- Done-when: campaign running with review date and decision rules.

### Sales SOP

- Trigger: new lead.
- Steps: capture → score → route (sales/nurture) → sequence → proposal → follow-ups → close → handoff.
- Done-when: every lead has a status and a next action.

### Client onboarding SOP

- Trigger: payment.
- Steps: welcome → intake → kickoff call → plan approval → first milestone.
- Done-when: client onboarded within 48 hours with plan approved.

### Project delivery SOP

- Trigger: kickoff approved.
- Steps: brief → draft → internal QA → client review → revisions (limit) → delivery → feedback.
- Done-when: delivered with summary and QA sign-off.

### Customer support SOP

- Trigger: support message.
- Steps: acknowledge fast → classify → resolve or escalate → log → follow up.
- Done-when: customer confirms resolution.

### Reporting SOP

- Trigger: weekly close.
- Steps: metrics vs thresholds → flags → next actions → one-page report.
- Done-when: report sent with a fix list.

### Hiring SOP

- Trigger: role needed.
- Steps: role brief → candidates → test task → interview → reference → offer → onboarding (SOPs included).
- Done-when: new hire's first week scheduled with training checklist.

### Quality control SOP

- Trigger: before any delivery.
- Steps: checklist → second pair of eyes → approval.
- Done-when: checklist signed off.

### Financial tracking SOP

- Trigger: weekly + monthly.
- Steps: revenue, costs, margin, cash position → compare to plan → flag → decisions.
- Done-when: numbers updated and one decision taken.

### The SOP library

Your toolkit's **SOP Library** contains all ten templates plus client onboarding and quality-control checklists. Write each SOP right after doing the task once; run twice; fix what breaks; review quarterly.

> **Practical (20 min):** Open the **SOP Library** and **Quality-Control Checklists**. Write your first 3 SOPs end to end (marketing, delivery, financial tracking) with done-when for each.`,
      },
    ],
  },
  {
    title: "Module 15: Analytics, Finance & Decision Making",
    description:
      "Revenue, costs, gross margin, CAC, LTV, AOV, ROAS, CPA, CPL, conversion rate, retention, churn, break-even, profitability — and what to change when numbers fail.",
    sortOrder: 15,
    lessons: [
      {
        title: "Lesson 15: Analytics, Finance & Decision Making",
        slug: "analytics-finance-decision-making",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Analytics, Finance & Decision Making

Numbers are the business's immune system. This module connects campaign metrics to business finance — and teaches the decision framework.

### The financial metric set

- **Revenue** — money in. Track by source.
- **Costs** — fixed (rent, tools, team) and variable (per delivery).
- **Gross margin** — revenue minus variable costs, as %. The engine's health.
- **CAC** — all acquisition costs ÷ customers.
- **LTV** — average revenue per customer over the relationship.
- **AOV** — average order value.
- **ROAS** — revenue ÷ ad spend.
- **CPA** — cost per acquisition.
- **CPL** — cost per lead.
- **Conversion rate** — visitors/leads → customers.
- **Retention** — customers who stay.
- **Churn** — customers lost per period.
- **Break-even** — where revenue covers all costs.
- **Profitability** — what's left after everything.

### The decision framework: "What should I change when the numbers aren't working?"

Run the chain in order; change one thing; measure 3-5 days.

**1. Is the tracking real?** Verify events before believing any number.

**2. Is the message wrong?** CTR low → creative/hook problem. Fix the ad, not the audience.

**3. Is the conversion wrong?** CTR fine, no sales → landing page, offer, price, or checkout problem. Fix the page.

**4. Is the cost wrong?** CPC/CPM high → attention is expensive: refresh creative, fix overlap, check exclusions. CPA high with normal CPC → conversion rate is the leak.

**5. Is the scale wrong?** Frequency > 3-4 with falling CTR → fatigue. Rising CPM → saturation. Fix with refresh or new audiences.

**6. Is the economics wrong?** The campaign "works" but the business doesn't: LTV < 3x CAC → fix pricing, retention, or margin before adding traffic. ROAS is a campaign number; LTV:CAC is the business number.

**7. Is the model wrong?** Break-even unreachable after fixes → the offer economics are the problem: raise prices, cut variable costs, or change the model.

### Reading the financials

- Weekly: revenue by source, spend, margins, cash.
- Monthly: full P&L, LTV:CAC, churn, break-even check.
- Compare to plan, not to last month's mood.

### The golden rules

- Profitability first: growth without margin is expensive debt.
- One decision per review; write the decision rule BEFORE the data arrives.
- If you can't explain a number, you can't fix it.

> **Practical (20 min):** Open the **Pricing Calculator** and **Reporting Templates**. Compute your gross margin, break-even CPA, and LTV:CAC. Write the 3 failure modes most likely for your business and the fix for each.`,
      },
    ],
  },
  {
    title: "Module 16: Building a Personal/Professional Portfolio",
    description:
      "Portfolio, case studies, testimonials, results presentation, service page, professional profile, proposal, resume/CV.",
    sortOrder: 16,
    lessons: [
      {
        title: "Lesson 16: Building a Personal/Professional Portfolio",
        slug: "personal-professional-portfolio",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Building a Personal/Professional Portfolio

The portfolio is the bridge between skill and opportunity. This module builds the complete professional presence — including for the ZetaGrow Work ecosystem.

### Portfolio

- 3-5 pieces, each with: problem → your role → what you did → the result (numbers).
- One signature piece per skill; depth beats volume.
- Update it the week a project finishes, not when you need a client.

### Case studies

The case study structure:

1. **Context** — who, what, why.
2. **Problem** — the specific challenge.
3. **Approach** — the decisions and why.
4. **Result** — numbers, before/after.
5. **Reflection** — what you learned.

One great case study outranks ten weak ones.

### Testimonials

- Specific, result-based, named, with permission.
- Ask at the peak of satisfaction; make it one click.
- Spread them across: portfolio, profiles, landing pages, proposals.

### Results presentation

- Numbers first: "raised conversion 34%" beats "improved performance".
- Before/after visuals; one clear headline per piece.
- Show the system you used — clients buy process, not luck.

### Service page

- One page per service: outcome → who it's for → how it works → packages → proof → CTA.
- The service page is a landing page: one goal, one next step.

### Professional profile

- The bio formula: who you help + what you deliver + proof + CTA.
- Consistent across platforms: same photo, same name, same claims.
- Complete every field; profiles are mini landing pages.

### Proposal

- The one-page proposal (Module 12): problem in their words → solution → investment → guarantee → next step.

### Resume/CV

- For job and marketplace applications: outcome-led bullets ("Built X → result Y").
- Match the resume to the role; one page for digital roles.
- Certificates from ZetaGrow programs strengthen the education and skills sections.

> **Practical (15 min):** Draft your portfolio plan: 3 pieces with problems and results, 1 case study outline, your profile bio, and your service page headline.`,
      },
    ],
  },
  {
    title: "Module 17: Real-World Business Case Studies",
    description:
      "Five complete scenarios — local business, e-commerce, creator, freelancer, agency — with the why behind every decision.",
    sortOrder: 17,
    lessons: [
      {
        title: "Lesson 17: Real-World Business Case Studies",
        slug: "real-world-business-case-studies",
        durationMinutes: 25,
        sortOrder: 1,
        isPreview: false,
        content: `## Real-World Business Case Studies

Five complete scenarios. The numbers matter less than the WHY — every decision is explained.

### Case 1 — Local business (₹30K advertising budget)

- **Business:** "Sharma Fitness Studio", Jaipur. Goal: 60 new members in 90 days.
- **The system:**
  - **Research:** trial pricing at competitors was confusing; reviews praised "no pressure" but complained about follow-up.
  - **Offer:** "Rs. 299 for 7-day trial + 1 PT session", limited to 100, with a 24-hour follow-up promise.
  - **Budget split (₹30K):** ₹18K cold prospecting (Leads, 10 km, video reel), ₹7K retargeting (video viewers + engagers), ₹5K testing (offers/creatives).
  - **Funnel:** ad → instant form (name + phone) → WhatsApp auto-reply → call in 30 minutes → trial booking → reminder → post-trial offer.
  - **Why each decision:** cold prospecting feeds the top; retargeting converts the warm; the 24-hour follow-up promise fixed the biggest review complaint.
  - **Result:** 320 leads (₹94 CPL), 150 showed up, 54 joined (₹556 CPA vs ₹1,500 LTV target).
- **Lesson:** the budget was spent on the system, not on ads.

### Case 2 — E-commerce

- **Product:** "Loom & Linen" bedsheets, ₹1,899, UPI/card checkout.
- **The system:** product page → ads (Sales objective, broad + lookalike) → one-page checkout → order confirmation + delivery updates (WhatsApp) → cart-abandon retargeting with 10% offer → post-delivery review ask → repeat-purchase offer at day 30.
- **Why:** broad audiences let Meta learn; retargeting carried 60% of revenue; the day-30 offer attacked churn where the data said repeat buyers were worth 3.2x.
- **Result:** ROAS 2.4, repeat rate 22%, reviews fed the next campaigns.

### Case 3 — Creator

- **Creator:** "Priya", content writer educator. Goal: 50k followers, 3 clients/month.
- **The system:** 3 reels + 1 carousel weekly (education pillar) → free "Content Checklist" lead magnet → email sequence → launch of a Rs. 999 mini-course → affiliate income stream.
- **Why:** the audience asked for the product (research), the lead magnet filtered buyers from followers, and the email list protected her from algorithm changes.
- **Result:** 46k followers, 2,900 downloads, 410 course sales + 2 client retainers.

### Case 4 — Freelancer

- **Freelancer:** "Neha", designer. Skill → portfolio → outreach → client → delivery → retainer.
- **The system:** 4 spec portfolio pieces with results → LinkedIn content + 20 targeted outreach messages/week → discovery call → one-page proposal (same day) → delivery with QC checklist → referral ask → retainer pitch after 2 projects.
- **Why:** the portfolio did the selling, outreach supplied volume, and the retainer pitch landed at the peak of satisfaction.
- **Result:** 6 retainers, Rs. 90k/month, zero platform bidding.

### Case 5 — Digital agency

- **Agency:** "GrowStack", 3-person marketing agency.
- **The system:** lead generation → sales → team → delivery → retention.
- **Lead gen:** niche content (marketing for gyms) + case-study ads → discovery calls.
- **Sales:** qualification gates, one-page proposals, 14-day follow-up sequences.
- **Team:** delivery SOPs, QC checklists, weekly client reports.
- **Retention:** monthly reporting made retainers the default; referrals from every happy client.
- **Why:** each hire followed the bottleneck (delivery first, then sales); SOPs let juniors deliver at senior quality.
- **Result:** 12 retainers, ₹4.2L/month, 2 more hires planned.

> **The universal pattern:** research → offer → funnel → automation → measurement → retention. Every case followed the same skeleton; only the surface differed.

> **Practical (25 min):** Pick the case closest to your business. Write its system as stages with metrics, and mark the WHY of your 3 most important decisions.`,
      },
    ],
  },
  {
    title: "Module 18: 30-Day Professional Implementation Project",
    description:
      "The learner builds their own system: Week 1 strategy, Week 2 build, Week 3 acquire, Week 4 operate.",
    sortOrder: 18,
    lessons: [
      {
        title: "Lesson 18: 30-Day Professional Implementation Project",
        slug: "30-day-professional-implementation",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## 30-Day Professional Implementation Project

The program is complete only when YOUR system exists. This project builds it in 30 days — one week per phase.

### Week 1 — Strategy

- **Day 1:** Niche + opportunity check (skill × demand × reach).
- **Day 2:** Customer research — 3 interviews or 20 reviews; pains in their words.
- **Day 3:** Competitor map — 5 competitors, gaps, positioning sentence.
- **Day 4:** Business Model Canvas complete.
- **Day 5:** Offer system — packages, bonuses, guarantee, upsell.
- **Day 6:** Pricing + break-even CPA + LTV:CAC targets.
- **Day 7:** Business Plan Template — one page, 5 sections.

**Done-when:** the blueprint exists and passes the honesty check.

### Week 2 — Build

- **Day 8:** Brand kit — positioning, voice, colors, fonts.
- **Day 9:** Website structure — sitemap, homepage, about, services.
- **Day 10:** Landing page for the main offer (structure + checklist).
- **Day 11:** Lead form + checkout wired.
- **Day 12:** Content system — pillars, calendar, batch session.
- **Day 13:** Content engine — one idea through all 6 pieces.
- **Day 14:** CRM + pipeline set up; every future lead has a home.

**Done-when:** the customer-facing system is live and testable.

### Week 3 — Acquire

- **Day 15:** SEO cluster planned (keyword research + 90-day roadmap).
- **Day 16:** Meta campaign plan (objective, audiences, budget split, matrix).
- **Day 17:** Google Ads structure (campaigns, ad groups, negatives).
- **Day 18:** Creatives produced (3 hooks × 3 formats).
- **Day 19:** Campaigns launched with tracking verified.
- **Day 20:** Follow-up sequences live (email + WhatsApp).
- **Day 21:** First diagnosis — run the decision framework, change ONE thing.

**Done-when:** traffic is live and leads are entering the CRM.

### Week 4 — Operate

- **Day 22:** Automation — scoring, routing, reminders live.
- **Day 23:** AI workflows — 3 built with human review steps.
- **Day 24:** Sales toolkit — outreach, scripts, proposal, objections.
- **Day 25:** SOPs — marketing, delivery, support, financial tracking.
- **Day 26:** Reporting — weekly one-page report + monthly P&L template.
- **Day 27:** Review/referral workflows automated.
- **Day 28:** Portfolio updated with what you built.
- **Day 29:** Financial review — margin, break-even, LTV:CAC.
- **Day 30:** Month review — wins, losses, next month's one focus.

**Done-when:** the business runs one week without you building anything new.

### The rules

1. 2-3 focused hours daily; miss a day → compress, never skip.
2. Ship imperfect; the first version beats the perfect nothing.
3. Every decision has a review date.
4. AI drafts, you decide.
5. Measure everything; fix the biggest leak first.

> **Completion:** Mark this lesson complete. When all 18 lessons are completed, your verified certificate is issued automatically. Day 1 starts now.`,
      },
    ],
  },
];