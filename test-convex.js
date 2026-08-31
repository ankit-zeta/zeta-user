// Quick test to check if Convex CLI auth works
const { execSync } = require('child_process');
const resources = require('./resource-upload-data.js');

// Take first 10 resources for test
const testResources = resources.slice(0, 10);

const args = JSON.stringify({ resources: testResources });

console.log(`Testing with ${testResources.length} resources...`);
console.log(`Args length: ${args.length} chars`);

// Write args to temp file
const fs = require('fs');
fs.writeFileSync('/tmp/convex-args.json', args);

try {
  const result = execSync(
    'npx convex run resources:bulkCreateResourcesInternal --typecheck disable "$(cat /tmp/convex-args.json)"',
    { 
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 60000
    }
  );
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout);
  if (error.stderr) console.log('stderr:', error.stderr);
}
