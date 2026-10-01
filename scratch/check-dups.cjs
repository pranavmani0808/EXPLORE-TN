const fs = require('fs');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const idRegex = /id:\s*"([^"]+)"/g;
  const slugRegex = /slug:\s*"([^"]+)"/g;
  const nameRegex = /name:\s*"([^"]+)"/g;
  const canonicalNameRegex = /canonicalName:\s*"([^"]+)"/g;

  const ids = [];
  const slugs = [];
  const names = [];
  const canonicalNames = [];

  let match;
  while ((match = idRegex.exec(content)) !== null) ids.push(match[1]);
  while ((match = slugRegex.exec(content)) !== null) slugs.push(match[1]);
  while ((match = nameRegex.exec(content)) !== null) names.push(match[1]);
  while ((match = canonicalNameRegex.exec(content)) !== null) canonicalNames.push(match[1]);

  return { ids, slugs, names, canonicalNames };
}

const files = [
  'src/lib/data/canonical-places.ts',
  'src/lib/data/chennai-places.ts',
  'src/lib/data/coimbatore-places.ts',
  'src/lib/data/hill-places.ts',
  'src/lib/data/trekking-places.ts'
];

const allIds = [];
const allSlugs = [];
const allNames = [];
const allCanonicalNames = [];

for (const f of files) {
  const res = checkFile(f);
  allIds.push(...res.ids);
  allSlugs.push(...res.slugs);
  allNames.push(...res.names);
  allCanonicalNames.push(...res.canonicalNames);
}

function getDuplicates(arr) {
  const counts = {};
  const dups = [];
  for (const x of arr) {
    counts[x] = (counts[x] || 0) + 1;
    if (counts[x] === 2) dups.push(x);
  }
  return dups;
}

console.log('--- DUPLICATE AUDIT REPORT ---');
console.log('Total IDs found:', allIds.length);
console.log('Duplicate IDs:', getDuplicates(allIds));

console.log('Total Slugs found:', allSlugs.length);
console.log('Duplicate Slugs:', getDuplicates(allSlugs));

console.log('Total Names found:', allNames.length);
console.log('Duplicate Names:', getDuplicates(allNames));

console.log('Total Canonical Names found:', allCanonicalNames.length);
console.log('Duplicate Canonical Names:', getDuplicates(allCanonicalNames));

// Check SQL seed file for duplicate slugs
const sqlContent = fs.readFileSync('supabase/seed_tn_places.sql', 'utf8');
const sqlSlugRegex = /'\s*([a-z0-9-]+)\s*'\s*,\s*'/g;
const sqlSlugs = [];
let sqlMatch;
while ((sqlMatch = sqlSlugRegex.exec(sqlContent)) !== null) {
  if (sqlMatch[1] && !sqlMatch[1].includes('http') && sqlMatch[1].length > 2) {
    sqlSlugs.push(sqlMatch[1]);
  }
}
console.log('SQL Slugs found:', sqlSlugs.length);
console.log('SQL Duplicate Slugs:', getDuplicates(sqlSlugs));
