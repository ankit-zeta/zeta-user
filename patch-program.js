const { ConvexHttpClient } = require('convex/browser');
const client = new ConvexHttpClient('https://terrific-dove-836.convex.cloud');

async function main() {
  try {
    const result = await client.mutation('programs:updateProgram', {
      token: "admin-token-placeholder",
      programId: "kx7f4p85wz5rqjmh49fmmfbcn18cy46v",
      name: "Google Ads Advanced Scaling",
      slug: "google-ads-scaling",
      shortDescription: "Expand search, YouTube and PMax campaigns into growth engines.",
      description: "Keyword expansion systems, deep bidding strategy control, responsive search ad mastery, YouTube scripts that convert, PMax asset groups, and feed optimization.",
      price: 0,
      compareAtPrice: null,
      status: "published",
      thumbnail: "kg2emn38d4aqj5wzsat9cqnhgn8dhgyt",
      bannerImage: "kg2emn38d4aqj5wzsat9cqnhgn8dhgyt",
      duration: "2 Weeks",
      accessDuration: "Lifetime Access",
      certificateEnabled: true,
      affiliateEnabled: true,
      format: "text",
      category: "Digital Skills",
      sortOrder: 10,
      whatIncluded: ["Module 1: Advanced Search", "Module 2: Growth Channels"],
      outcomes: [
        "Practical, text-based lessons you can apply immediately",
        "Short knowledge tests after every module set",
        "A verified certificate on course completion"
      ],
      faqs: [
        {"question": "How is this course delivered?", "answer": "100% text-based study material in your dashboard — read at your own pace, no videos required."},
        {"question": "How do I get my certificate?", "answer": "Finish all lessons and pass the short final test; your verified certificate is issued automatically."}
      ]
    });
    console.log('Updated successfully:', result);
  } catch (e) {
    console.error('Error:', e);
  }
  client.close();
}

main();