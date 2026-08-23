# ZetaGrow — SEO Strategy & Growth Plan
*Prepared: Aug 2026 · Market: India · Language: English (+regional later)*

---

## 1. Positioning Guardrails (Non-Negotiable)

ZetaGrow must rank as an **education platform**, never alongside MLM/network-marketing results.

**Always frame around:** courses, certificates, skills, learning, training, career, freelancing, work marketplace.
**Never use in titles/meta/H1s:** earn money, income, passive income, work from home & earn, investment, returns, team building, join under me.
**Required trust phrases** on commercial pages: "verified certificate", "course test", "self-paced text lessons", "no income promises".

---

## 2. Keyword Strategy

### Tier-1 Money Keywords (plan/course pages)
| Keyword | Intent | Target page |
|---|---|---|
| online courses with certificates india | Transactional | /plans |
| digital marketing course with certificate | Transactional | /plans/digital-marketing-web-professional |
| shopify course for beginners india | Transactional | /programs/shopify-store-setup |
| woocommerce course online | Transactional | /programs/woocommerce-store-setup |
| meta ads course india | Transactional | /programs/meta-ads-deep-dive |
| google ads course for beginners | Transactional | /programs/google-ads-essentials |
| ai prompting course india | Transactional | /programs/gen-ai-prompting-mastery |
| coding course from scratch india | Transactional | /programs/coding-foundations |
| lead generation course online | Transactional | /programs/lead-generation-essentials |
| sales communication course online | Transactional | /plans/sales-communication-essentials |

### Tier-2 Informational (blog/content)
learn digital marketing free vs paid · how to start ecommerce business india · what is prompt engineering · how to become a freelancer in india · google ads vs meta ads for small business · how to verify an online certificate · best skills to learn for remote work india

### Tier-3 Branded/Trust
zetagrow reviews · zetagrow certificate verify · is zetagrow genuine → served by /certificate/[id], about, and consistent NAP info.

**Rule:** every money page = one primary keyword in title/H1/URL/first paragraph; informational posts link to ONE money page (internal linking).

---

## 3. On-Page Map (current state after this update)

✅ Done now:
- Unique meta titles/descriptions per template + OG/Twitter tags
- EducationalOrganization JSON-LD (sitewide), FAQPage JSON-LD (home)
- Dynamic `sitemap.xml` (50 URLs incl. all plans & courses) + `robots.txt`
- Homepage sections: audience segment content, FAQ, internal links to every course (crawlable rails)
- Clean heading hierarchy, image alts, mobile-first layout, no intrusive interstitials

Next on-page passes:
- Per-course `Course` + `Offer` JSON-LD on /programs/[slug] (price = parent plan price)
- Breadcrumbs (visible + BreadcrumbList schema) on plan/course pages
- Plan comparison table as real `<table>` with captions (rich result eligible)

## 4. Technical Audit — Findings

| # | Finding | Status |
|---|---|---|
| 1 | No metadataBase/OG/Twitter before | ✅ Fixed |
| 2 | No sitemap/robots | ✅ Fixed |
| 3 | Fake AggregateRating markup risk | ✅ Removed |
| 4 | Client-only rendering of key content (courses render post-JS) | ⚠️ Acceptable; monitor indexing. Long-term: server-render course names via RSC queries |
| 5 | Legacy noindex pages (affiliate-guidelines) | Intentional keep |
| 6 | Single canonical domain — pick apex or www and redirect | 🔲 TODO at deploy (host-level 301) |
| 7 | Core Web Vitals | Good baseline; compress Unsplash thumbs to `/public` copies later |

## 5. Content Calendar (first 12 weeks, 1 post/week)

1. Best Online Courses With Certificates in India (2026 Guide)
2. Shopify vs WooCommerce for Indian Sellers
3. Meta Ads vs Google Ads: Where Should Beginners Start?
4. How to Verify Any ZetaGrow Certificate (Public ID System)
5. What Is Prompt Engineering? A Beginner's Guide
6. Lead Generation Basics for Indian Small Businesses
7. How to Become a Freelancer in India (Skill Path Included)
8. GA4 Setup Checklist for Non-Technical Founders
9. Sales Fundamentals: The Only Framework You Need
10. Coding From Zero: A Realistic 90-Day Roadmap
11. WhatsApp Marketing Playbook for Local Businesses
12. Certificate Courses vs YouTube Learning: An Honest Comparison

Each post: 1200–1800 words, one CTA to a specific plan, FAQ block, author byline.

## 6. E-E-A-T Plan
- Add instructor/reviewer bios ("Curriculum reviewed by …") on course pages
- Publish refund/terms/policies prominently (done) + company address on contact
- Collect & display written learner testimonials (text first, later video)
- Get listed on G2/Trustpilot-alternatives + Google Business Profile

## 7. KPI Targets

| Metric | Baseline | Month 3 | Month 6 | Month 12 |
|---|---|---|---|---|
| Indexed pages | ~20 | 60+ | 80+ | 120+ |
| Organic clicks/mo (GSC) | 0 | 500 | 3,000 | 10,000 |
| Keywords in top 20 | 0 | 40 | 120 | 300 |
| Top-10 keywords | 0 | 5 | 25 | 70 |
| Backlinks (referring domains) | <5 | 15 | 35 | 75 |

## 8. Off-Site / Authority (Months 2+)
- Guest posts on Indian ed-tech & freelancer blogs (2/mo)
- Quora/Reddit answers linking informational posts (no money-page spam)
- Directory citations: JustDial, Sulekha edu category, Coursera-style aggregators
- PR angle: "India's text-first learning platform" pitch to startup media

## 9. Measurement Setup (TODO next session)
- [ ] Google Search Console verification + sitemap submit
- [ ] GA4 events: plan_view, checkout_start, purchase, lesson_complete
- [ ] Microsoft Clarity heatmap on /plans
