import { CHENNAI_EXPANDED_PLACES } from '../src/lib/data/chennai-places';
import { resolveDestination } from '../src/lib/planner-engine/destination-resolver';

const newlyAddedKeys = [
  'knk-road',
  'phoenix-marketcity-velachery',
  'breakthru-college-road',
  'madras-international-karting-arena',
  'sriperumbudur',
  'vgp-snow-kingdom',
  'glow-garden-mahabalipuram',
  'the-beach-terrace-ecr',
  'go-xtreme-adventures',
  'eco-park-chetpet'
];

console.log('--- VERIFYING 10 NEW CHENNAI PLACES ---');
let allValid = true;

for (const key of newlyAddedKeys) {
  const place = CHENNAI_EXPANDED_PLACES[key];
  if (!place) {
    console.error(`❌ Missing key: ${key}`);
    allValid = false;
    continue;
  }

  console.log(`✅ [${place.slug}] ${place.canonicalName}`);
  console.log(`   - District: ${place.district} | Region: ${place.geographicRegion}`);
  console.log(`   - Lat: ${place.latitude}, Lng: ${place.longitude}`);
  console.log(`   - Category: ${place.primaryCategory} (All: ${place.categories.join(', ')})`);
  console.log(`   - Operating Hours / Best Time: ${place.metadata.bestTime}`);
  console.log(`   - Duration: ${place.metadata.duration}`);
  console.log(`   - Tagline: ${place.tagline}`);
  console.log(`   - Description: ${place.description.substring(0, 100)}...`);
  console.log('---');
}

console.log('\n--- VERIFYING DESTINATION RESOLUTION ---');
const testQueries = [
  'knk road',
  'phoenix marketcity velachery',
  'breakthru college road',
  'madras international karting arena',
  'sriperumbudur',
  'vgp snowkingdom. ecr',
  'glow garden mahabalipuram',
  'the beach terrace ecr',
  'go xtreme adventures sholinganallur',
  'eco-park chetpet'
];

for (const q of testQueries) {
  const resolved = resolveDestination(q);
  if (resolved.success && resolved.destination) {
    console.log(`✅ Query: "${q}" -> Resolved to "${resolved.destination.displayName}"`);
  } else {
    console.error(`❌ Query: "${q}" -> FAILED TO RESOLVE`);
    allValid = false;
  }
}

if (allValid) {
  console.log('\n🎉 ALL 10 CHENNAI SPOTS & RESOLUTIONS VERIFIED SUCCESSFULLY!');
} else {
  console.error('\n❌ SOME VERIFICATIONS FAILED');
  process.exit(1);
}
