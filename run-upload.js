// Upload resources to Convex
// Run: node run-upload.js
// 
// Prerequisites:
// 1. Get your admin token from browser DevTools:
//    - Login to http://localhost:3001 (admin panel)
//    - Open DevTools → Application → Local Storage
//    - Find 'zetagrow_admin_token' value
//
// 2. Set environment variables:
//    $env:ADMIN_TOKEN="your-token-here"
//    $env:CONVEX_URL="https://terrific-dove-836.convex.cloud"

const { ConvexClient } = require('convex/browser');
const resources = require('./resource-upload-data.js');

async function uploadResources() {
  const convexUrl = process.env.CONVEX_URL || 'https://terrific-dove-836.convex.cloud';
  const token = process.env.ADMIN_TOKEN;
  
  if (!token) {
    console.error('❌ Error: ADMIN_TOKEN not set');
    console.log('\nTo get your admin token:');
    console.log('1. Login to http://localhost:3001 (admin panel)');
    console.log('2. Open DevTools → Application → Local Storage');
    console.log('3. Find "zetagrow_admin_token" value');
    console.log('\nThen run:');
    console.log('  $env:ADMIN_TOKEN="your-token-here"; node run-upload.js');
    process.exit(1);
  }
  
  const client = new ConvexClient(convexUrl);
  
  console.log(`📦 Uploading ${resources.length} resources to Convex...`);
  console.log(`   Deployment: ${convexUrl}`);
  
  // Upload in batches of 50 to avoid timeouts
  const batchSize = 50;
  let uploaded = 0;
  let errors = 0;
  
  for (let i = 0; i < resources.length; i += batchSize) {
    const batch = resources.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(resources.length / batchSize);
    
    try {
      const result = await client.mutation('resources:bulkCreateResources', {
        token,
        resources: batch,
      });
      
      uploaded += result.count;
      console.log(`   ✅ Batch ${batchNum}/${totalBatches}: ${result.count} resources uploaded`);
    } catch (error) {
      errors += batch.length;
      console.error(`   ❌ Batch ${batchNum}/${totalBatches} failed:`, error.message);
    }
    
    // Small delay between batches
    if (i + batchSize < resources.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Total: ${resources.length}`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Errors: ${errors}`);
  
  if (uploaded > 0) {
    console.log('\n✅ Resources uploaded successfully!');
    console.log('   Users can now see resources based on their enrolled plans.');
  }
  
  client.close();
}

uploadResources().catch(console.error);
