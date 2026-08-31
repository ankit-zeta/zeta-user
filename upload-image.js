const { ConvexHttpClient } = require('convex/browser');
const fs = require('fs');
const path = require('path');

const client = new ConvexHttpClient('https://terrific-dove-836.convex.cloud');

async function main() {
  try {
    // Read the image file
    const filePath = path.join(__dirname, 'website', 'public', 'covers', 'google-ads-advanced-scaling.png');
    const fileBuffer = fs.readFileSync(filePath);
    console.log('File size:', fileBuffer.length, 'bytes');
    
    // Generate upload URL using the resources action
    const uploadUrl = await client.action('resources:generateUploadUrl', {});
    console.log('Upload URL:', uploadUrl);
    
    // Upload to the URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: fileBuffer,
      headers: {
        'Content-Type': 'image/png',
      },
    });
    
    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${text}`);
    }
    
    const result = await uploadResponse.json();
    console.log('Upload result:', result);
    
    // The storage ID should be in the response
    const storageId = result.storageId || result._id;
    console.log('Storage ID:', storageId);
    
    // Update the program with the new thumbnail and bannerImage using internal mutation
    if (storageId) {
      await client.mutation('programs:updateProgramImageInternal', {
        programId: 'kx7f4p85wz5rqjmh49fmmfbcn18cy46v',
        thumbnail: storageId,
        bannerImage: storageId,
      });
      console.log('Program updated with new image!');
    }
    
  } catch (e) {
    console.error('Error:', e);
  }
}

main();