import { readFile } from 'node:fs/promises';
import path from 'node:path';

const source = await readFile(path.join(process.cwd(), 'src/app/[locale]/[country]/hospitals/[slug]/layout.tsx'), 'utf8');

for (const token of ['notFound();', 'force-dynamic', 'revalidate = 0']) {
  if (!source.includes(token)) throw new Error(`hospital detail segment hold missing ${token}`);
}

console.log('hospital detail segment hold check passed.');
