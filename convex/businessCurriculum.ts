/**
 * Digital Business Execution (₹8,000) curriculum definitions.
 * Guided text-based masterclass (4 hours, 16 modules). Resources live
 * in businessResources.ts. Stored in Convex so admins can edit everything.
 */

export interface BusinessLessonDef {
  title: string;
  slug: string;
  content: string;
  durationMinutes: number;
  sortOrder: number;
  isPreview: boolean;
}

export interface BusinessModuleDef {
  title: string;
  description: string;
  sortOrder: number;
  lessons: BusinessLessonDef[];
}

export const BUSINESS_PROGRAM_PATCH = {
  name: "Digital Business Execution",
  duration: "4 Hours",
  accessDuration: "Lifetime Access",
  shortDescription:
    "A guided 4-hour business execution masterclass: research, offers, websites, funnels, automation, AI workflows, ads, analytics, sales, and a 30-day implementation plan.",
  description:
    "The Digital Business Execution Program is a guided, text-based course (approx. 4 hours, 16 modules) that takes a complete business from idea to executing marketing system: niche and market research, powerful offer building, high-converting websites and landing pages, complete marketing funnels, marketing automation (email/WhatsApp/CRM), AI workflows for research/content/sales/support, an advanced content system, advanced Meta and Google Ads, full analytics with a diagnostic framework, sales and conversion skills, the freelancer-to-agency path, SOPs and business systems, four real-world case studies, and a complete 30-day implementation plan. Every module pairs with the 24-file Business Execution Toolkit (AI prompts, campaign templates, landing-page templates, sales templates, SOPs, calculators, and the 30-day plan).",
  whatIncluded: [
    "16 Modules · Guided Text-Based Masterclass (4 Hours)",
    "Software & Tools Stack Guide",
    "AI Business Toolkit: Research, Content, Operations Prompts",
    "Meta & Google Campaign Templates",
    "SEO Resources & Content Planners",
    "Landing-Page & Sales Templates",
    "SOP Templates: Onboarding, Delivery, Quality Control",
    "Business Calculators: Pricing, Break-even, LTV/CAC",
    "30-Day Implementation Plan",
    "Work Marketplace Eligibility",
    "Verified Certificate of Completion",
  ],
  outcomes: [
    "Validate a business niche and identify a real customer problem worth solving",
    "Build an irresistible but honest offer with pricing, bonuses, and positioning",
    "Create a high-converting landing page and a complete marketing funnel",
    "Automate leads, follow-ups, and onboarding with email, WhatsApp, and AI workflows",
    "Run advanced Meta and Google campaigns with proper testing and diagnosis",
    "Execute a complete 30-day business implementation plan",
  ],
  faqs: [
    {
      question: "What exactly do I get with the Digital Business Execution Program?",
      answer:
        "A guided 4-hour text course (16 modules, including 4 full case studies, an advanced analytics diagnosis framework, and a 30-day implementation plan) plus the complete Business Execution Toolkit: 24 downloadable files covering the tools stack, AI prompt playbooks, Meta and Google campaign planners, SEO worksheets, landing-page and sales templates, SOPs, business calculators, and the day-by-day 30-day plan.",
    },
    {
      question: "Is this program refundable?",
      answer:
        "No. Because access to the course and all digital resources is delivered instantly, the Digital Business Execution Program is non-refundable and non-returnable. Please review the program contents carefully before purchasing.",
    },
    {
      question: "Do I need to have completed the other programs first?",
      answer:
        "The program assumes you know the fundamentals of digital marketing. Completing the Starter and Growth Professional programs first is strongly recommended so you can move at full speed through ads, analytics, and automation.",
    },
    {
      question: "How long do I have access?",
      answer:
        "Lifetime access through your ZetaGrow dashboard, including all 24 toolkit files and future content updates.",
    },
  ],
};

