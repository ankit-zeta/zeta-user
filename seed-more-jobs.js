// Bulk seed 88 more jobs with complete info
const { ConvexClient } = require('convex/browser');
const client = new ConvexClient('https://terrific-dove-836.convex.cloud');

const PROGRAMS = {
  'kx7267y81244fk44kev0y3thps8czcra': 'Basics of Sales',
  'kx7fag6a1rh52d4v3db7zfqpcs8cys8q': 'Fundamentals of Sales Psychology',
  'kx7ab668c5v2kazrpk79hp1wz18czpkk': 'Lead Generation Essentials',
  'kx7794s24ahkvbjxd6gsw26dwn8cz900': 'Business Communication Mastery',
  'kx747n4w3zk6q42f7vjz0v877h8czm8e': 'Shopify Store Setup',
  'kx76q22hyexm9djdx1nahz1s698cz9hn': 'WooCommerce Store Setup',
  'kx7644g3t74j6240qyf8gavrh18czp26': 'Running Ads For Business',
  'kx7453a1d06fe3t73z437p1mch8cysrw': 'Choose Your Business Niche',
  'kx7b0fgsbvcq9adcq3p75dmhyd8cyrza': 'Content Marketing Basics',
  'kx7dw7c6n5j2bv8pxq2temsya18czz6j': 'Customer Support & Retention',
  'kx7epemaxbr91vynfhy38yfbrh8cyfb3': 'Coding Foundations',
  'kx73qkkghg8n7ammj4f4zfvw7d8cy9we': 'Build Your First Website',
  'kx7dekh67yd80ehbp2gdchs09n8czvt1': 'Social Media Marketing Systems',
  'kx72dkyx730van9m45bpqn66158cz6vn': 'Meta Ads Deep Dive',
  'kx72gzncgmc0gnqdtvjq7e88bn8cz4kr': 'Google Ads Essentials',
  'kx74py99dbndt339bzr6vd8sx58cy4mg': 'Analytics & Tracking Setup',
  'kx78cp2w8jakcfjtvhms98zqbs8czfgf': 'Automation & No-Code Tools',
  'kx70e9cmr175gnqfxe04f73dyn8cy9wj': 'Freelancing & Client Management',
  'kx79jxnmtbmb6hn1k4g7nzfksd8cy4az': 'Complete Coding: Basics to Advanced',
  'kx75g9ns13ffp0x6c67d9zdnc18cz8qq': 'Gen AI & Prompting Mastery',
  'kx742mww8bw21vyaye5h8ahrt58cy50c': 'Building Products With AI Tools',
  'kx7b6jgvgd3ek5h0vw8xrrbcn98czkz3': 'Meta Ads Scaling Strategies',
  'kx7f4p85wz5rqjmh49fmmfbcn18cy46v': 'Google Ads Advanced Scaling',
  'kx7fkmmmkvx5tm2j1tmjab6szs8czrd7': 'Launch Your Own Product',
  'kx7dh5x0889kx16m4nv9kkc3618czeqx': 'Growth Analytics & Funnels',
  'kx7bcnbz3fyqyexk2p6f32gfw98cya0q': 'Email Marketing Automation',
  'kx70y2ypwbngaw4eatg116rx0x8cz497': 'Freelance to Agency Systems',
  'kx7d9d4s5j1aaxkqmqfh9wtpx98cye5s': 'Capstone: Launch a Real Project',
};
const PIDS = Object.keys(PROGRAMS);

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function futureDate() {
  const d = new Date();
  d.setDate(d.getDate() + rand(7, 60));
  return d.toISOString().split('T')[0];
}

