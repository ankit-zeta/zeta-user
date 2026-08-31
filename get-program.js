const { ConvexClient } = require('convex/browser');
const client = new ConvexClient('https://terrific-dove-836.convex.cloud');

async function main() {
  try {
    const result = await client.query('programs:getProgramBySlug', { slug: 'google-ads-scaling' });
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
  client.close();
}

main();