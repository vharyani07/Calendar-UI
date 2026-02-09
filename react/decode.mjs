import fs from 'node:fs';
import path from 'node:path';

const jsonPath = path.resolve(process.cwd(), 'react_files.json');
if (!fs.existsSync(jsonPath)) {
  console.error('Missing react_files.json in repo root');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
if (!data || !Array.isArray(data.files)) {
  console.error('Invalid JSON: expected top-level files array');
  process.exit(1);
}

for (const f of data.files) {
  if (!f.path || !f.content_base64) continue;
  const outPath = path.resolve(process.cwd(), f.path);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const buf = Buffer.from(f.content_base64, 'base64');
  fs.writeFileSync(outPath, buf);
}

console.log('Wrote', data.files.length, 'files');