const NEW_JOBS = [
  // Content & Writing (12)
  { title: "Blog Content Writing for SaaS Brand", category: "Content & Writing", skills: ["Blog Writing", "SEO", "SaaS", "Copywriting"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "TechStart India", requiredProgramId: "kx7794s24ahkvbjxd6gsw26dwn8cz900" },
  { title: "Product Description Writing for Fashion E-Store", category: "Content & Writing", skills: ["Product Writing", "Fashion", "E-Commerce", "Copywriting"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "StyleVibe", requiredProgramId: null },
  { title: "Email Newsletter Copywriting — Weekly Series", category: "Content & Writing", skills: ["Email Marketing", "Copywriting", "Newsletter", "D2C"], difficulty: "intermediate", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "GrowthBox", requiredProgramId: "kx7bcnbz3fyqyexk2p6f32gfw98cya0q" },
  { title: "Technical Documentation for API Product", category: "Content & Writing", skills: ["Technical Writing", "API Docs", "Markdown", "Developer Tools"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1-2 weeks", company: "DevStack", requiredProgramId: "kx79jxnmtbmb6hn1k4g7nzfksd8cy4az" },
  { title: "Landing Page Copy for Startup Launch", category: "Content & Writing", skills: ["Landing Page", "Conversion Copy", "Startup", "CTA"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "LaunchPad Labs", requiredProgramId: "kx7b0fgsbvcq9adcq3p75dmhyd8cyrza" },
  { title: "Whitepaper Research & Writing for FinTech", category: "Content & Writing", skills: ["Research", "Whitepaper", "FinTech", "Long-form"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 weeks", company: "FinGrow", requiredProgramId: null },
  { title: "Case Study Writing for Agency Portfolio", category: "Content & Writing", skills: ["Case Study", "Storytelling", "B2B", "Portfolio"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "4-5 days", company: "DigitalFirst Agency", requiredProgramId: "kx7794s24ahkvbjxd6gsw26dwn8cz900" },
  { title: "SEO Content Cluster Strategy & Writing", category: "Content & Writing", skills: ["SEO", "Content Strategy", "Pillar Pages", "Keyword Research"], difficulty: "intermediate", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "RankUp Media", requiredProgramId: "kx7b0fgsbvcq9adcq3p75dmhyd8cyrza" },
  { title: "YouTube Script Writing for Education Channel", category: "Content & Writing", skills: ["YouTube Scripts", "Education", "Engagement", "Storytelling"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "LearnHub", requiredProgramId: null },
  { title: "Social Media Captions Pack — 30 Days", category: "Content & Writing", skills: ["Social Media", "Captions", "Brand Voice", "Instagram"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "BrandFirst", requiredProgramId: "kx7dekh67yd80ehbp2gdchs09n8czvt1" },
  { title: "Podcast Show Notes & Transcription", category: "Content & Writing", skills: ["Podcast", "Transcription", "Show Notes", "Audio"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "1-2 days", company: "AudioWave", requiredProgramId: null },
  { title: "Website Content Rewrite for Rebranding", category: "Content & Writing", skills: ["Website Copy", "Rebranding", "Tone of Voice", "UX Writing"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "FreshBrand Co", requiredProgramId: "kx7794s24ahkvbjxd6gsw26dwn8cz900" },

  // Social & Marketing (12)
  { title: "Instagram Reels Strategy for Restaurant Chain", category: "Social & Marketing", skills: ["Instagram Reels", "Food Marketing", "Strategy", "Content Calendar"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "FoodieBuzz", requiredProgramId: "kx7dekh67yd80ehbp2gdchs09n8czvt1" },
  { title: "LinkedIn Thought Leadership Campaign", category: "Social & Marketing", skills: ["LinkedIn", "B2B Marketing", "Thought Leadership", "Content"], difficulty: "advanced", paymentType: "milestone", workType: "remote", estimatedDuration: "3 weeks", company: "B2B Growth Co", requiredProgramId: "kx7dekh67yd80ehbp2gdchs09n8czvt1" },
  { title: "Google Ads Campaign Setup for Local Business", category: "Social & Marketing", skills: ["Google Ads", "Local SEO", "PPC", "Lead Generation"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "LocalBiz Digital", requiredProgramId: "kx72gzncgmc0gnqdtvjq7e88bn8cz4kr" },
  { title: "Meta Ads A/B Testing & Optimization", category: "Social & Marketing", skills: ["Meta Ads", "A/B Testing", "Facebook", "Instagram Ads"], difficulty: "advanced", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "AdOptimize", requiredProgramId: "kx72dkyx730van9m45bpqn66158cz6vn" },
  { title: "WhatsApp Business Automation Setup", category: "Social & Marketing", skills: ["WhatsApp Business", "Automation", "Chatbot", "CRM"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "ChatFirst", requiredProgramId: "kx78cp2w8jakcfjtvhms98zqbs8czfgf" },
  { title: "Influencer Marketing Campaign Management", category: "Social & Marketing", skills: ["Influencer Marketing", "Campaign Management", "Negotiation", "ROI"], difficulty: "intermediate", paymentType: "milestone", workType: "remote", estimatedDuration: "3 weeks", company: "InfluencerHub", requiredProgramId: null },
  { title: "Email Drip Campaign Setup — 7 Email Sequence", category: "Social & Marketing", skills: ["Email Marketing", "Drip Campaign", "Automation", "Copywriting"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "5-7 days", company: "MailGrow", requiredProgramId: "kx7bcnbz3fyqyexk2p6f32gfw98cya0q" },
  { title: "Google Analytics 4 Setup & Dashboard Creation", category: "Social & Marketing", skills: ["Google Analytics", "GA4", "Dashboard", "Data Analysis"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "DataPulse", requiredProgramId: "kx74py99dbndt339bzr6vd8sx58cy4mg" },
  { title: "Pinterest Marketing Strategy for Handmade Brand", category: "Social & Marketing", skills: ["Pinterest", "Visual Marketing", "E-Commerce", "Strategy"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "4-5 days", company: "CraftBiz India", requiredProgramId: null },
  { title: "Meta Pixel & Conversion API Setup", category: "Social & Marketing", skills: ["Meta Pixel", "Conversions API", "Tracking", "Facebook"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "TrackRight", requiredProgramId: "kx74py99dbndt339bzr6vd8sx58cy4mg" },
  { title: "SEO Audit & Action Plan for E-Commerce Site", category: "Social & Marketing", skills: ["SEO Audit", "Technical SEO", "E-Commerce", "Keyword Research"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "RankFirst", requiredProgramId: "kx7b0fgsbvcq9adcq3p75dmhyd8cyrza" },
  { title: "Social Media Competitor Analysis Report", category: "Social & Marketing", skills: ["Competitor Analysis", "Social Media", "Report Writing", "Analytics"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "MarketInsight", requiredProgramId: null },

  // Web & Technical (12)
  { title: "Shopify Store Setup with Custom Theme", category: "Web & Technical", skills: ["Shopify", "Liquid", "Theme Customization", "E-Commerce"], difficulty: "intermediate", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "ShopBuild", requiredProgramId: "kx747n4w3zk6q42f7vjz0v877h8czm8e" },
  { title: "Landing Page Development — React/Next.js", category: "Web & Technical", skills: ["React", "Next.js", "Tailwind CSS", "Landing Page"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "WebCraft Studio", requiredProgramId: "kx73qkkghg8n7ammj4f4zfvw7d8cy9we" },
  { title: "WordPress Website Maintenance & Updates", category: "Web & Technical", skills: ["WordPress", "PHP", "Maintenance", "Security"], difficulty: "beginner", paymentType: "hourly", workType: "remote", estimatedDuration: "Ongoing", company: "WP Care India", requiredProgramId: null },
  { title: "Custom Web Scraper Development — Python", category: "Web & Technical", skills: ["Python", "Web Scraping", "BeautifulSoup", "Automation"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "5-7 days", company: "DataExtract", requiredProgramId: "kx79jxnmtbmb6hn1k4g7nzfksd8cy4az" },
  { title: "No-Code Automation Workflow — Zapier/Make", category: "Web & Technical", skills: ["Zapier", "Make.com", "Automation", "Integration"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "AutoFlow", requiredProgramId: "kx78cp2w8jakcfjtvhms98zqbs8czfgf" },
  { title: "Figma to HTML Conversion — Responsive", category: "Web & Technical", skills: ["Figma", "HTML", "CSS", "Responsive Design"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "4-5 days", company: "PixelPerfect", requiredProgramId: "kx73qkkghg8n7ammj4f4zfvw7d8cy9we" },
  { title: "API Integration — Payment Gateway Setup", category: "Web & Technical", skills: ["API Integration", "Razorpay", "Node.js", "Payment"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "PayStack India", requiredProgramId: "kx79jxnmtbmb6hn1k4g7nzfksd8cy4az" },
  { title: "Database Design & Migration — PostgreSQL", category: "Web & Technical", skills: ["PostgreSQL", "Database Design", "Migration", "SQL"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1-2 weeks", company: "DataLayer", requiredProgramId: "kx79jxnmtbmb6hn1k4g7nzfksd8cy4az" },
  { title: "Mobile App UI Development — React Native", category: "Web & Technical", skills: ["React Native", "Mobile", "UI Development", "Expo"], difficulty: "advanced", paymentType: "milestone", workType: "remote", estimatedDuration: "3 weeks", company: "AppCraft", requiredProgramId: "kx79jxnmtbmb6hn1k4g7nzfksd8cy4az" },
  { title: "Elementor Page Building for Corporate Site", category: "Web & Technical", skills: ["Elementor", "WordPress", "Page Builder", "Design"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "SiteBuild Pro", requiredProgramId: null },
  { title: "Webhook & Automation Script Development", category: "Web & Technical", skills: ["Webhooks", "Node.js", "Automation", "API"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "AutoDev", requiredProgramId: "kx78cp2w8jakcfjtvhms98zqbs8czfgf" },
  { title: "Speed Optimization — Core Web Vitals", category: "Web & Technical", skills: ["PageSpeed", "Core Web Vitals", "Performance", "Lighthouse"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "SpeedBoost", requiredProgramId: "kx74py99dbndt339bzr6vd8sx58cy4mg" },

  // Media Production (10)
  { title: "Product Video Editing — E-Commerce Listings", category: "Media Production", skills: ["Video Editing", "Product Video", "Premiere Pro", "E-Commerce"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "VidShop", requiredProgramId: "kx742mww8bw21vyaye5h8ahrt58cy50c" },
  { title: "YouTube Channel Setup & Branding Package", category: "Media Production", skills: ["YouTube", "Branding", "Channel Art", "Thumbnail Design"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "TubeBrand", requiredProgramId: null },
  { title: "UGC-Style Ad Video Creation — D2C Brand", category: "Media Production", skills: ["UGC", "Ad Video", "D2C", "Content Creation"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "5-7 days", company: "UGC Studio", requiredProgramId: "kx742mww8bw21vyaye5h8ahrt58cy50c" },
  { title: "Podcast Editing & Mastering — 4 Episodes", category: "Media Production", skills: ["Podcast Editing", "Audio Mastering", "Adobe Audition", "Mixing"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "SoundStudio", requiredProgramId: null },
  { title: "Motion Graphics Intro for YouTube Channel", category: "Media Production", skills: ["Motion Graphics", "After Effects", "Animation", "Intro"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "MotionLab", requiredProgramId: "kx742mww8bw21vyaye5h8ahrt58cy50c" },
  { title: "Instagram Carousel Design — 10 Slides", category: "Media Production", skills: ["Carousel Design", "Canva", "Instagram", "Visual Design"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "DesignFirst", requiredProgramId: null },
  { title: "Explainer Video Script & Storyboard", category: "Media Production", skills: ["Explainer Video", "Storyboard", "Script Writing", "Animation"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "5-7 days", company: "StoryVid", requiredProgramId: "kx742mww8bw21vyaye5h8ahrt58cy50c" },
  { title: "Social Media Video Reels Package — 15 Reels", category: "Media Production", skills: ["Reels", "Short-form Video", "CapCut", "Trending"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "ReelCraft", requiredProgramId: null },
  { title: "Screen Recording Tutorial Production", category: "Media Production", skills: ["Screen Recording", "Tutorial", "Video Editing", "Education"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "LearnVid", requiredProgramId: null },
  { title: "Brand Intro & Outro Video Creation", category: "Media Production", skills: ["Brand Video", "Intro/Outro", "After Effects", "Logo Animation"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "BrandVid Studio", requiredProgramId: "kx742mww8bw21vyaye5h8ahrt58cy50c" },

  // E-Commerce (10)
  { title: "Shopify Product Listing & Optimization — 50 Products", category: "E-Commerce", skills: ["Shopify", "Product Listing", "SEO", "E-Commerce"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "ShopOptimize", requiredProgramId: "kx747n4w3zk6q42f7vjz0v877h8czm8e" },
  { title: "WooCommerce Store Configuration & Theme Setup", category: "E-Commerce", skills: ["WooCommerce", "WordPress", "Theme Setup", "Store Config"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "5-7 days", company: "WooBuild", requiredProgramId: "kx76q22hyexm9djdx1nahz1s698cz9hn" },
  { title: "Product Photography Editing — 100 Images", category: "E-Commerce", skills: ["Photo Editing", "Product Photography", "Lightroom", "Retouching"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "PhotoEdit Pro", requiredProgramId: null },
  { title: "Amazon Seller Account Setup & Optimization", category: "E-Commerce", skills: ["Amazon Seller", "Marketplace", "Listing Optimization", "PPC"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "MarketReady", requiredProgramId: null },
  { title: "Dropshipping Store Setup — Complete Launch", category: "E-Commerce", skills: ["Dropshipping", "Shopify", "AliExpress", "Store Launch"], difficulty: "beginner", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "DropLaunch", requiredProgramId: "kx747n4w3zk6q42f7vjz0v877h8czm8e" },
  { title: "Product Listing Ad Campaign — Google Shopping", category: "E-Commerce", skills: ["Google Shopping", "Product Ads", "PPC", "E-Commerce"], difficulty: "advanced", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "ShopAds", requiredProgramId: "kx72gzncgmc0gnqdtvjq7e88bn8cz4kr" },
  { title: "Customer Review Collection Automation", category: "E-Commerce", skills: ["Review Collection", "Automation", "Email", "Trust"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "ReviewGrow", requiredProgramId: "kx7dw7c6n5j2bv8pxq2temsya18czz6j" },
  { title: "E-Commerce Checkout Optimization", category: "E-Commerce", skills: ["Checkout Optimization", "Conversion", "UX", "A/B Testing"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "ConvertMax", requiredProgramId: "kx74py99dbndt339bzr6vd8sx58cy4mg" },
  { title: "Subscription Box Store Setup", category: "E-Commerce", skills: ["Subscription", "Shopify", "Recurring Billing", "Store Setup"], difficulty: "intermediate", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "SubBox India", requiredProgramId: "kx747n4w3zk6q42f7vjz0v877h8czm8e" },
  { title: "Competitor Price Monitoring Dashboard", category: "E-Commerce", skills: ["Price Monitoring", "Dashboard", "Data Analysis", "Automation"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "PriceTrack", requiredProgramId: "kx74py99dbndt339bzr6vd8sx58cy4mg" },

  // Operations (10)
  { title: "Virtual Assistant — Executive Support (20 hrs/week)", category: "Operations", skills: ["Virtual Assistant", "Email Management", "Scheduling", "Admin"], difficulty: "beginner", paymentType: "hourly", workType: "remote", estimatedDuration: "Ongoing", company: "AdminPro", requiredProgramId: null },
  { title: "CRM Setup & Contact Management — HubSpot", category: "Operations", skills: ["HubSpot", "CRM", "Contact Management", "Setup"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "CRM Setup India", requiredProgramId: null },
  { title: "Data Entry & Spreadsheet Management — 500 Records", category: "Operations", skills: ["Data Entry", "Excel", "Google Sheets", "Accuracy"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "DataQuick", requiredProgramId: null },
  { title: "Project Management Setup — Notion/Asana", category: "Operations", skills: ["Notion", "Asana", "Project Management", "Workflow"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "WorkFlow Pro", requiredProgramId: null },
  { title: "Customer Support Ticket Management — 100 Tickets", category: "Operations", skills: ["Customer Support", "Ticket Management", "Zendesk", "Communication"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "SupportFirst", requiredProgramId: "kx7dw7c6n5j2bv8pxq2temsya18czz6j" },
  { title: "Order Fulfillment Process Documentation", category: "Operations", skills: ["Process Documentation", "SOP", "Operations", "E-Commerce"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "ProcessFirst", requiredProgramId: null },
  { title: "Inventory Management System Setup", category: "Operations", skills: ["Inventory", "System Setup", "Spreadsheet", "Automation"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "StockManager", requiredProgramId: null },
  { title: "Bookkeeping & Financial Data Entry", category: "Operations", skills: ["Bookkeeping", "Financial Data", "Tally", "Excel"], difficulty: "beginner", paymentType: "hourly", workType: "remote", estimatedDuration: "Ongoing", company: "FinanceBooks", requiredProgramId: null },
  { title: "Lead Research & Contact List Building — 200 Leads", category: "Operations", skills: ["Lead Research", "Contact Building", "LinkedIn", "B2B"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "LeadFind", requiredProgramId: "kx7ab668c5v2kazrpk79hp1wz18czpkk" },
  { title: "Event Coordination — Virtual Webinar Setup", category: "Operations", skills: ["Event Coordination", "Webinar", "Zoom", "Scheduling"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "EventPro", requiredProgramId: null },

  // Design & Creative (10)
  { title: "Brand Identity Design — Logo & Guidelines", category: "Design & Creative", skills: ["Logo Design", "Brand Identity", "Illustrator", "Brand Guidelines"], difficulty: "advanced", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "BrandStudio", requiredProgramId: "kx742mww8bw21vyaye5h8ahrt58cy50c" },
  { title: "Social Media Post Design — 30 Templates", category: "Design & Creative", skills: ["Social Media Design", "Canva", "Templates", "Instagram"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "DesignPack", requiredProgramId: null },
  { title: "UI/UX Design for Mobile App — 10 Screens", category: "Design & Creative", skills: ["UI/UX", "Figma", "Mobile Design", "Wireframing"], difficulty: "advanced", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "UXCraft", requiredProgramId: "kx742mww8bw21vyaye5h8ahrt58cy50c" },
  { title: "Presentation Design — 20 Slides Pitch Deck", category: "Design & Creative", skills: ["Presentation", "Pitch Deck", "PowerPoint", "Visual Design"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "SlideCraft", requiredProgramId: null },
  { title: "Infographic Design — Data Visualization", category: "Design & Creative", skills: ["Infographic", "Data Visualization", "Illustrator", "Design"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "InfoDesign", requiredProgramId: null },
  { title: "Email Template Design — Responsive HTML", category: "Design & Creative", skills: ["Email Design", "HTML", "Responsive", "Mailchimp"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-4 days", company: "MailDesign", requiredProgramId: "kx7bcnbz3fyqyexk2p6f32gfw98cya0q" },
  { title: "Package Design for D2C Product", category: "Design & Creative", skills: ["Package Design", "Product Packaging", "Illustrator", "Print"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1-2 weeks", company: "PackDesign Studio", requiredProgramId: null },
  { title: "Website Banner & Ad Creatives — 10 Sizes", category: "Design & Creative", skills: ["Banner Design", "Ad Creatives", "Photoshop", "Display Ads"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "AdCreative Pro", requiredProgramId: null },
  { title: "Icon Set Design — 50 Custom Icons", category: "Design & Creative", skills: ["Icon Design", "Illustrator", "SVG", "UI Design"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "IconLab", requiredProgramId: null },
  { title: "Menu Design for Restaurant Chain — Digital & Print", category: "Design & Creative", skills: ["Menu Design", "Print Design", "InDesign", "Restaurant"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "5-7 days", company: "FoodDesign Co", requiredProgramId: null },

  // Freelancing / AI (12)
  { title: "AI-Powered Content Generation Pipeline", category: "Web & Technical", skills: ["AI", "ChatGPT", "Automation", "Content"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "AI Content Lab", requiredProgramId: "kx75g9ns13ffp0x6c67d9zdnc18cz8qq" },
  { title: "Prompt Engineering for Marketing Copy", category: "Content & Writing", skills: ["Prompt Engineering", "AI", "Marketing", "Copywriting"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "3-5 days", company: "PromptCraft", requiredProgramId: "kx75g9ns13ffp0x6c67d9zdnc18cz8qq" },
  { title: "AI Chatbot Development for Customer Support", category: "Web & Technical", skills: ["AI Chatbot", "Customer Support", "NLP", "Automation"], difficulty: "advanced", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "ChatBot India", requiredProgramId: "kx742mww8bw21vyaye5h8ahrt58cy50c" },
  { title: "Freebie Landing Page + Lead Magnet Setup", category: "Social & Marketing", skills: ["Landing Page", "Lead Magnet", "Email Capture", "Conversion"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "LeadFirst", requiredProgramId: "kx7b0fgsbvcq9adcq3p75dmhyd8cyrza" },
  { title: "Client Outreach Email Sequence — 50 Emails", category: "Content & Writing", skills: ["Cold Email", "Outreach", "Copywriting", "B2B"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "4-5 days", company: "OutreachPro", requiredProgramId: "kx70e9cmr175gnqfxe04f73dyn8cy9wj" },
  { title: "Freelancer Portfolio Website Development", category: "Web & Technical", skills: ["Portfolio", "Next.js", "Freelancing", "Personal Brand"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "PortfolioCraft", requiredProgramId: "kx70e9cmr175gnqfxe04f73dyn8cy9wj" },
  { title: "AI Image Generation for Social Media", category: "Media Production", skills: ["AI Image", "Midjourney", "DALL-E", "Social Media"], difficulty: "beginner", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "AI Visual Studio", requiredProgramId: "kx75g9ns13ffp0x6c67d9zdnc18cz8qq" },
  { title: "No-Code MVP Development — Bubble.io", category: "Web & Technical", skills: ["Bubble.io", "No-Code", "MVP", "Startup"], difficulty: "intermediate", paymentType: "milestone", workType: "remote", estimatedDuration: "2 weeks", company: "MVP Factory", requiredProgramId: "kx78cp2w8jakcfjtvhms98zqbs8czfgf" },
  { title: "Affiliate Program Setup & Management", category: "Operations", skills: ["Affiliate Marketing", "Program Setup", "Tracking", "Commission"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "AffiliateHub", requiredProgramId: "kx70e9cmr175gnqfxe04f73dyn8cy9wj" },
  { title: "Google Search Console & Sitemap Optimization", category: "Social & Marketing", skills: ["Search Console", "Sitemap", "Technical SEO", "Indexing"], difficulty: "intermediate", paymentType: "fixed", workType: "remote", estimatedDuration: "2-3 days", company: "SEO Tech Pro", requiredProgramId: "kx74py99dbndt339bzr6vd8sx58cy4mg" },
  { title: "Course Content Creation — Sales Module", category: "Content & Writing", skills: ["Course Creation", "Sales Training", "Content Design", "Education"], difficulty: "advanced", paymentType: "milestone", workType: "remote", estimatedDuration: "3 weeks", company: "EduContent India", requiredProgramId: "kx7d9d4s5j1aaxkqmqfh9wtpx98cye5s" },
  { title: "Growth Hacking Experiment Design", category: "Social & Marketing", skills: ["Growth Hacking", "Experiment Design", "Analytics", "Strategy"], difficulty: "advanced", paymentType: "fixed", workType: "remote", estimatedDuration: "1 week", company: "GrowthLab", requiredProgramId: "kx7dh5x0889kx16m4nv9kkc3618czeqx" },
];

function buildJob(j) {
  const slug = slugify(j.title) + '-' + rand(100, 999);
  const hasReq = j.requiredProgramId !== null && j.requiredProgramId !== undefined;
  const tier = hasReq ? (PIDS.indexOf(j.requiredProgramId) < 4 ? 1 : PIDS.indexOf(j.requiredProgramId) < 10 ? 2 : PIDS.indexOf(j.requiredProgramId) < 18 ? 3 : 4) : 0;
  const payRanges = [[200,800],[800,2000],[1500,3500],[3000,6000],[5000,15000]];
  const [min, max] = payRanges[tier];
  const payment = rand(min, max);
  return {
    title: j.title,
    slug,
    shortDescription: `Professional ${j.category.toLowerCase()} project. ${j.difficulty} level work requiring skills in ${j.skills.slice(0, 3).join(', ')}.`,
    description: `Project Overview:\n\nWe are looking for a skilled professional to complete this ${j.category.toLowerCase()} project. This is a ${j.difficulty} level assignment.\n\nKey Responsibilities:\n- Deliver high-quality ${j.category.toLowerCase()} work\n- Meet project deadlines and quality standards\n- Communicate progress regularly\n- Implement feedback and revisions as needed\n\nWhat You Will Learn:\n- Apply practical skills from your training\n- Work with real client requirements\n- Build your professional portfolio\n- Earn based on your skill level${hasReq ? '\n\nCertificate Required: Yes — complete the required program to unlock this opportunity.' : '\n\nNote: This opportunity is open to all skilled individuals. No ZetaGrow certificate required, but certification can help you access higher-paying projects.'}`,
    category: j.category,
    skills: j.skills,
    requirements: [
      `Strong skills in ${j.skills[0]}`,
      `Experience with ${j.skills.slice(1).join(', ')}`,
      "Ability to meet deadlines",
      "Good communication skills",
      hasReq ? "ZetaGrow certificate in the required program" : "Portfolio or samples of previous work",
    ],
    requiredProgramId: j.requiredProgramId || undefined,
    payment,
    paymentType: j.paymentType,
    workType: j.workType,
    difficulty: j.difficulty,
    estimatedDuration: j.estimatedDuration,
    deadline: futureDate(),
    openings: rand(1, 10),
    applicationQuestions: [
      "Describe your relevant experience for this project.",
      "How would you approach this task?",
      "What is your estimated turnaround time?",
    ],
    company: j.company,
    applicantCount: rand(200, 5000),
  };
}

async function main() {
  const jobs = NEW_JOBS.map(buildJob);
  console.log(`Creating ${jobs.length} new jobs...`);

  // Upload in batches of 20
  for (let i = 0; i < jobs.length; i += 20) {
    const batch = jobs.slice(i, i + 20);
    const result = await client.mutation('jobs:bulkCreateJobs', { jobs: batch });
    console.log(`  Batch ${Math.floor(i / 20) + 1}: ${result.count} jobs created`);
  }

  const total = await client.query('jobs:getPublicJobs', { limit: 1 });
  console.log(`\nDone! Total jobs in database: ${total.total}`);
  client.close();
}

main().catch(e => { console.error(e); client.close(); });
