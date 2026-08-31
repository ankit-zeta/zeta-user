const fs = require('fs');
const path = require('path');

// Course slug to program ID mapping
const courseMap = {
  'basics-of-sales': 'kx7267y81244fk44kev0y3thps8czcra',
  'fundamentals-of-sales-psychology': 'kx7fag6a1rh52d4v3db7zfqpcs8cys8q',
  'lead-generation-essentials': 'kx7ab668c5v2kazrpk79hp1wz18czpkk',
  'business-communication-mastery': 'kx7794s24ahkvbjxd6gsw26dwn8cz900',
  'shopify-store-setup': 'kx747n4w3zk6q42f7vjz0v877h8czm8e',
  'woocommerce-store-setup': 'kx76q22hyexm9djdx1nahz1s698cz9hn',
  'running-ads-for-business': 'kx7644g3t74j6240qyf8gavrh18czp26',
  'choose-your-business-niche': 'kx7453a1d06fe3t73z437p1mch8cysrw',
  'content-marketing-basics': 'kx7b0fgsbvcq9adcq3p75dmhyd8cyrza',
  'customer-support-retention': 'kx7dw7c6n5j2bv8pxq2temsya18czz6j',
  'coding-foundations': 'kx7epemaxbr91vynfhy38yfbrh8cyfb3',
  'build-your-first-website': 'kx73qkkghg8n7ammj4f4zfvw7d8cy9we',
  'social-media-marketing-systems': 'kx7dekh67yd80ehbp2gdchs09n8czvt1',
  'meta-ads-deep-dive': 'kx72dkyx730van9m45bpqn66158cz6vn',
  'google-ads-essentials': 'kx72gzncgmc0gnqdtvjq7e88bn8cz4kr',
  'analytics-tracking-setup': 'kx74py99dbndt339bzr6vd8sx58cy4mg',
  'automation-no-code-tools': 'kx78cp2w8jakcfjtvhms98zqbs8czfgf',
  'freelancing-client-management': 'kx70e9cmr175gnqfxe04f73dyn8cy9wj',
  'complete-coding-basic-to-advanced': 'kx79jxnmtbmb6hn1k4g7nzfksd8cy4az',
  'gen-ai-prompting-mastery': 'kx75g9ns13ffp0x6c67d9zdnc18cz8qq',
  'building-with-ai-tools': 'kx742mww8bw21vyaye5h8ahrt58cy50c',
  'meta-ads-scaling-strategies': 'kx7b6jgvgd3ek5h0vw8xrrbcn98czkz3',
  'google-ads-scaling': 'kx7f4p85wz5rqjmh49fmmfbcn18cy46v',
  'launch-your-own-product': 'kx7fkmmmkvx5tm2j1tmjab6szs8czrd7',
  'growth-analytics-funnels': 'kx7dh5x0889kx16m4nv9kkc3618czeqx',
  'email-marketing-automation': 'kx7bcnbz3fyqyexk2p6f32gfw98cya0q',
  'freelance-to-agency-systems': 'kx70y2ypwbngaw4eatg116rx0x8cz497',
  'capstone-launch-real-project': 'kx7d9d4s5j1aaxkqmqfh9wtpx98cye5s',
};

