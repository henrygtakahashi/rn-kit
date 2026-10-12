// Resolves the `@/` alias and extensionless TypeScript imports for `node --test`.
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const SRC = path.resolve(import.meta.dirname, '..', 'src');
const EXTENSIONS = ['.ts', '.tsx', '/index.ts'];

function findFile(base) {
  if (existsSync(base) && path.extname(base)) return base;
  const match = EXTENSIONS.map((extension) => base + extension).find((file) => existsSync(file));
  return match ?? null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const file = findFile(path.join(SRC, specifier.slice(2)));
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const parent = path.dirname(fileURLToPath(context.parentURL));
      const file = findFile(path.resolve(parent, specifier));
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