export const BUSINESS_MODULES: BusinessModuleDef[] = [
  {
    title: "Module 1: Digital Business Foundation",
    description:
      "Niche selection, real problems, customers, competitors, product vs service, offers, pricing basics, and business models.",
    sortOrder: 1,
    lessons: [
      {
        title: "Lesson 1: Digital Business Foundation",
        slug: "digital-business-foundation",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: true,
        content: `## Digital Business Foundation

Every digital business starts the same way: a customer with a problem, and a way to solve it profitably. This module builds that foundation.

### Choosing a niche

A niche is the intersection of three things:

1. **What you can learn/do** (your skills and interests)
2. **What people pay for** (real demand, not just engagement)
3. **What you can reach** (an audience you can access)

> **The niche filter:** If people in the niche are already paying competitors, demand exists. If nobody is paying anyone, you are building a hobby.

### Finding real problems

- **Observe** — where do people complain, ask, or struggle? Forums, review sections, comment sections, customer support threads.
- **Interview** — talk to 5-10 people in the niche. Ask about their last attempt to solve the problem.
- **Search** — Google autocomplete and "People Also Ask" show the questions people actually type.
- **Money trail** — check what competitors sell and at what price. Real problems have paid solutions.

### Understanding customers

- Demographics (age, location, income) tell you who they are; **psychographics** (goals, fears, values) tell you why they buy.
- The buying trigger is emotional: people buy outcomes, not features.
- Write one sentence: "My customer is ___, who wants ___, but struggles with ___."

### Competitor research

- List 3-5 competitors. What do they sell, for how much, and how do they market it?
- Check their reviews: what do customers praise (keep it) and complain about (your opportunity)?
- Note their content and ad angles via Meta Ad Library.

### Product vs service

- **Products** scale without your time (courses, templates, software, digital products) but need more upfront building.
- **Services** sell faster and at higher ticket (done-for-you work) but are capped by your hours.
- The classic path: start with a service, productize it, then sell the product.

### Creating an offer

An offer = what they get + price + bonuses + guarantee + why now. Without a clear offer, no marketing works. Module 3 builds it properly.

### Pricing basics

- **Value-based:** price = the value of the outcome, not the cost of delivery.
- **Anchor:** show a higher reference price so the real price reads as fair.
- **Tiering:** 3 options (basic / standard / premium) makes the middle one the default choice.

### Digital business models

- **Education:** courses, coaching, memberships.
- **Service:** freelancing, agency, done-for-you.
- **Product:** templates, software, digital downloads.
- **Media:** content + ads or affiliates.
- **Marketplace:** connecting buyers and sellers.

> **Practical (10 min):** Write your niche, the problem it solves, the customer sentence, and one competitor you will study. This becomes the backbone of every later module.`,
      },
    ],
  },
  {
    title: "Module 2: Customer & Market Research",
    description:
      "Ideal customer, pain points, competitor analysis, market gaps, and turning research into an offer.",
    sortOrder: 2,
    lessons: [
      {
        title: "Lesson 2: Customer & Market Research",
        slug: "customer-market-research",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Customer & Market Research

Research is not a one-time task; it is the raw material for every message, offer, and ad you will ever write.

### Finding your ideal customer

- **Ideal Customer Profile (ICP):** the specific type of person your offer fits best. Not "everyone" — one clear profile.
- Build it from: existing customers (best source), competitor customers (reviews and comments), and your own hypothesis (test it).
- Score customers by: problem severity, budget, buying frequency, and accessibility.

### Customer pain points

Collect pains in three buckets:

- **Surface pain** — what they say out loud: "ads are too expensive."
- **Root pain** — why it hurts: "every rupee wasted means less stock I can buy."
- **Emotional pain** — what it costs them: "I feel like a failure when the campaign flops."

> **Rule:** Sell to the root and emotional pain. Surface pain is where competitors fight; the deeper pain is where you win.

### Customer research methods

1. **Interviews (best):** 5-10 short calls. Ask about their last attempt, what they tried, what they spent, what stopped them.
2. **Reviews:** read competitor reviews for exact language customers use.
3. **Social listening:** comments, DMs, community groups, Reddit, Quora.
4. **Search data:** autocomplete, People Also Ask, keyword tools.
5. **Surveys:** quick polls in your audience with open questions.

### Competitor analysis

- Map each competitor: offer, price, positioning, strengths, weaknesses.
- The weakness list is your positioning map: pick the gap you can own ("faster delivery", "for beginners", "local language", "lifetime updates").

### Market gaps

A gap exists when: demand is proven (people pay) AND supply is weak (competitors are generic, outdated, or absent in a segment). Segments to check: geography, language, audience (beginners/advanced), format (course/template/service), and price tier.

### Search & social research

- **Search:** what people type = what they want. High-intent keywords reveal buying moments.
- **Social:** what people engage with = what resonates. Study formats and hooks in your niche.
- Combine: search tells you WHAT they want; social tells you HOW they want it presented.

### Turning research into an offer

The output of research is one page:

- Problem statement (in the customer's own words)
- Desired outcome
- Current alternatives and their flaws
- Your angle (the gap you own)
- Willingness-to-pay signals

That page becomes your offer brief — the input for Module 3.

> **Practical (10 min):** Open the **Customer Persona Template** from your toolkit. Fill it for your niche using real review language. Write one root pain and one emotional pain in the customer's own words.`,
      },
    ],
  },
  {
    title: "Module 3: Build a Powerful Offer",
    description:
      "Value proposition, features vs benefits, packaging, pricing, bonuses, positioning, and honest irresistibility.",
    sortOrder: 3,
    lessons: [
      {
        title: "Lesson 3: Build a Powerful Offer",
        slug: "build-a-powerful-offer",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Build a Powerful Offer

The offer is the single highest-leverage element in your business. A great offer with average marketing beats average offers with great marketing.

### Value proposition

The value proposition answers: "Why should this specific customer choose me over the alternative?" Formula:

> For [customer], who [problem], [offer] is the [category] that [outcome], unlike [alternative], because [reason].

### Features vs benefits

- **Feature:** what it is ("24 modules").
- **Benefit:** what it does for them ("go from confused to a full campaign plan in 4 hours").
- **Ultimate benefit:** how it makes them feel ("walk into work confident").
- Sell benefits; use features as proof. Every feature needs its benefit line.

### Packaging

- Group the outcome into a clear package: main deliverable + supporting elements (templates, community, updates).
- Name the package (naming creates value): "Business Execution Program" sells better than "Digital Course 2".
- Three tiers (basic / recommended / premium) — most buyers pick the middle. Price the middle deliberately.

### Pricing

- **Value-based pricing:** price against the value of the outcome, not your effort.
- **Anchor:** show the reference value (sum of everything separately) above the real price.
- **Rules:** price high enough to matter (free customers don't value what they don't pay for), and test price changes rather than guessing.

### Bonuses

Bonuses should: reduce risk, save time, or increase the result. Never add filler "worth Rs. X" junk — the bonus must support the outcome or it cheapens the offer.

### Positioning

Positioning = owning one specific idea in the customer's mind:

- Against whom: "for beginners" vs "for agency owners"
- Against what: "the only one in Hindi" / "the only one with templates"
- One sentence only. If you cannot say it, neither can your customers.

### Creating an irresistible but honest offer

The honest formula:

1. Specific outcome (measured, not vague)
2. Clear price with anchor
3. Guarantee that removes the real risk
4. One reason to act now (deadline, spots, launch)
5. Proof (results, reviews, numbers)

> **Honesty rule:** never promise what the offer cannot deliver. An honest offer converts slower at first and compounds forever; a fake one converts fast and dies.

> **Practical (10 min):** Open the **Offer Builder** template. Write the full offer statement: outcome, package, price with anchor, bonuses, guarantee, and urgency. If it fits in one paragraph, it is ready.`,
      },
    ],
  },
  {
    title: "Module 4: Website & Landing Pages",
    description:
      "Website vs landing page, high-converting structure, headlines, benefits, social proof, objections, CTA, mobile.",
    sortOrder: 4,
    lessons: [
      {
        title: "Lesson 4: Website & Landing Pages",
        slug: "website-landing-pages",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Website & Landing Pages

Your pages are where marketing money becomes customers — or leaks away. This module builds both a website and landing pages that convert.

### Website vs landing page

- **Website:** many pages, many goals, builds long-term trust and SEO.
- **Landing page:** one page, one goal, built for conversion. No navigation, no distractions.
- **Rule:** ads and campaigns point to landing pages; your website is the base of the funnel.

### High-converting structure (top to bottom)

1. **Headline** — the promise, matching the ad that brought them (message matching).
2. **Subheadline** — one line that expands the promise.
3. **Hero visual** — the product or result, not stock abstract.
4. **Proof** — numbers, testimonials, logos, reviews (early; do not hide it).
5. **Problem/agitate** — name their pain in their words.
6. **Solution** — how your offer solves it (benefits first, features as proof).
7. **Objection handling** — FAQ block answering real objections.
8. **Offer recap + CTA** — price, what's included, guarantee, the button.
9. **Final CTA + guarantee** — repeat the action and remove risk.

### Headlines

- One promise per page. "Get More Customers" is a wish; "Get Your First 10 Customers in 30 Days" is a promise.
- Put the customer's outcome first, your name later.
- A/B test headlines: they change conversion more than any other element.

### Benefits and social proof

- Benefits: the outcome, the speed, the ease, the risk removed.
- Proof hierarchy: real numbers > named testimonials > screenshots > generic claims.
- Place proof next to the decision point (near the CTA), not just at the bottom.

### Objection handling

List every objection from research and answer each honestly in an FAQ:

- "Too expensive" -> cost vs value breakdown or installment option.
- "No time" -> time commitment made explicit.
- "Won't work for me" -> who it's for, who it's not for (this builds trust).

### CTA

- One primary CTA per page. Action verb + outcome: "Enroll Now — Start Today".
- Repeat the CTA after proof and after the FAQ.
- The button must be visible without scrolling on mobile.

### Mobile optimization

- Most traffic is mobile: test on a real phone, on mobile data.
- Big tap targets, single-column layout, no popups that cover content, fast loading (compress images).

> **Practical (10 min):** Open the **Landing Page Structure Template** and **Headline & CTA Formulas**. Write your headline, subheadline, one proof element, and your FAQ block (3 objections) for the offer you built in Module 3.`,
      },
    ],
  },
  {
    title: "Module 5: Complete Marketing Funnel",
    description:
      "Content → Traffic → Landing Page → Lead → Follow-up → Sale → Retention, with lead generation, conversion, retargeting, and a real example.",
    sortOrder: 5,
    lessons: [
      {
        title: "Lesson 5: Complete Marketing Funnel",
        slug: "complete-marketing-funnel",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Complete Marketing Funnel

A funnel is the system that moves strangers to customers to repeat buyers. This module builds the complete chain and shows it with a real example.

### The funnel

> **Content → Traffic → Landing Page → Lead → Follow-up → Sale → Retention**

Each stage has one job and one metric:

1. **Content** — attract and educate. Metric: engagement/views.
2. **Traffic** — send the right people. Metric: click-through rate.
3. **Landing page** — convert attention into a lead. Metric: conversion rate.
4. **Lead** — capture contact + intent. Metric: cost per lead.
5. **Follow-up** — nurture and qualify. Metric: reply/booking rate.
6. **Sale** — close the deal. Metric: cost per acquisition.
7. **Retention** — repeat and referral. Metric: lifetime value.

### Lead generation

- Lead magnets: a specific, useful piece (checklist, template, mini-course) that solves one small problem now.
- The magnet must be relevant to the offer: free template today, full program later.
- Forms ask for the minimum (name + WhatsApp/email) — every extra field kills conversions.

### Conversion

- Offer a clear next step for every lead: book a call, get the paid product, or join the waitlist.
- Speed is conversion: reply within minutes, not days.
- Payment friction: one-page checkout, UPI + cards, instant delivery.

### Retargeting

- Most visitors will not convert on the first visit. Retargeting ads bring them back with proof, objections answered, or urgency.
- 20-30% of ad budget belongs to retargeting. This is where most revenue actually lands.

### Customer journey

Map the full journey before you build anything:

- Stranger sees content or ad -> visits landing page -> becomes lead -> gets follow-ups -> buys -> receives onboarding -> is asked for review/referral.

### Real funnel example (online course)

- **Content:** 2 educational reels per week on the topic.
- **Traffic:** Meta ads (₹400/day) to the best-performing content + a Leads campaign for the free checklist.
- **Landing page:** "Free 10-point Checklist — get your first campaign plan right" with name + WhatsApp form.
- **Follow-up:** WhatsApp template within 5 minutes, then a 3-message sequence over 5 days (value, proof, offer).
- **Sale:** the checklist page ends with the course offer; hot leads get a direct offer message.
- **Retention:** post-purchase onboarding sequence, certificate, review request, referral offer.

> **Practical (10 min):** Open the **Funnel Planner**. Draw your full funnel with the one metric per stage and the one leak you will fix first.`,
      },
    ],
  },
  {
    title: "Module 6: Marketing Automation",
    description:
      "CRM, lead capture, qualification, follow-ups, email and WhatsApp automation, onboarding, retargeting, review/referral workflows.",
    sortOrder: 6,
    lessons: [
      {
        title: "Lesson 6: Marketing Automation",
        slug: "marketing-automation",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Marketing Automation

Automation is how a small team behaves like a big one: every lead gets captured, followed up, and nurtured on schedule — without you remembering anything.

### CRM (Customer Relationship Management)

- A CRM is the system of record for every lead and customer: contact, source, status, history.
- Start simple: a spreadsheet works until ~50 leads; then move to a lightweight CRM.
- Rules: every lead enters the CRM the moment it arrives, every interaction is logged, and status is updated at each funnel stage.

### Lead capture

- Capture everywhere: form → CRM, WhatsApp click → CRM, call → CRM.
- The capture event should trigger the first automated action automatically (welcome message, tag, assignment).

### Lead qualification

Score leads (e.g., 1-10) by:

- **Fit:** how well they match the ICP (0-4)
- **Intent:** what they asked for / where they came from (0-3)
- **Timing:** when they want to buy (0-3)

Automation rule: score >= 8 -> sales message today; 4-7 -> nurture sequence; < 4 -> newsletter list.

### Follow-up automation

- **Email sequences:** welcome -> value -> proof -> offer -> deadline. One goal per email, 3-5 emails per sequence.
- **WhatsApp automation concepts:** instant reply templates for common questions, broadcast to segmented lists (with consent), and human takeover for hot leads.
- Speed template: "Hi [name], thanks for your interest in [offer]. Here is the [deliverable]. One question for you: [qualifying question]."

### Customer onboarding

Onboarding is the moment value is delivered — automate the welcome sequence:

1. Delivery confirmation + access instructions
2. Quick-start guide (first 3 steps)
3. Weekly value emails
4. Milestone check-ins

### Retargeting automation

- Platform retargeting (Meta/Google) runs on pixels — automated once built.
- Behavioral triggers: cart abandoned -> WhatsApp/email with offer; watched 50% of video -> proof ad; visited page 3x -> direct message.

### Review & referral workflows

- **Review:** after delivery confirmation + 7 days, auto-ask for review with a direct link. Reply to every review.
- **Referral:** after a positive review, offer a referral reward and a shareable link.
- Automate the ask; personalize the thank-you.

> **Practical (10 min):** Open the **AI Operations & Automation Playbook**. Map your automation in order: capture trigger, welcome, 3-email follow-up sequence, onboarding sequence, review ask, referral ask.`,
      },
    ],
  },
  {
    title: "Module 7: AI for Business",
    description:
      "AI for research, content, marketing, sales, support, operations, automation, repeatable workflows, and fact-checking.",
    sortOrder: 7,
    lessons: [
      {
        title: "Lesson 7: AI for Business",
        slug: "ai-for-business",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## AI for Business

AI will not run your business, but the business that uses AI well will out-run the one that does not. This module builds practical AI workflows for every function.

### AI research

- Use AI to summarize competitors, structure customer interviews, and turn raw notes into pain/outcome lists.
- Prompt pattern: give context, ask for structure, demand sources: "Summarize these 20 reviews. List the top 5 pains in the customers' own words, with counts."

### AI content

- AI drafts; you edit. Use it for: outlines, hooks, ad copy variations, email drafts, captions.
- Prompt pattern: "Write 10 hooks for [audience] about [problem]. Style: short, specific, curiosity-based. Avoid hype words."
- Always rewrite in your voice; AI output is a first draft, never the final.

### AI marketing

- Generate campaign ideas, ad variations for testing, landing-page drafts, and weekly content plans.
- Use AI for testing: generate 10 creatives' copy, test 3, keep the winner.

### AI sales

- Draft discovery-call questions, proposal sections, objection responses, and follow-up messages from the CRM notes.
- AI drafts the message; a human must review before sending to a real customer.

### AI customer support

- A support bot answers FAQs from your own knowledge base; complex cases escalate to a human.
- Rule: the bot must hand over cleanly ("I've connected you with a real person") and never invent policies.

### AI operations

- SOP drafting, checklist creation, reporting summaries, meeting notes.
- Let AI turn a successful project into a repeatable SOP (see Module 14).

### AI automation

- AI + automation tools = AI agents: auto-tag leads from form answers, draft replies to common inquiries, summarize daily sales reports.
- Start with one boring repetitive task; automate it; then the next.

### Creating repeatable AI workflows

A workflow = trigger + prompt + output + review:

1. Trigger (new lead form submitted)
2. Prompt (draft a personalized reply using the answers)
3. Output (message + tags)
4. Review (human approves before send)

> **The golden rule of AI workflows:** automate the drafting, never the judgment. AI reduces your work by 80% on the boring 80%; the last 20% is where trust is built.

### Fact-checking AI output

- AI hallucinates confidently. Always verify: numbers (ask for sources), prices, policies, and claims that will reach customers.
- Never let AI make factual claims about your product, competitors, or legal matters without a human check.
- Ask the AI itself to flag uncertainties: "Mark anything you are not sure about."

> **Practical (10 min):** Open the **AI Research Prompts** and **AI Content & Marketing Workflows** playbooks. Write one workflow from trigger to review for your business (e.g., WhatsApp lead replies).`,
      },
    ],
  },
  {
    title: "Module 8: Advanced Content System",
    description:
      "Content pillars, batch creation, repurposing, one idea into many pieces, creative testing, and the content mix.",
    sortOrder: 8,
    lessons: [
      {
        title: "Lesson 8: Advanced Content System",
        slug: "advanced-content-system",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Advanced Content System

Consistent content is the engine of organic growth — but consistency comes from a system, not motivation.

### Content pillars

Pick 3-5 pillars that cover your niche and your offer:

- **Education pillar** — teach one thing ("how to structure a campaign").
- **Proof pillar** — results, behind the scenes ("we rebuilt this landing page, conversion went up 40%").
- **Story pillar** — your journey, customers' journeys.
- **Product pillar** — what you sell and why it exists.
- **Culture pillar** — values and personality (optional, humanizes).

> **Rule:** 80% of content teaches and builds trust; 20% sells. The selling content works only because the teaching content exists.

### Batch creation

- One planning session per week: list 10-20 ideas under each pillar.
- One recording/creation session per week: produce everything for the week in one sitting.
- One editing session: format, caption, schedule.
- Batch creation turns 5 hours of daily scrambling into 4 hours weekly.

### Repurposing: one idea → multiple pieces

The core skill of the content system:

1. **One core piece** — a 10-minute educational video or a 1,500-word article.
2. **Cut into shorts/reels** — 3-5 clips with hooks.
3. **Pull quotes** — 5-10 carousel posts.
4. **Turn into a thread** — Twitter/X or LinkedIn breakdown.
5. **Rewrite as email** — newsletter version.
6. **Update an FAQ** — answer a question permanently.

One idea = 6-10 pieces of content across platforms, without rethinking.

### Creative testing in content

- Apply the same testing discipline as ads: 3 formats x 3 hooks, measure, keep winners.
- Watch retention curves: where viewers drop is where the next hook goes.

### Educational content

- One lesson per piece. Specific, actionable, with a takeaway.
- Structure: hook -> teach -> example -> takeaway -> CTA.

### Authority content

- Deep-dives, original data, case studies, contrarian-but-true takes.
- Authority content ranks on search and gets shared by peers — it compounds.

### Promotional content

- Direct offers, launches, testimonials, deadlines.
- Promo content converts; it also burns trust if overused. Follow the 80/20 rule.

> **Practical (10 min):** Open the **SEO Content & Cluster Planner**. Define your 3 pillars, write 5 ideas per pillar, and take your best idea through the repurposing chain (6 pieces) on paper.`,
      },
    ],
  },
  {
    title: "Module 9: Advanced Meta Ads",
    description:
      "Campaign, creative, and audience testing; retargeting; budget allocation; conversion tracking; scaling; diagnosis.",
    sortOrder: 9,
    lessons: [
      {
        title: "Lesson 9: Advanced Meta Ads",
        slug: "advanced-meta-ads",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Advanced Meta Ads

The Growth program taught you to run Meta ads. This module teaches you to run Meta ads deliberately — testing, scaling, and diagnosing like a professional.

### Campaign testing

- **One variable at a time.** Campaign structure, audience, or creative — change one, keep the rest fixed.
- **Test structure:** 2-3 ad sets per campaign, equal budgets, 3-5 days minimum before judging.
- The test budget is tuition: plan to spend it, learn from it, expect most tests to lose.

### Creative testing

- Run the 3 hooks x 3 creatives matrix (from the Growth program) until you have a winner per audience.
- Then iterate on winners: same hook, new body; same creative, new offer.
- Retire creative fatigue: when frequency climbs and CTR falls, refresh.

### Audience testing

- Test cold (broad), warm (retargeting), and hot (cart/checkout) audiences separately.
- Ad sets within one campaign should not overlap; use exclusions.
- Scale audiences after the creative winner is found — never scale a bad creative to a bigger audience.

### Retargeting

- Video viewers 50%+, engaged users, website visitors, cart abandoners — each gets its own message.
- Retargeting budget share: 20-30% of total. Retargeting frequently produces the best ROAS in the account.

### Budget allocation

- Base: 50-60% cold (prospecting), 20-30% warm (retargeting), 10-20% testing.
- Move budget from losers to winners in steps of 20-30%, not overnight doubles.

### Conversion tracking

- Pixel + Conversions API for reliable data; set up the key events (purchase, lead, add to cart).
- Test events fire correctly before scaling — untracked traffic is invisible traffic.

### Scaling concepts

- **Horizontal scaling:** add more audiences/placements at the same budget.
- **Vertical scaling:** raise budget on winning ad sets in 20-30% steps, waiting 2-3 days between steps.
- **Lookalikes:** after ~500 conversions, build lookalikes of your best customers (1-3%) for new cold prospecting.

### Diagnosing poor performance (the system)

> **Low CTR?** Creative problem — new hook or format, not a new audience.
> **Good CTR, no conversions?** Landing page or offer problem — fix the page and the offer.
> **Good conversions, expensive?** Economics problem — check CPC and CPM; then bidding and exclusions.
> **High frequency, falling performance?** Fatigue — refresh creative or widen the audience.
> **Everything fine, still failing?** Check tracking and attribution before changing anything.

> **Practical (10 min):** Open the **Meta Ads Campaign Planner** and **Campaign Testing Worksheet**. Write your next test: one variable, budget, duration, success threshold, and the decision rule in advance.`,
      },
    ],
  },
  {
    title: "Module 10: Advanced Google Ads",
    description:
      "Search intent, keyword strategy, negative keywords, campaign structure, search terms, landing-page relevance, tracking, optimization.",
    sortOrder: 10,
    lessons: [
      {
        title: "Lesson 10: Advanced Google Ads",
        slug: "advanced-google-ads",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Advanced Google Ads

Google Ads rewards precision: the right keyword, the right ad, the right page. This module covers the advanced layers on top of the Growth program's foundation.

### Search intent mastery

- Classify every keyword: informational (educate), commercial (compare), transactional (buy).
- Spend only where intent matches your goal: transactional and commercial keywords for ads; informational for content.
- Intent also changes the ad: transactional gets price + offer; commercial gets proof + differentiation.

### Keyword strategy

- Structure by intent and theme into separate campaigns or ad groups — never mix.
- Use **exact match** for control during testing; expand to phrase match once winners are known.
- Add **negative keywords** aggressively: "free", "job", "salary", "tutorial", "course free download" — anything that wastes clicks.
- Review the **search terms report** weekly: add winning terms as exact keywords, add losing terms as negatives.

### Negative keyword workflow

1. Weekly: export search terms report.
2. Ignore the top spenders that convert — add them as exact keywords.
3. Add every irrelevant term as a negative (with match type).
4. Check negatives before raising bids — cheap clicks to the wrong people are still wasted money.

### Campaign structure (advanced)

- **Account level:** separate campaigns by product category or intent group.
- **Campaign level:** one budget, one bidding strategy, one goal.
- **Ad group level:** one theme, 5-15 keywords, 2-3 ads.
- **Use asset (responsive search) ads** with 8+ headlines and 4+ descriptions for relevance coverage — but track which combinations win.

### Search terms report

The report is the truth of your account:

- New converting terms -> promote to exact keywords.
- Irrelevant high-spend terms -> negative keywords.
- Low-quality terms (high clicks, no conversion) -> pause or negative.

### Landing-page relevance

- The ad's promise must be the page's headline (message matching).
- The page must contain the keyword's intent: if they searched "price", the page must show the price.
- Quality Score = expected CTR + ad relevance + landing page experience. Improve relevance before raising bids.

### Conversion tracking

- Set up conversion actions for every business step: purchase, lead, call, signup.
- Assign values to conversions so Google can optimize to revenue, not volume.
- Import offline conversions (calls/leads that close later) for accurate CPA.

### Optimization rhythm

1. Weekly: search terms review, negatives update, bid adjustments on winning/losing keywords.
2. Monthly: pause ads below threshold for 30 days, test 2 new headlines, review landing-page quality.
3. Quarterly: restructure — move proven keywords into dedicated campaigns with higher budgets.

> **Practical (10 min):** Open the **Google Ads Campaign Planner**. Write your keyword tiers (exact/phase/negative), your ad group themes, and your weekly search-terms review ritual.`,
      },
    ],
  },
  {
    title: "Module 11: Analytics & Business Numbers",
    description:
      "CTR, CPC, CPM, CPL, CPA, conversion rate, ROAS, CAC, AOV, LTV, break-even — and how to diagnose a failing campaign.",
    sortOrder: 11,
    lessons: [
      {
        title: "Lesson 11: Analytics & Business Numbers",
        slug: "analytics-business-numbers",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Analytics & Business Numbers

Numbers are the business's immune system. This module teaches the full metric set — and the most important skill: diagnosing a failing campaign.

### The metric set

- **CTR** — clicks ÷ impressions. Measures message relevance.
- **CPC** — cost per click. Attention + competition price.
- **CPM** — cost per 1,000 impressions. The price of attention.
- **CPL** — cost per lead. Cost of capturing intent.
- **CPA** — cost per acquisition (sale/customer).
- **Conversion rate** — conversions ÷ clicks or visitors.
- **ROAS** — revenue ÷ ad spend. Campaign-level efficiency.
- **CAC** — customer acquisition cost (all marketing + sales costs ÷ customers).
- **AOV** — average order value. Revenue ÷ orders.
- **LTV** — lifetime value. Average customer revenue over their whole relationship.
- **Break-even** — where revenue covers costs.

### The diagnostic framework: "The campaign is failing — what should I change?"

Follow the chain in order. Change ONE thing, measure 3-5 days:

**Step 1 — Is tracking working?**
Before changing anything, confirm conversions are actually recorded. A broken pixel looks like a failing campaign.

**Step 2 — Is it a message problem? (CTR)**
If CTR is below your benchmark (~0.8-1% feed, ~2-3% search):
- The ad is not earning attention. Fix the hook, the first frame, the format.
- Do NOT change the audience first. This is the most common mistake.

**Step 3 — Is it a conversion problem? (CTR fine, no sales)**
- People click; they don't buy. The leak is the landing page, offer, price, or checkout.
- Check: headline matches ad? price visible? proof present? friction (login walls, long forms)?

**Step 4 — Is it a cost problem? (CPL/CPA too high)**
- CPC high + CPM high? -> expensive attention: refresh creative, reduce overlap, check exclusions.
- CPC normal but CPA high? -> conversion rate is the leak: fix the page/offer (Step 3).
- CPM normal but CTR low? -> message problem again (Step 2).

**Step 5 — Is it a scaling problem? (worked, now failing)**
- Frequency > 3-4 with falling CTR -> creative fatigue: refresh or widen audience.
- Rising CPM after scaling -> audience saturation: new audiences or lookalikes.

**Step 6 — Is it an economics problem? (profitable? really?)**
- ROAS can look fine while the business loses money. Check full CAC vs LTV: if LTV < 3x CAC, the funnel economics are broken — fix retention and pricing, not ads.

> **The rule of diagnosis: one change at a time, measured for 3-5 days, against a threshold you set BEFORE the test.**

### Break-even math (every product)

- Margin per sale = price - variable costs.
- Break-even CPA = margin per sale.
- Break-even ROAS = revenue ÷ margin.
- Below break-even CPA you buy customers at a loss.

> **Practical (10 min):** Open the **Business Calculators** and **LTV/CAC Calculator**. Compute your break-even CPA and your target LTV:CAC. Then write the 3 most likely failure modes for your funnel and the fix for each.`,
      },
    ],
  },
  {
    title: "Module 12: Sales & Conversion",
    description:
      "Lead qualification, discovery, objections, sales conversations, proposals, follow-up, closing, upselling, retention.",
    sortOrder: 12,
    lessons: [
      {
        title: "Lesson 12: Sales & Conversion",
        slug: "sales-conversion",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Sales & Conversion

Marketing brings the lead; sales converts it. Even in a digital business, the human conversation is where trust — and revenue — is won.

### Lead qualification

Never sell to an unqualified lead. Ask first:

- **Problem:** what are they trying to solve?
- **Budget:** what have they spent or planned to spend?
- **Authority:** are they the decision-maker?
- **Timing:** when do they want the result?

Score each (1-3). Only a lead with a real problem and real timing enters your sales pipeline.

### Discovery

The discovery call is a research interview, not a pitch:

1. Let them talk (70/30 rule: they speak 70%).
2. Ask about their current situation, past attempts, and what failure costs them.
3. Mirror their language back — your proposal must use their words.
4. Only then present how your offer solves their specific situation.

### Customer objections

Objections are information, not rejection:

- **"Too expensive"** -> price vs cost of the problem. Compare to what they lose by not solving it.
- **"Need to think"** -> they need more clarity or trust: offer the missing proof or a smaller first step.
- **"Not sure it works for me"** -> show the exact-fit case study, or a trial/guarantee.
- **"No time"** -> make the effort explicit and manageable.

Write answers to your top 5 objections before you ever talk to a customer.

### Sales conversations

- Sell the outcome, not the features.
- Use the customer's own words from discovery.
- Give one clear recommendation — indecision loses sales.
- Silence is fine: after asking for the decision, wait.

### Proposals

- One page if possible: problem (their words) -> solution (your offer) -> investment (price + value anchor) -> guarantee -> next step.
- Send fast (same day) and follow up on schedule.

### Follow-up

- 80% of sales happen after multiple touches. Plan the sequence: day 1 (proposal), day 3 (value add), day 7 (case study), day 14 (final decision question).
- Every follow-up adds value; never just "checking in".

### Closing

- Ask directly: "Shall I send the payment link?" Most lost sales never got asked.
- Make buying easy: UPI/cards, clear payment steps, instant delivery.
- Never pressure; a clear recommendation + easy next step closes.

### Upselling

- After a purchase: offer the next natural step (premium tier, retainer, bundle).
- Upsell only what genuinely helps; a burned trust costs more than the upsell earns.

### Retention

- The cheapest customer is the one you already have: onboarding, check-ins, re-engagement offers.
- Track churn; every retained customer feeds reviews and referrals.

> **Practical (10 min):** Open the **Discovery Call Script** and **Proposal Template**. Write your top 5 objections with answers and your 14-day follow-up sequence.`,
      },
    ],
  },
  {
    title: "Module 13: Freelancing to Agency",
    description:
      "Choosing a service, portfolio, packages, pricing, client acquisition, proposals, delivery, revisions, outsourcing, team building.",
    sortOrder: 13,
    lessons: [
      {
        title: "Lesson 13: Freelancing to Agency",
        slug: "freelancing-to-agency",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Freelancing to Agency

The freelancer sells hours; the agency sells outcomes with a system. This module maps the path from solo to small team.

### Choosing a service

- Pick a service where: demand exists (people pay for it), you can deliver a clear outcome, and the work can be systematized.
- Avoid "I do everything" — the agency is built on one repeatable service, then expanded.

### Portfolio

- 3-5 proof pieces, not 30. Quality and results beat volume.
- For every piece: the problem, what you did, the result (numbers where possible).
- No client work yet? Do spec work or free/low-cost projects for portfolio + testimonials.

### Packages

- Productize the service into 2-3 packages: Basic (core), Standard (recommended), Premium (full).
- Each package has a defined scope, deliverables, timeline, and price — no custom quoting for every inquiry.
- Scope boundaries in writing: what's included, what's extra (revisions, add-ons).

### Pricing

- Price by outcome and time-to-deliver, not by effort.
- Anchor: show the value of the outcome, then the price.
- Raise prices every 3-6 months; the clients who leave were the wrong ones anyway.

### Client acquisition

- Where clients already look: freelance platforms, LinkedIn, WhatsApp groups, referrals, your own content.
- Referrals are the highest-quality channel: deliver brilliantly, then ask.
- Content: publish the service's results as case studies — this is the strongest ad.

### Proposals

- The proposal is a mini landing page: problem, solution, package, investment, guarantee, next step.
- Send same-day, follow up on a schedule, and make "yes" one click away.

### Delivery

- Deliver early whenever possible. Early delivery is the cheapest marketing you will ever buy.
- Standardize delivery with SOPs (Module 14): every project follows the same steps.

### Revisions

- Define revision limits in the package ("2 rounds included").
- Scope creep kills freelancers: changes outside scope = new quote, politely.
- Use a change-log so both sides see what changed and why.

### Outsourcing

- When revenue repeats, delegate the repetitive parts: editing, research, reporting.
- Start with one small task, document the SOP, then hand it over with a checklist.
- Pay fairly and on time; your team's quality is your reputation.

### Building a small team

- Hire for the bottleneck, not for the wishlist.
- Roles in order: delivery support -> sales support -> operations.
- Weekly check-ins, written SOPs, and shared dashboards keep a small team honest without meetings.

> **Practical (10 min):** Open the **Client Onboarding SOP** and **Delivery & Quality Control SOP**. Define your one service, its 3 packages with prices, and the first task you would outsource when revenue allows.`,
      },
    ],
  },
  {
    title: "Module 14: SOPs & Business Systems",
    description:
      "What an SOP is, and SOPs for content, marketing, client onboarding, delivery, support, reporting, and quality control.",
    sortOrder: 14,
    lessons: [
      {
        title: "Lesson 14: SOPs & Business Systems",
        slug: "sops-business-systems",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## SOPs & Business Systems

An SOP (Standard Operating Procedure) is the written version of how work gets done. SOPs are what turn a business that depends on you into a business that runs on a system.

### What an SOP is

- An SOP = the steps, tools, and quality bar for a repeatable task.
- Good SOPs are written by doing the task once, then documenting it while it is fresh.
- Format: what (task) -> who (owner) -> when (trigger) -> how (numbered steps) -> done-when (definition of complete).

### Content SOP

- Trigger: weekly planning session.
- Steps: pull pillar ideas -> pick top 5 -> write/draft (AI-assisted) -> edit in your voice -> schedule -> repurpose into 6 pieces.
- Done-when: content for the week is scheduled with hooks and CTAs checked.

### Marketing SOP

- Trigger: campaign launch.
- Steps: offer check -> landing page live -> tracking events verified -> creative matrix set -> budget allocated -> launch -> review at day 3-5 with the diagnostic framework.
- Done-when: campaign is running with a review date and decision rule set.

### Client onboarding SOP

- Trigger: payment received.
- Steps: welcome email (access + expectations) -> intake form -> kickoff call -> project plan -> first deliverable date.
- Done-when: client has everything they need and the first milestone is scheduled.

### Project delivery SOP

- Trigger: project kickoff.
- Steps: brief confirmation -> draft -> internal QA -> client review -> revisions (up to limit) -> delivery -> feedback request.
- Done-when: delivered early with a summary of results.

### Customer support SOP

- Trigger: support message.
- Steps: acknowledge fast (template) -> classify (question/bug/complaint) -> resolve or escalate -> log -> follow up.
- Done-when: customer confirms resolution within the target time.

### Reporting SOP

- Trigger: weekly close.
- Steps: pull metrics (CTR, CPL, CPA, ROAS, revenue) -> compare to thresholds -> list next actions -> send one-page report.
- Done-when: report sent with a clear "fix this" list.

### Quality control SOP

- Trigger: before any delivery.
- Steps: checklist review (facts, links, spelling, design, mobile) -> second pair of eyes for client-facing work -> approve.
- Done-when: the QC checklist is signed off.

> **SOP writing rule:** the first version is better than the perfect version. Write it after doing the task once, run it twice, then fix what breaks. Review every SOP quarterly.

> **Practical (10 min):** Open the **SOP Template**. Write your first SOP end to end (marketing launch or delivery) including its done-when.`,
      },
    ],
  },
  {
    title: "Module 15: Real-World Case Studies",
    description:
      "Four complete scenarios: local business, creator, freelancer, and digital product — from first step to results.",
    sortOrder: 15,
    lessons: [
      {
        title: "Lesson 15: Real-World Case Studies",
        slug: "real-world-case-studies",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Real-World Case Studies

Four realistic scenarios, each following its full chain. The patterns matter more than the numbers: every business is one system executed.

### Case 1 — Local business (Ads → Leads → Follow-up → Customers)

- **Business:** "GreenLeaf Cafe", a cafe in Indore with slow weekday evenings.
- **Research:** weekday evenings were dead; nearby offices had no good meeting spot.
- **Offer:** "Weekday Evening Desk: free refill + quiet seating, Rs. 99." Targeted at freelancers and office teams.
- **Ads:** Meta Leads campaign, 3 km radius, video of the space at sunset, Rs. 300/day.
- **Lead flow:** instant form -> WhatsApp auto-reply with menu + booking link -> call if no reply in 30 min.
- **Follow-up:** booked customers get a reminder; no-shows get a "next time" offer.
- **Retention:** after 3 visits, a "regulars card" via WhatsApp.
- **Result (3 months):** weekday evening covers grew from 12% to 55%; cost per booking Rs. 25; repeat visits became the majority.
- **Lesson:** the offer matched a real gap, and every lead had a defined next step.

### Case 2 — Creator (Content → Audience → Affiliate/Digital Product)

- **Creator:** "Arjun", fitness trainer, 0 to 40k followers in 8 months.
- **System:** 3 reels/week (education pillar), 1 carousel/week (proof), weekly story Q&A.
- **Funnel:** reels -> free "Home Workout Checklist" (link in bio) -> WhatsApp/email list -> paid mini-program.
- **Monetization:** Rs. 299 mini-program + affiliate supplements with honest reviews.
- **Result:** 40k followers, 1,800 checklist downloads, 340 program sales (Rs. 1,01,660) plus affiliate income.
- **Lesson:** content built trust first; the product existed because the audience asked for it.

### Case 3 — Freelancer (Skill → Portfolio → Client → Project → Recurring)

- **Freelancer:** "Neha", graphic designer, Rs. 8k/month to Rs. 90k/month in 9 months.
- **Skill:** social media design packages (Instagram templates + campaign creatives).
- **Portfolio:** 4 spec projects for real-looking brands with result claims she could defend.
- **Acquisition:** LinkedIn content (design tips) + direct DMs to founders + referral ask after every project.
- **Packages:** Rs. 15k (templates), Rs. 35k (monthly creative), Rs. 60k (monthly creative + strategy).
- **Recurring:** 70% of clients moved to monthly retainers within 2 projects.
- **Result:** 6 retainers = Rs. 90k/month; she stopped taking one-off projects.
- **Lesson:** productized packages + referral ask + retention focus beat bidding on platforms.

### Case 4 — Digital product (SEO + Content + Ads → Landing Page → Sale)

- **Product:** "Hindi Excel Mastery" course, Rs. 999 (from the Growth program case).
- **Organic:** SEO articles on "excel mistakes", "excel for beginners in Hindi" cluster + shorts.
- **Ads:** Meta demo reels (cold) + retargeting (proof) + Google Search "best excel course in hindi".
- **Landing page:** sample lesson, syllabus, reviews, price anchor (Rs. 2,999 -> Rs. 999).
- **Result:** organic traffic grew monthly; ads ROAS 3.1x; retargeting carried 60% of sales.
- **Lesson:** content built the moat, ads bought speed, and the landing page converted both.

> **The universal pattern:** clear customer, honest offer, one system per stage, measurement at every stage, and follow-up until value is delivered. Copy the pattern, not the numbers.

> **Practical (10 min):** Pick the case closest to your business. Write its system as a chain of stages with one metric per stage. Where is your weakest stage today?`,
      },
    ],
  },
  {
    title: "Module 16: 30-Day Business Implementation",
    description:
      "The complete roadmap: Week 1 research + offer, Week 2 website + content, Week 3 marketing + leads, Week 4 automation + analytics.",
    sortOrder: 16,
    lessons: [
      {
        title: "Lesson 16: 30-Day Business Implementation",
        slug: "30-day-business-implementation",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## 30-Day Business Implementation

This program is not finished until your business plan is executed. This module gives you the complete 30-day roadmap — one week per phase, one deliverable per day.

### Week 1: Research + Offer (days 1-7)

- **Day 1:** Niche decision. Write the niche filter: skill x demand x reach.
- **Day 2:** Customer research. 3 interviews or 20 reviews; extract pains in their words.
- **Day 3:** Competitor map. 3 competitors: offer, price, strengths, weaknesses.
- **Day 4:** Market gap statement. The one gap you will own.
- **Day 5:** Offer Builder complete: package, price + anchor, bonuses, guarantee, urgency.
- **Day 6:** Pricing sanity: break-even CPA and LTV:CAC targets set.
- **Day 7:** Offer statement written in one paragraph. Share it with 3 people; iterate.

**Week 1 done-when:** one page: customer + problem + offer + positioning.

### Week 2: Website + Content (days 8-14)

- **Day 8:** Landing page structure (headline, subheadline, proof, FAQ, CTA).
- **Day 9:** Landing page build (use the Structure Template and Checklist).
- **Day 10:** Headline + CTA testing versions (write 3 of each).
- **Day 11:** Content pillars defined (3-5) and 10 ideas per pillar.
- **Day 12:** Batch content session 1: produce week 3's content.
- **Day 13:** Repurpose one core piece into 6 pieces.
- **Day 14:** Trackers live: KPI thresholds and the reporting SOP.

**Week 2 done-when:** a live landing page and one week of content scheduled.

### Week 3: Marketing + Leads (days 15-21)

- **Day 15:** Lead magnet ready (checklist/template) + capture form live.
- **Day 16:** Meta campaign planned (objective, budget, audience, creative matrix).
- **Day 17:** Creative set produced (3 hooks x 3 formats minimum).
- **Day 18:** Campaign launched with tracking events verified.
- **Day 19:** Follow-up sequence built (WhatsApp/email, 3-5 messages).
- **Day 20:** Retargeting ad set built (warm audience + proof creative).
- **Day 21:** First review: run the diagnostic framework on early data. Adjust ONE thing.

**Week 3 done-when:** campaign live, leads arriving, follow-ups firing.

### Week 4: Automation + Analytics + Optimization (days 22-30)

- **Day 22:** CRM or sheet organized: every lead captured with status.
- **Day 23:** AI workflow #1 automated (lead reply or follow-up drafting).
- **Day 24:** Onboarding sequence delivered to first customers.
- **Day 25:** Weekly report #1: CTR, CPL, CPA, ROAS vs thresholds.
- **Day 26:** Search terms/audience review; negatives and exclusions updated.
- **Day 27:** One test launched (one variable), decision rule written in advance.
- **Day 28:** Review/referral asks automated.
- **Day 29:** SOPs written for the 3 tasks you repeated most.
- **Day 30:** Month review: what worked, what flopped, next month's one focus.

**Week 4 done-when:** the business runs one week without you building anything new.

### The rules of the 30 days

1. 2-3 focused hours per day beats 12 scattered ones.
2. If a day slips, do not skip — compress the next two days.
3. Ship imperfect: the first version of everything is better than the perfect nothing.
4. Every decision has a date to review. No review, no learning.
5. Track everything: what you cannot measure, you cannot fix.

> **Completion:** Mark this lesson complete. When all 16 lessons are completed, your verified certificate is issued automatically. Day 1 starts now.`,
      },
    ],
  },
];