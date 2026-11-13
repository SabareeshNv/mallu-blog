// Pagefind writes its ready-made search interfaces next to the index. This site has its own search dialog and only
// uses pagefind.js with the index, so the interface files are removed from the build output.
import { readdirSync, rmSync } from 'node:fs';

const dir = new URL('../dist/pagefind/', import.meta.url);
const unused = /^pagefind-(component-ui|modular-ui|ui|highlight)\./;

for (const name of readdirSync(dir)) {
  if (unused.test(name)) rmSync(new URL(name, dir));
}
