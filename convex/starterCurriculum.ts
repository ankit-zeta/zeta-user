/**
 * Starter Program (₹2,000) curriculum & bundle definitions.
 *
 * This is the complete text-based guided course (approx. 2–2.5 hours) plus
 * the starter bundle resources. Everything here is stored in Convex so the
 * admin can edit program/module/lesson/resource content from the admin panel
 * without touching code. This file only supplies the initial seed content.
 */

export interface StarterLessonDef {
  title: string;
  slug: string;
  content: string;
  durationMinutes: number;
  sortOrder: number;
  isPreview: boolean;
}

export interface StarterModuleDef {
  title: string;
  description: string;
  sortOrder: number;
  lessons: StarterLessonDef[];
}

export interface StarterResourceDef {
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  sortOrder: number;
  pdfLines: string[];
}

export const STARTER_PROGRAM_PATCH = {
  duration: "2.5 Hours",
  accessDuration: "Lifetime Access",
  shortDescription:
    "A guided 2-hour course that teaches you how to use the complete Starter Bundle: reels library, AI prompts, templates, SEO & branding guides, checklists, and a 30-day action plan.",
  description:
    "The Starter Program is a guided, text-based course (approx. 2–2.5 hours) covering digital earning basics, short-form content, social media growth, SEO, personal branding, AI-assisted content creation, and monetization fundamentals. Every lesson is paired with a downloadable Starter Bundle so you learn by doing — the course teaches you how to use the bundle, and the bundle makes it practical.",
  whatIncluded: [
    "5 Modules · 11 Step-by-Step Text Lessons",
    "Reels & Short-Form Content Library (60 ideas + hooks)",
    "AI Prompt Library (40+ ready-to-use prompts)",
    "Content & Posting Templates Pack",
    "SEO & Branding Resource Guide",
    "Marketing Checklists & 30-Day Action Plan",
    "Entry-level Work Marketplace Eligibility",
    "Verified Certificate of Completion",
  ],
  outcomes: [
    "Create and publish short-form content with a clear hook–value–CTA structure",
    "Grow a social media presence with a repeatable posting system",
    "Apply SEO basics to titles, captions, and profiles",
    "Build a simple personal brand with a one-line positioning statement",
    "Use AI tools to produce content faster while keeping quality control",
    "Understand affiliate and freelancing options and follow a 30-day action plan",
  ],
  faqs: [
    {
      question: "What exactly do I get with the Starter Program?",
      answer:
        "You get a guided 2-hour text course (11 lessons across 5 modules) plus the complete Starter Bundle: Reels & Content Library, AI Prompt Library, Content & Posting Templates, SEO & Branding Guide, Marketing Checklists, and a 30-Day Action Plan — all downloadable from your dashboard.",
    },
    {
      question: "Is this program refundable?",
      answer:
        "No. Because access to the course and all digital resources is delivered instantly, the Starter Program is non-refundable and non-returnable. Please review the program contents carefully before purchasing.",
    },
    {
      question: "How long do I have access?",
      answer:
        "You have lifetime access to the course and all included resources through your ZetaGrow dashboard.",
    },
    {
      question: "Do I get a certificate?",
      answer:
        "Yes. Once you complete all 11 lessons, a verifiable certificate of completion is automatically issued with a unique public verification ID.",
    },
  ],
};

