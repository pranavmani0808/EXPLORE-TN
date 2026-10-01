const fs = require('fs');
const path = require('path');

// Load canonical places by reading the TS files or evaluating export
const canonicalPath = path.join(__dirname, '../src/lib/data/canonical-places.ts');
const content = fs.readFileSync(canonicalPath, 'utf8');

// Parse all image URLs in canonical-places.ts, chennai-places.ts, coimbatore-places.ts, hill-places.ts, trekking-places.ts
const files = [
  'src/lib/data/canonical-places.ts',
  'src/lib/data/chennai-places.ts',
  'src/lib/data/coimbatore-places.ts',
  'src/lib/data/hill-places.ts',
  'src/lib/data/trekking-places.ts'
];

const allPlaces = [];

for (const f of files) {
  const fileContent = fs.readFileSync(f, 'utf8');
  const slugRegex = /slug:\s*"([^"]+)"/g;
  const nameRegex = /name:\s*"([^"]+)"/g;
  const imageRegex = /image:\s*"([^"]+)"/g;

  let slugMatch, nameMatch, imageMatch;
  const slugs = [], names = [], images = [];

  while ((slugMatch = slugRegex.exec(fileContent)) !== null) slugs.push(slugMatch[1]);
  while ((nameMatch = nameRegex.exec(fileContent)) !== null) names.push(nameMatch[1]);
  while ((imageMatch = imageRegex.exec(fileContent)) !== null) images.push(imageMatch[1]);

  console.log(`File: ${f} -> Slugs: ${slugs.length}, Images: ${images.length}`);
}
