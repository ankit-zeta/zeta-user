// Seed realistic job data via Convex JS client
const { ConvexClient } = require('convex/browser');

const client = new ConvexClient('https://terrific-dove-836.convex.cloud');

const PROGRAM_IDS = [
  'kx7267y81244fk44kev0y3thps8czcra', 'kx7fag6a1rh52d4v3db7zfqpcs8cys8q',
  'kx7ab668c5v2kazrpk79hp1wz18czpkk', 'kx7794s24ahkvbjxd6gsw26dwn8cz900',
  'kx747n4w3zk6q42f7vjz0v877h8czm8e', 'kx76q22hyexm9djdx1nahz1s698cz9hn',
  'kx7644g3t74j6240qyf8gavrh18czp26', 'kx7453a1d06fe3t73z437p1mch8cysrw',
  'kx7b0fgsbvcq9adcq3p75dmhyd8cyrza', 'kx7dw7c6n5j2bv8pxq2temsya18czz6j',
  'kx7epemaxbr91vynfhy38yfbrh8cyfb3', 'kx73qkkghg8n7ammj4f4zfvw7d8cy9we',
  'kx7dekh67yd80ehbp2gdchs09n8czvt1', 'kx72dkyx730van9m45bpqn66158cz6vn',
  'kx72gzncgmc0gnqdtvjq7e88bn8cz4kr', 'kx74py99dbndt339bzr6vd8sx58cy4mg',
  'kx78cp2w8jakcfjtvhms98zqbs8czfgf', 'kx70e9cmr175gnqfxe04f73dyn8cy9wj',
  'kx79jxnmtbmb6hn1k4g7nzfksd8cy4az', 'kx75g9ns13ffp0x6c67d9zdnc18cz8qq',
  'kx742mww8bw21vyaye5h8ahrt58cy50c', 'kx7b6jgvgd3ek5h0vw8xrrbcn98czkz3',
  'kx7f4p85wz5rqjmh49fmmfbcn18cy46v', 'kx7fkmmmkvx5tm2j1tmjab6szs8czrd7',
  'kx7dh5x0889kx16m4nv9kkc3618czeqx', 'kx7bcnbz3fyqyexk2p6f32gfw98cya0q',
  'kx70y2ypwbngaw4eatg116rx0x8cz497', 'kx7d9d4s5j1aaxkqmqfh9wtpx98cye5s',
];

const CATEGORY_PROGRAMS = {
  'Content & Writing': [PROGRAM_IDS[3], PROGRAM_IDS[9]],
  'Media Production': [PROGRAM_IDS[20], PROGRAM_IDS[19]],
  'Web & Technical': [PROGRAM_IDS[10], PROGRAM_IDS[11], PROGRAM_IDS[18]],
  'Social & Marketing': [PROGRAM_IDS[12], PROGRAM_IDS[13], PROGRAM_IDS[14]],
  'E-Commerce': [PROGRAM_IDS[4], PROGRAM_IDS[5]],
  'Operations': [PROGRAM_IDS[17], PROGRAM_IDS[9]],
  'Design & Creative': [PROGRAM_IDS[20]],
};

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  // Fetch all jobs using the internal query
  const allJobs = await client.query('jobs:getPublicJobs', { limit: 200 });
  const jobList = allJobs.jobs;
  console.log(`Found ${jobList.length} jobs to update\n`);

  let updated = 0;
  const batch = [];

  for (const job of jobList) {
    const catProgs = CATEGORY_PROGRAMS[job.category] || PROGRAM_IDS.slice(0, 2);
    const requiresCert = Math.random() < 0.7;

    let requiredProgramId = undefined;
    let tier = 0;
    if (requiresCert) {
      requiredProgramId = pick(catProgs);
      tier = Math.min(4, Math.floor(PROGRAM_IDS.indexOf(requiredProgramId) / 7) + 1);
    }

    const tiers = [
      { min: 200, max: 800 },
      { min: 800, max: 2000 },
      { min: 1500, max: 3500 },
      { min: 3000, max: 6000 },
      { min: 5000, max: 15000 },
    ];
    const r = tiers[tier];
    const payment = rand(r.min, r.max);

    batch.push({
      jobId: job._id,
      requiredProgramId,
      payment,
      applicantCount: rand(100, 5000),
      openings: rand(1, 15),
    });

    if (batch.length === 50) {
      for (const b of batch) {
        await client.mutation('jobs:updateJobFromSeed', b);
        updated++;
      }
      console.log(`  Updated ${updated}/${jobList.length}...`);
      batch.length = 0;
    }
  }

  for (const b of batch) {
    await client.mutation('jobs:updateJobFromSeed', b);
    updated++;
  }

  console.log(`\nDone! Updated ${updated} jobs`);
  client.close();
}

main().catch(e => { console.error(e); client.close(); });