export const STARTER_MODULES: StarterModuleDef[] = [
  {
    title: "Module 1: Digital Earning & Content Basics",
    description:
      "Understand the digital landscape, choose where to start, and learn the content fundamentals that every creator and freelancer needs.",
    sortOrder: 1,
    lessons: [
      {
        title: "Lesson 1: Understanding Digital Earning Opportunities",
        slug: "understanding-digital-earning-opportunities",
        durationMinutes: 10,
        sortOrder: 1,
        isPreview: true,
        content: `## Welcome to the Starter Program

Before you create anything, you need a clear picture of how people actually earn online — and which paths fit you. This lesson gives you the honest map, with no hype.

### The four honest digital earning paths

- **Freelancing / client work** — You sell a skill (writing, editing, design, admin) to clients who pay per project or per hour. This is the most direct path and the one ZetaGrow's Work Portal supports.
- **Content creation** — You build an audience with content (reels, posts, videos) and earn through brand work, affiliate sales, or your own offers. Slower to start, but compounding.
- **Digital products** — You create something once (templates, guides, mini-courses) and sell it repeatedly. Great long-term, harder to start from zero.
- **Affiliate marketing** — You recommend products you genuinely use and earn a commission on qualifying sales. Only works when you already have trust or a way to be discovered.

> **Reality check:** None of these paths guarantee income. Every one of them starts with a skill and consistent output. Ignore anyone promising "automatic income."

### How ZetaGrow fits in

- **Learn** — the modules in this course build your starter skill set.
- **Work** — complete lessons, then apply for real contract opportunities in the Work Portal.
- **Grow** — use the bundle and the 30-day plan to keep improving.

### Your first decision (2 minutes)

Answer these three questions in your notes:

1. What skill do you already enjoy doing, even imperfectly?
2. How many hours per week can you commit consistently?
3. What result do you want after 30 days: your first client, your first 1,000 followers, or a clear portfolio?

Your answers shape which parts of this course you prioritise. There is no wrong answer — only a starting point.`,
      },
      {
        title: "Lesson 2: Content Fundamentals — What Works Online",
        slug: "content-fundamentals",
        durationMinutes: 10,
        sortOrder: 2,
        isPreview: false,
        content: `## Content Fundamentals: What Works Online

Every successful post, reel, or article does three things well. Learn these three fundamentals and everything else becomes execution.

### The three fundamentals

1. **Attract attention (the hook)** — The first 1–3 seconds (or first line) decides whether anyone stops scrolling. A good hook is specific, surprising, or directly relevant to the viewer.
2. **Deliver value (the middle)** — The viewer must get something: a tip, a story, a template, a warning, or entertainment. If the middle is empty, the hook was wasted.
3. **Give direction (the CTA)** — Tell people what to do next: follow, save, comment, or open the link in your bio. Content without a direction is content without a result.

### Content types that work for beginners

- **Educational** — "3 mistakes beginners make in reels"
- **Process / behind-the-scenes** — "How I edit a 30-second reel in 10 minutes"
- **Opinion / experience** — "What I learned from my first month creating content"
- **Curated / listicle** — "5 free tools every beginner creator should know"

> **Rule of thumb:** If you can write it as one clear sentence, you can turn it into content. If you cannot write it clearly, you are not ready to post it.

### The consistency loop

- Pick **one platform** and **one format** to start.
- Publish on a **fixed schedule** (3–4 times per week is enough for beginners).
- Review **one metric** per week (views, saves, or replies — not all of them).
- Adjust one thing, repeat.

### Mini-practice (5 minutes)

Open the **Reels & Short-Form Content Library** PDF from your dashboard resources and read the first 5 hooks. Rewrite one hook in your own words about your own niche. That single exercise teaches you more about hooks than ten more videos would.`,
      },
    ],
  },
  {
    title: "Module 2: Short-Form Content & Reels",
    description:
      "Learn the hook–value–CTA structure, build your first reels, and master the Reels & Content Library that ships with this program.",
    sortOrder: 2,
    lessons: [
      {
        title: "Lesson 3: Reels & Short-Form Content Strategy",
        slug: "reels-short-form-strategy",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Reels & Short-Form Content Strategy

Short-form video is the fastest way for a beginner to be discovered — but only if the structure is right. This lesson teaches the exact framework used in the Reels & Content Library.

### The 15-second reel structure

1. **0–3 seconds: Hook** — A bold claim, a visual pattern interrupt, a question, or a before/after. Example: "Nobody will watch your reels because of your first 2 seconds."
2. **3–12 seconds: Value** — Deliver one idea with visuals, captions, and pace changes. One reel = one idea. Never two.
3. **12–15 seconds: CTA** — "Save this for your next post", "Follow for weekly tips", or "Comment your niche and I'll reply".

### The three content pillars

Pick three pillars (mixes of these work best):

- **Educational** (60%): teach a skill, correct a myth, share a tool.
- **Inspirational / story** (20%): progress updates, behind-the-scenes, lessons learned.
- **Engagement** (20%): questions, polls, challenges, trends.

> **Why pillars?** A viewer follows you for one clear reason. Pillars keep your feed consistent so the algorithm — and people — understand what you are.

### Captions, hashtags, and posting cadence

- **Captions** — First line repeats the hook in text (many people read before watching). Keep 2–4 short lines. Add a question at the end to invite comments.
- **Hashtags** — Use 3–6 relevant tags: 1 broad (e.g. #creatortips), 2 niche (e.g. #reelsforbeginners), 1 location/brand if relevant. Avoid 20 random hashtags.
- **Cadence** — 3–4 reels per week, at the same time of day, for 4 weeks. Judge results only after 4 weeks, never after 3 posts.

### Your editing toolkit (free, beginner-friendly)

- **CapCut** (mobile/desktop): captions, cuts, effects — the most common beginner tool.
- **Canva**: thumbnails, covers, and caption graphics.
- Phone camera + natural light beats any expensive gear.

### Practice (10 minutes)

Pick 3 ideas from the **Reels Library** PDF. Write the hook, the value point, and the CTA for each — one sentence each. You now have 3 ready-to-film scripts.`,
      },
      {
        title: "Lesson 4: Using Your Reels & Content Bundle",
        slug: "using-reels-content-bundle",
        durationMinutes: 10,
        sortOrder: 2,
        isPreview: false,
        content: `## Using Your Reels & Content Bundle

The bundle is the real value of this program — the course teaches you how to use it. This lesson walks you through the Reels & Short-Form Content Library PDF step by step.

### What's inside the Reels Library

- **60 ready-to-use reel ideas** organised by niche and goal (grow, sell, teach, entertain).
- **A hooks bank** — 25 proven hook formulas you can adapt in seconds.
- **Caption formulas** — 10 caption templates with fill-in-the-blank structure.
- **A 4-week posting calendar** — exactly what to post, when, so you never wonder "what do I post today?".
- **A simple performance tracker** — record views, saves, and replies per reel.

### How to use it (step by step)

1. **Open the Reels Library PDF** from Dashboard → Resources → Starter Bundle.
2. **Pick your niche** (from Lesson 1) and your 3 content pillars (Lesson 3).
3. **Choose 12 ideas** from the library — one per week for 4 weeks is 16; start with 12.
4. **Rewrite each idea** in your own words using the hook–value–CTA sheet at the start of the PDF.
5. **Film in batches** — record 3 reels in one sitting on Sunday, then edit one per day.
6. **Log results** in the performance tracker every week.

> **The rule:** Never open the bundle looking for "inspiration" without a pen. The bundle is a system, not a museum. Fill in the blanks, film, post, track.

### What you should NOT do

- Do not copy any idea word-for-word — adapt it to your voice and niche.
- Do not post everything at once — the calendar exists so you stay consistent, not flooded.
- Do not delete "failed" reels from your tracker — failures are data.

### Checkpoint

After this lesson you should have: your niche chosen, 12 ideas picked from the library, and your first hook rewritten in your own words. If not, go back and do it now — the next modules build on this.`,
      },
    ],
  },
  {
    title: "Module 3: Social Media Growth & SEO Basics",
    description:
      "Build a repeatable growth system and learn the SEO basics that make your content findable by search — on social and on Google.",
    sortOrder: 3,
    lessons: [
      {
        title: "Lesson 5: Social Media Growth Systems",
        slug: "social-media-growth-systems",
        durationMinutes: 20,
        sortOrder: 1,
        isPreview: false,
        content: `## Social Media Growth Systems

Growth is not luck — it is a repeatable system. This lesson teaches the five parts of that system, then points you to the checklists in your bundle.

### The five-part growth system

1. **Profile optimisation** — Your profile is your landing page. It must answer in 3 seconds: who you are, who you help, and why they should follow. Name, bio line, pinned post, and a consistent visual style.
2. **Consistent publishing** — A fixed cadence (3–4 posts/week) beats bursts of daily posting followed by silence.
3. **Engagement loops** — Spend 15 minutes/day commenting thoughtfully on 10–15 accounts in your niche (not "nice post" — real value). The algorithm rewards genuine interaction both ways.
4. **Content repurposing** — Turn 1 reel into 3 posts: the reel, a static carousel, and a text post. You get three assets from one idea.
5. **Weekly review** — Every Monday, open your tracker: which format got the most saves? Double down on it next week.

### What actually moves the needle

- **Saves and shares** signal deep value — design one "save this" moment per post.
- **Watch time** (for reels) — keep pacing tight; cut every second that doesn't add value.
- **Replies** — end with a question and reply to every comment for the first 30 minutes.

> **Expectation setting:** In month one, your goal is consistency and data — not followers. Followers grow when your system runs long enough for the algorithm to understand you.

### Using the Marketing Checklists

Open the **Marketing Checklists PDF** from your bundle. Locate the "Growth Checklist". Tick off:

- Profile photo is clear and on-brand
- Bio has one line that names the audience
- Pinned post is your best content
- Posting schedule is set for 4 weeks
- 15-minute daily engagement block is booked
- One metric is chosen for weekly review

### This week's action

Batch-produce your first 3 reels using your 12 ideas from Lesson 4. Post them on your schedule. Do not touch the analytics for a week — just follow the system.`,
      },
      {
        title: "Lesson 6: SEO Basics for Content",
        slug: "seo-basics-for-content",
        durationMinutes: 15,
        sortOrder: 2,
        isPreview: false,
        content: `## SEO Basics for Content

SEO (Search Engine Optimisation) simply means: making your content findable when people search. You don't need to be a technical expert — you need a system.

### How search works for a creator

People search in two places: **inside platforms** (Instagram, YouTube, LinkedIn) and **on Google**. Both read your titles, descriptions, and text before deciding what to show.

### The 5 SEO habits for content

1. **Choose one keyword per piece** — What would someone type to find this? "how to edit reels on phone" is a keyword; "video stuff" is not.
2. **Put the keyword in the title and first line** — Front-load it. "How to edit reels on your phone (CapCut)" beats "My editing journey".
3. **Write real descriptions** — 2–4 sentences that describe what the content covers, using natural variations of the keyword. Do not stuff the same word 10 times.
4. **Use your niche consistently** — A profile that repeatedly covers one topic earns trust with the algorithm.
5. **Name your files and alt text** — When you upload images or thumbnails, use descriptive filenames (e.g. reel-editing-tips.png), not IMG_2041.png.

### Understanding your audience's language

- Write down 5 questions a beginner in your niche would type into Google.
- Each question = one future piece of content.
- This is your "question bank" — it never runs out.

> **Honesty note:** SEO results take weeks. You will not rank in day one. The habit matters more than any single trick.

### Using the SEO & Branding Resource Pack

Open the **SEO & Branding Resource Pack PDF** from your dashboard. Use it to:

- Fill in your **keyword starter list** (20 keywords for your niche — use the question bank above).
- Follow the **title formula sheet** (How to X without Y / X mistakes beginners make in Z).
- Complete the **branding checklist** (name, handle, bio formula, visual style, posting signature).

### Practice

Take your next 3 reel titles from Lesson 4 and rewrite them using the title formulas from the pack. Each title must contain the keyword someone would search.`,
      },
    ],
  },
  {
    title: "Module 4: Personal Branding & AI Tools",
    description:
      "Position yourself clearly with a simple personal brand, then learn how to use AI to produce content faster without losing your voice.",
    sortOrder: 4,
    lessons: [
      {
        title: "Lesson 7: Personal Branding for Beginners",
        slug: "personal-branding-beginners",
        durationMinutes: 15,
        sortOrder: 1,
        isPreview: false,
        content: `## Personal Branding for Beginners

A personal brand is not "being famous" — it is being clear. When someone sees your name, what should they think? This lesson builds that answer.

### The one-line positioning statement

Fill in this formula (this becomes your bio):

> I help **[audience]** **[achieve a result]** through **[your method/format]**.

Examples:

- "I help beginners create reels that get watched, using CapCut and simple scripts."
- "I help students earn their first freelancing income through content writing."

### The 4 branding building blocks

1. **Name & handle** — Use the same handle everywhere it's available. Add your niche if your name is taken: @rahul.writes, @priya.edits.
2. **Visual identity** — 2 colours + 1 font style, applied to your profile, thumbnails, and post covers. Consistency is the brand.
3. **Pinned content** — Pin your best or most representative post. New visitors judge you by your pinned post first.
4. **Voice** — Write how you speak. If you use "you" and short sentences in conversation, do it in captions too.

### Profile setup checklist (do it now)

- [ ] Profile photo: clear, well-lit, consistent with your niche
- [ ] Bio: one-line positioning statement + one credential or result
- [ ] Link section: portfolio, WhatsApp business, or link-in-bio page
- [ ] Pinned post: your strongest content
- [ ] Highlights/features: 3 labelled collections

> **Branding is a promise kept repeatedly.** You don't need a logo designer; you need consistency for 90 days.

### Using the templates

Open the **Content & Posting Templates PDF** in your bundle:

- Use the **Bio Template** to rewrite your profile in under 5 minutes.
- Use the **Content Pillar Planner** to map 12 of your reel ideas to your 3 pillars.
- Use the **Weekly Schedule Template** to block your posting times for the next 4 weeks.

### Practice

Write your one-line positioning statement now. If it takes more than one sentence, simplify it — clarity is the brand.`,
      },
      {
        title: "Lesson 8: AI for Content Creation",
        slug: "ai-for-content-creation",
        durationMinutes: 15,
        sortOrder: 2,
        isPreview: false,
        content: `## AI for Content Creation

AI tools can remove the blank-page problem — but the output is only as good as the prompt and your editing. This lesson shows you the workflow, and the AI Prompt Library makes it concrete.

### The AI content workflow

1. **Generate (AI)** — Use a prompt to get 10 ideas, a first draft, or 5 caption options.
2. **Select (you)** — Choose the 1–2 options that match your voice. AI averages; your taste is the differentiator.
3. **Edit (you)** — Rewrite in your own words. Add your example, your story, your specific detail.
4. **Verify (you)** — Fact-check anything factual. AI confidently writes plausible wrong facts.

> **Golden rule:** AI drafts, you decide. Never publish an AI output you have not personally edited — your voice is your brand.

### What AI is genuinely good at

- Idea generation and headline/hook variations
- Captions in multiple tones (short, story, question-based)
- Structuring long content into outlines
- Rephrasing complex explanations into simple language
- Thumbnail and title variations for testing

### What AI is bad at

- Original experience and personal stories (only you have those)
- Up-to-date platform specifics (policies change; verify)
- Anything factual without verification
- Your unique voice (until you train it with your examples)

### Using the AI Prompt Library

Open the **AI Prompt Library PDF** from your dashboard. It contains 40+ copy-paste prompts organised by job:

- **Ideation prompts** — "Give me 10 reel ideas about [niche] for beginners, each with a hook and a value point."
- **Caption prompts** — "Write a 3-line caption for this reel about [topic]. First line: [your hook]. End with a question."
- **Editing prompts** — "Simplify this paragraph for a beginner audience: [paste text]."
- **Hook bank prompts** — "Rewrite this hook in 5 stronger versions: [your hook]."

### Practice (10 minutes)

Pick one topic from your 12 reel ideas. Use the AI prompt library to generate a hook and a caption. Then rewrite both in your own words — adding one personal detail only you know. That is your finished script.`,
      },
    ],
  },
  {
    title: "Module 5: Monetization, Freelancing & Your 30-Day Plan",
    description:
      "Understand affiliate and content monetization honestly, learn how freelancing works, and commit to the 30-day action plan.",
    sortOrder: 5,
    lessons: [
      {
        title: "Lesson 9: Affiliate & Content Monetization Basics",
        slug: "affiliate-content-monetization-basics",
        durationMinutes: 10,
        sortOrder: 1,
        isPreview: false,
        content: `## Affiliate & Content Monetization Basics

Monetization is the reward for consistent value — it comes after the audience and the skill, not before. This lesson explains how affiliate marketing actually works, honestly.

### What affiliate marketing is

You recommend a product or program you genuinely know, share your unique link, and earn a commission only when someone makes a qualifying purchase through that link. No purchase = no commission. That's the whole model.

### The honest rules of affiliate marketing

1. **Only promote what you've actually used or reviewed.** Your reputation is the asset; one bad recommendation costs more than many good ones earn.
2. **Disclose the relationship.** Say clearly when a link is an affiliate link. It's both ethical and required in most regions.
3. **Earnings are variable, not guaranteed.** Commission depends on program rules, purchase amounts, refunds, and approval policies. Anyone promising fixed income is misleading you.
4. **Recruitment alone earns nothing.** A commission only exists when a genuine product is sold.

### How ZetaGrow's affiliate system works (if enabled)

- You receive a unique referral link inside your dashboard.
- When someone signs up with your link and purchases an eligible program, a commission is calculated according to the platform's configured rules.
- Commissions follow a lifecycle: pending → approval/holding period → available → paid. Refunds or cancellations reverse the commission according to policy.

### Other monetization paths from this foundation

- **Digital products** — templates and guides you make with the skills from this course.
- **Brand collaborations** — once you have a consistent audience, small brands may pay for mentions.
- **Freelance services** — the direct path covered in the next lesson.

### Using the checklists

Open the **Marketing Checklists PDF** and complete the "Monetization Checklist": terms understood, disclosure line drafted, one product identified that you can genuinely recommend (if any). It's fine if the answer is "none yet" — the checklist exists so you know where you stand.`,
      },
      {
        title: "Lesson 10: Freelancing & Digital Opportunities",
        slug: "freelancing-digital-opportunities",
        durationMinutes: 10,
        sortOrder: 2,
        isPreview: false,
        content: `## Freelancing & Digital Opportunities

Freelancing is the fastest path from skill to income because clients pay for outcomes, not followers. This lesson covers the practical starter route — including ZetaGrow's Work Portal.

### How freelancing works

You sell a defined outcome (a blog post, an edited reel, a caption pack) at a defined price to a client. You agree scope, deadline, and revisions upfront. Payment is typically fixed per project or per milestone.

### The beginner's first-client plan

1. **Pick ONE service you can deliver well** — from the skills you already enjoy (Lesson 1).
2. **Create 2 sample deliverables** — free work for your portfolio counts. A client buys confidence, not your time.
3. **Write a one-page offer** — service, what's included, price, turnaround, revisions policy. This replaces "so how much do you charge?"
4. **Find your first client through** — the ZetaGrow Work Portal (apply to eligible opportunities), people you know, niche communities, or local businesses with no online presence.
5. **Deliver, ask for feedback, and request a testimonial** — testimonials are the currency of the next sale.

### Working through ZetaGrow's Work Portal

- Opportunities are posted by administrators with clear requirements, payment, and deadlines.
- Each job defines eligibility (e.g. a required program or achievement) — apply only when you qualify.
- Applications include answering the job's questions; track status from your dashboard.
- Deliverables and revisions are managed through the application workflow.

> **Pricing honesty:** Beginners usually underprice. That's acceptable for your first 1–3 projects — the goal is testimonials and proof, not profit maximisation. Raise prices after the third satisfied client.

### Practice

Open the **30-Day Action Plan PDF**. Complete the "Freelance Kickstart" section: choose your one service, list 3 people or places you can offer it to this month, and draft your one-page offer.`,
      },
      {
        title: "Lesson 11: Your 30-Day Action Plan",
        slug: "thirty-day-action-plan",
        durationMinutes: 5,
        sortOrder: 3,
        isPreview: false,
        content: `## Your 30-Day Action Plan

This is the final lesson — and the one that matters most. A course without action is entertainment. The 30-Day Action Plan PDF turns everything you've learned into a daily schedule.

### The 4-week structure

**Week 1 — Foundations (Days 1–7)**
- Finish setting up your profile (Lesson 7 checklist)
- Choose your one service and create 2 portfolio samples
- Pick 12 reel ideas from the Reels Library

**Week 2 — First Output (Days 8–14)**
- Film and post your first 3 reels using the hook–value–CTA structure
- Rewrite your bio with your one-line positioning statement
- Draft your one-page freelance offer

**Week 3 — Consistency (Days 15–21)**
- Post 3 reels on your schedule; track results in the performance tracker
- Apply to 2–3 eligible opportunities in the ZetaGrow Work Portal
- Use AI prompts to batch-produce next week's content

**Week 4 — Review & Adjust (Days 22–30)**
- Review your tracker: which format performed best? Double down
- Send your one-page offer to 3 potential clients
- Complete the monetization checklist and set goals for month two

### Daily minimum (30 minutes)

- 10 minutes: create (script, film, or edit)
- 10 minutes: engage in your niche (real comments)
- 10 minutes: learn (read the bundle, review analytics, or practice a skill)

### The tracker habit

At the end of every day, tick one box in the 30-Day Plan tracker. Missed days happen — never miss two in a row. Consistency beats intensity.

> **Final reminder:** ZetaGrow makes no income guarantees. What this program guarantees is structure: a complete bundle, a clear course, and a plan. What you do with them is the variable — and it's the variable you control.

### Completion

Mark this lesson complete. When all 11 lessons are completed, your verifiable certificate is issued automatically. Then go open the 30-Day Action Plan and start Day 1.`,
      },
    ],
  },
];

export const STARTER_RESOURCES: StarterResourceDef[] = [
  {
    title: "Reels & Short-Form Content Library",
    description:
      "60 ready-to-use reel ideas, 25 hook formulas, caption templates, a 4-week posting calendar, and a performance tracker — the core creative toolkit of the Starter Program.",
    fileName: "Reels_Short_Form_Content_Library.pdf",
    fileType: "pdf",
    fileSize: "0.5 MB",
    sortOrder: 1,
    pdfLines: [
      "ZETAGROW STARTER BUNDLE",
      "REELS & SHORT-FORM CONTENT LIBRARY",
      "====================================",
      "",
      "HOW TO USE THIS LIBRARY",
      "1. Choose your niche (see Module 1, Lesson 1).",
      "2. Pick one idea per pillar: Educational (60%),",
      "   Inspirational (20%), Engagement (20%).",
      "3. Rewrite the hook in your own words.",
      "4. Film in batches and post on your calendar.",
      "",
      "THE 25 HOOK FORMULAS (ADAPT TO YOUR NICHE)",
      "--------------------------------------------",
      "1. 'Nobody will [do X] because of [mistake].'",
      "2. '[Number] mistakes beginners make in [topic].'",
      "3. 'Stop doing [X]. Do this instead.'",
      "4. 'I tried [method] for [time]. Here is the truth.'",
      "5. '[Tool] hack that saves me [time/effort].'",
      "6. 'POV: you just learned [skill] in 15 seconds.'",
      "7. 'How I [result] with only [tool].'",
      "8. 'The [one thing] nobody tells you about [topic].'",
      "9. 'Watch this before you [action].'",
      "10. 'What I wish I knew before [topic].'",
      "11. '[Result] in 30 days? Here is the exact plan.'",
      "12. '3 signs you are ready for [next step].'",
      "13. 'Why your [content type] is not growing.'",
      "14. 'The 15-second rule of [platform].'",
      "15. 'I tested [X] vs [Y] so you don't have to.'",
      "16. 'Your first [deliverable] in 3 steps.'",
      "17. 'A beginner's guide to [topic].'",
      "18. 'This is what [topic] actually looks like.'",
      "19. '1 tip that changed my [result].'",
      "20. 'You are overcomplicating [topic].'",
      "21. 'Day [N] of learning [skill].'",
      "22. '[Number] tools every [role] needs (free).'",
      "23. 'The fastest way to [result] is boring:'",
      "24. 'Don't start [X] until you read this.'",
      "25. 'What I would do if I started from zero.'",
      "",
      "CAPTION FORMULAS",
      "-----------------",
      "A. Hook line + 2 value lines + question.",
      "B. Story + lesson + one-line takeaway.",
      "C. Checklist format: 'Save this for later.'",
      "D. Contrarian: 'Unpopular opinion: [X].'",
      "",
      "4-WEEK POSTING CALENDAR",
      "-------------------------",
      "Week 1: 3 reels - intro/niche + 2 educational.",
      "Week 2: 3 reels - 1 process + 1 story + 1 tip.",
      "Week 3: 3 reels - 1 educational + 1 Q&A + 1 trend.",
      "Week 4: 3 reels - best-of repost + results + CTA.",
      "",
      "PERFORMANCE TRACKER (COPY PER WEEK)",
      "------------------------------------",
      "Reel | Date | Views | Saves | Replies | Learnings",
      "",
      "RULE: Adapt, never copy. Data over opinions.",
    ],
  },
  {
    title: "AI Prompt Library",
    description:
      "40+ copy-paste prompts for ideation, hooks, captions, outlines, and editing — organised by job, ready to paste into any AI tool.",
    fileName: "AI_Prompt_Library.pdf",
    fileType: "pdf",
    fileSize: "0.4 MB",
    sortOrder: 2,
    pdfLines: [
      "ZETAGROW STARTER BUNDLE",
      "AI PROMPT LIBRARY (40+ PROMPTS)",
      "=================================",
      "",
      "HOW TO USE",
      "1. Replace [brackets] with your details.",
      "2. Edit every output in your own words.",
      "3. Verify any factual claims.",
      "",
      "IDEATION PROMPTS",
      "-----------------",
      "P1. Give me 10 reel ideas about [niche] for",
      "     beginners. Each with a hook and a value point.",
      "P2. List 15 questions beginners ask about [topic].",
      "P3. Turn this blog idea into 5 short-form scripts:",
      "     [idea].",
      "P4. Suggest 10 content pillar combinations for",
      "     [niche] with example posts for each.",
      "",
      "HOOK PROMPTS",
      "-------------",
      "P5. Rewrite this hook in 5 stronger versions:",
      "     [your hook].",
      "P6. Give me 10 scroll-stopping first lines for a",
      "     reel about [topic] for [audience].",
      "P7. Write 3 pattern-interrupt hooks for",
      "     [topic]. Keep each under 10 words.",
      "",
      "CAPTION PROMPTS",
      "----------------",
      "P8. Write a 3-line caption for a reel about",
      "     [topic]. First line: [hook]. End with a",
      "     question.",
      "P9. Rewrite this caption in a storytelling tone:",
      "     [caption].",
      "P10. Write 5 caption options: short, checklist,",
      "      story, question, contrarian. Topic: [topic].",
      "",
      "OUTLINE & SCRIPT PROMPTS",
      "--------------------------",
      "P11. Outline a 15-second reel script: hook,",
      "      value, CTA. Topic: [topic].",
      "P12. Structure this lesson as step-by-step",
      "      instructions: [content].",
      "P13. Write a 60-second voiceover script about",
      "      [topic]. Conversational tone.",
      "",
      "EDITING & SIMPLIFICATION PROMPTS",
      "---------------------------------",
      "P14. Simplify this for a beginner audience:",
      "      [paste text].",
      "P15. Reduce this to 3 bullet points: [text].",
      "P16. Find factual claims here and flag anything",
      "      that needs verification: [text].",
      "",
      "THUMBNAIL & TITLE PROMPTS",
      "---------------------------",
      "P17. Suggest 5 thumbnail text options for a",
      "      video titled [title].",
      "P18. Rewrite this title to include the keyword",
      "      [keyword]: [title].",
      "",
      "GOLDEN RULE: AI drafts. You decide. Never",
      "publish unedited AI output - your voice is",
      "your brand.",
    ],
  },
  {
    title: "Content & Posting Templates",
    description:
      "Fill-in-the-blank templates: bio, content pillar planner, weekly schedule, caption structure, and a one-page freelance offer.",
    fileName: "Content_Posting_Templates.pdf",
    fileType: "pdf",
    fileSize: "0.4 MB",
    sortOrder: 3,
    pdfLines: [
      "ZETAGROW STARTER BUNDLE",
      "CONTENT & POSTING TEMPLATES",
      "=============================",
      "",
      "1. BIO TEMPLATE",
      "----------------",
      "I help [audience] [result] through [method].",
      "",
      "Line 2 (credibility): [one credential or result].",
      "Line 3 (action): 'DM [word] to get started.'",
      "",
      "2. CONTENT PILLAR PLANNER",
      "---------------------------",
      "Pillar A (Educational - 60%):",
      "  Ideas: 1.______ 2.______ 3.______",
      "Pillar B (Inspirational/Story - 20%):",
      "  Ideas: 1.______ 2.______ 3.______",
      "Pillar C (Engagement - 20%):",
      "  Ideas: 1.______ 2.______ 3.______",
      "",
      "3. WEEKLY SCHEDULE",
      "-------------------",
      "Monday:   Post [idea 1] + 15 min engagement",
      "Tuesday:  Create for next post (10 min)",
      "Wednesday: Post [idea 2] + reply to comments",
      "Thursday: Engagement block (10 min)",
      "Friday:   Post [idea 3] + track results",
      "Saturday: Batch-create next week (30 min)",
      "Sunday:   Rest / weekly review (5 min)",
      "",
      "4. CAPTION STRUCTURE",
      "---------------------",
      "Line 1: Hook (repeats the reel's first line).",
      "Line 2: Value summary or key point.",
      "Line 3: Detail, example, or story.",
      "Line 4: Question or CTA.",
      "",
      "5. ONE-PAGE FREELANCE OFFER",
      "-----------------------------",
      "Service: [what you deliver]",
      "Includes: [deliverables + revisions policy]",
      "Price: [INR per project]",
      "Turnaround: [days]",
      "Next step: [how the client starts]",
      "",
      "COPY THE TEMPLATES INTO YOUR NOTES APP AND",
      "FILL THEM IN - THAT IS THE COURSE WORK.",
    ],
  },
  {
    title: "SEO & Branding Resource Pack",
    description:
      "A keyword starter sheet, title formulas, description structure, and the complete branding checklist used in Module 3 and 4.",
    fileName: "SEO_Branding_Resource_Pack.pdf",
    fileType: "pdf",
    fileSize: "0.5 MB",
    sortOrder: 4,
    pdfLines: [
      "ZETAGROW STARTER BUNDLE",
      "SEO & BRANDING RESOURCE PACK",
      "==============================",
      "",
      "PART 1: KEYWORD STARTER SHEET",
      "------------------------------",
      "Write 5 questions beginners ask about your",
      "niche (your question bank). Example topics:",
      "  - how to [action] for beginners",
      "  - best free [tool] for [task]",
      "  - [mistake] to avoid in [topic]",
      "Each question = one future piece of content.",
      "",
      "PART 2: TITLE FORMULAS",
      "------------------------",
      "F1. How to [X] without [Y]",
      "F2. [N] [mistakes/tips] for beginners in [Z]",
      "F3. [Tool] tutorial: [result] in [time]",
      "F4. The truth about [topic]",
      "F5. [X] vs [Y]: which one should you use?",
      "",
      "PART 3: DESCRIPTION STRUCTURE",
      "-------------------------------",
      "1st sentence: keyword + what the content shows.",
      "2nd sentence: what the viewer will learn.",
      "3rd sentence: your experience or context.",
      "4th: CTA (follow / save / comment).",
      "",
      "PART 4: BRANDING CHECKLIST",
      "----------------------------",
      "[ ] Same handle on all platforms",
      "[ ] Clear profile photo",
      "[ ] One-line positioning statement in bio",
      "[ ] 2 colours + 1 font for visual identity",
      "[ ] Pinned post = strongest content",
      "[ ] 3 labelled highlights/collections",
      "[ ] Caption voice matches speaking voice",
      "",
      "PART 5: ALT TEXT & FILE NAMES",
      "------------------------------",
      "Use descriptive names: reel-editing-tips.png,",
      "never IMG_2041.png. Alt text describes what",
      "the image shows for accessibility and search.",
      "",
      "REMEMBER: SEO is a habit, not a hack.",
    ],
  },
  {
    title: "Marketing Checklists",
    description:
      "Three practical checklists — Growth, Launch, and Monetization — to run as mini-audits of your progress throughout the 30-day plan.",
    fileName: "Marketing_Checklists.pdf",
    fileType: "pdf",
    fileSize: "0.3 MB",
    sortOrder: 5,
    pdfLines: [
      "ZETAGROW STARTER BUNDLE",
      "MARKETING CHECKLISTS",
      "======================",
      "",
      "CHECKLIST 1: GROWTH (WEEKLY)",
      "------------------------------",
      "[ ] Posted on my fixed schedule this week",
      "[ ] 15 minutes of real engagement daily",
      "[ ] One metric reviewed (views/saves/replies)",
      "[ ] One change made based on data",
      "[ ] Profile still answers: who/for whom/why",
      "",
      "CHECKLIST 2: LAUNCH (FIRST 7 DAYS)",
      "-----------------------------------",
      "[ ] One service chosen (one page offer ready)",
      "[ ] 2 portfolio samples created",
      "[ ] Bio rewritten with positioning statement",
      "[ ] 12 reel ideas picked from the library",
      "[ ] First 3 reels filmed in a batch",
      "",
      "CHECKLIST 3: MONETIZATION (HONEST AUDIT)",
      "------------------------------------------",
      "[ ] I understand affiliate terms fully",
      "[ ] Disclosure line drafted ('contains",
      "    affiliate links')",
      "[ ] I can genuinely recommend what I promote",
      "[ ] I know the commission lifecycle:",
      "    pending > approved > available > paid",
      "[ ] I understand refunds reverse commissions",
      "[ ] I am NOT relying on recruitment income",
      "[ ] Freelance offer sent to 3 potential clients",
      "",
      "USE THESE CHECKLISTS WEEKLY. TICK, DON'T",
      "GUESS - THEY TURN THE COURSE INTO A SYSTEM.",
    ],
  },
  {
    title: "30-Day Action Plan",
    description:
      "The week-by-week schedule and daily 30-minute routine that turns this course into results — with a daily tracker and weekly review prompts.",
    fileName: "30_Day_Action_Plan.pdf",
    fileType: "pdf",
    fileSize: "0.3 MB",
    sortOrder: 6,
    pdfLines: [
      "ZETAGROW STARTER BUNDLE",
      "30-DAY ACTION PLAN",
      "====================",
      "",
      "WEEK 1 - FOUNDATIONS (DAYS 1-7)",
      "--------------------------------",
      "D1: Profile photo + handle cleanup.",
      "D2: Bio rewritten (positioning statement).",
      "D3: One service chosen; offer drafted.",
      "D4: Portfolio sample #1 completed.",
      "D5: Portfolio sample #2 completed.",
      "D6: 12 reel ideas picked from the library.",
      "D7: Weekly review - what did you learn?",
      "",
      "WEEK 2 - FIRST OUTPUT (DAYS 8-14)",
      "-----------------------------------",
      "D8: Reel 1 filmed and posted.",
      "D9: Engage 15 min in your niche.",
      "D10: Reel 2 filmed and posted.",
      "D11: Captions batch-written with AI prompts.",
      "D12: Reel 3 filmed and posted.",
      "D13: Offer sent to 1 potential client.",
      "D14: Weekly review - pick one win.",
      "",
      "WEEK 3 - CONSISTENCY (DAYS 15-21)",
      "-----------------------------------",
      "D15: Reel 4 posted on schedule.",
      "D16: Apply to 1 eligible work opportunity.",
      "D17: Reel 5 posted; track results.",
      "D18: Content batched for next week.",
      "D19: Apply to 2nd eligible opportunity.",
      "D20: Engage + reply to all comments.",
      "D21: Weekly review - which format won?",
      "",
      "WEEK 4 - REVIEW & ADJUST (DAYS 22-30)",
      "---------------------------------------",
      "D22: Double down on best format.",
      "D23: Offer sent to 2 more clients.",
      "D24: Monetization checklist completed.",
      "D25: Best reel reposted with new hook.",
      "D26: Portfolio updated with samples.",
      "D27: Goals set for month two.",
      "D28: Tracker totals reviewed.",
      "D29: Thank-you note to anyone who helped.",
      "D30: Month one review - celebrate + plan.",
      "",
      "DAILY MINIMUM (30 MINUTES TOTAL)",
      "----------------------------------",
      "10 min: create. 10 min: engage.",
      "10 min: learn from the bundle.",
      "",
      "TRACKER: Tick every day. Never miss two",
      "days in a row. Consistency beats intensity.",
      "",
      "NO INCOME GUARANTEE - BUT A GUARANTEED",
      "STRUCTURE. THE RESULT IS UP TO YOU.",
    ],
  },
];