// Directory name to slug mapping
const dirToSlug = {
  'analytics-tracking': 'analytics-tracking-setup',
  'automation-no-code': 'automation-no-code-tools',
  'build-first-website': 'build-your-first-website',
  'building-products-ai': 'building-with-ai-tools',
  'capstone-launch-real-project': 'capstone-launch-real-project',
  'coding-fundamentals': 'coding-foundations',
  'complete-coding': 'complete-coding-basic-to-advanced',
  'email-marketing-automation': 'email-marketing-automation',
  'freelance-to-agency': 'freelance-to-agency-systems',
  'freelancing-client-management': 'freelancing-client-management',
  'gen-ai-prompting': 'gen-ai-prompting-mastery',
  'google-ads-advanced': 'google-ads-scaling',
  'google-ads-essentials': 'google-ads-essentials',
  'google-ads-scaling': 'google-ads-scaling',
  'growth-analytics-funnels': 'growth-analytics-funnels',
  'launch-your-own-product': 'launch-your-own-product',
  'meta-ads-deep-dive': 'meta-ads-deep-dive',
  'meta-ads-scaling': 'meta-ads-scaling-strategies',
  'social-media-marketing': 'social-media-marketing-systems',
  'choose-your-business-niche': 'choose-your-business-niche',
  'content-marketing-basics': 'content-marketing-basics',
  'customer-support-retention': 'customer-support-retention',
  'running-ads-for-business': 'running-ads-for-business',
  'shopify-store-setup': 'shopify-store-setup',
  'woocommerce-store-setup': 'woocommerce-store-setup',
  'basics-of-sales': 'basics-of-sales',
  'business-communication-mastery': 'business-communication-mastery',
  'fundamentals-of-sales-psychology': 'fundamentals-of-sales-psychology',
  'lead-generation-essentials': 'lead-generation-essentials',
};

async function main() {
  const resourcesDir = path.join(__dirname, 'resources');
  const resources = [];
  
  const categories = fs.readdirSync(resourcesDir).filter(f => 
    fs.statSync(path.join(resourcesDir, f)).isDirectory()
  );
  
  for (const category of categories) {
    const categoryDir = path.join(resourcesDir, category);
    const courses = fs.readdirSync(categoryDir).filter(f => 
      fs.statSync(path.join(categoryDir, f)).isDirectory()
    );
    
    for (const course of courses) {
      const courseDir = path.join(categoryDir, course);
      const files = fs.readdirSync(courseDir).filter(f => f.endsWith('.html'));
      
      const slug = dirToSlug[course] || course;
      const programId = courseMap[slug];
      
      if (!programId) {
        console.log(`⚠️  No programId for: ${category}/${course}`);
        continue;
      }
      
      for (const file of files) {
        const filePath = path.join(courseDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1].replace(' — ZetaGrow', '') : file.replace('.html', '').replace(/-/g, ' ');
        
        const badgeMatch = content.match(/<div class="badge">(.*?)<\/div>/);
        const badge = badgeMatch ? badgeMatch[1] : 'Resource';
        
        const stats = fs.statSync(filePath);
        const fileSize = `${(stats.size / 1024).toFixed(1)} KB`;
        
        const sortMatch = file.match(/^(\d+)/);
        const sortOrder = sortMatch ? parseInt(sortMatch[1]) : 1;
        
        // Use relative URL that will work on the deployed site
        const fileUrl = `/resources/${category}/${course}/${file}`;
        
        resources.push({
          title,
          description: `Professional resource for ${slug.replace(/-/g, ' ')} course`,
          fileUrl,
          fileType: 'html',
          fileSize,
          programId,
          accessType: 'enrolled',
          sortOrder,
        });
      }
    }
  }
  
  resources.sort((a, b) => {
    if (a.programId !== b.programId) return a.programId.localeCompare(b.programId);
    return a.sortOrder - b.sortOrder;
  });
  
  console.log(`📦 Found ${resources.length} resources\n`);
  
  const output = `// Auto-generated resource upload data
// Total: ${resources.length} resources
// Run: node run-upload.js

const resources = ${JSON.stringify(resources, null, 2)};

module.exports = resources;
`;
  
  fs.writeFileSync('resource-upload-data.js', output);
  console.log('✅ Generated resource-upload-data.js');
  
  // Also generate a summary
  const byCourse = {};
  for (const r of resources) {
    const slug = Object.entries(courseMap).find(([k, v]) => v === r.programId)?.[0] || 'unknown';
    byCourse[slug] = (byCourse[slug] || 0) + 1;
  }
  
  console.log('\nResources per course:');
  for (const [course, count] of Object.entries(byCourse).sort()) {
    console.log(`  ${course}: ${count}`);
  }
}

main().catch(console.error);
