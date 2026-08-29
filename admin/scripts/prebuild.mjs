import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootConvex = path.resolve(__dirname, '../../convex');
const adminConvex = path.resolve(__dirname, '../convex');

console.log('📦 Prebuild: Copying Convex types...');

if (fs.existsSync(rootConvex)) {
  // Ensure admin/convex directory exists
  if (!fs.existsSync(adminConvex)) {
    fs.mkdirSync(adminConvex, { recursive: true });
  }

  // Copy _generated directory
  const rootGenerated = path.join(rootConvex, '_generated');
  const adminGenerated = path.join(adminConvex, '_generated');

  if (fs.existsSync(rootGenerated)) {
    if (fs.existsSync(adminGenerated)) {
      fs.rmSync(adminGenerated, { recursive: true });
    }
    fs.cpSync(rootGenerated, adminGenerated, { recursive: true });
    console.log('✅ Convex types copied successfully');
  } else {
    console.warn('⚠️ Root convex/_generated not found');
  }
} else {
  console.warn('⚠️ Root convex directory not found');
}

// Also copy schema.ts for type references
const rootSchema = path.join(rootConvex, 'schema.ts');
const adminSchema = path.join(adminConvex, 'schema.ts');
if (fs.existsSync(rootSchema)) {
  fs.copyFileSync(rootSchema, adminSchema);
  console.log('✅ Schema copied');
}

console.log('📦 Prebuild complete');