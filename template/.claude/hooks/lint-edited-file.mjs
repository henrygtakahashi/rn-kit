// PostToolUse hook: lints the file Claude just edited and reports problems
// back to Claude (exit code 2 sends stderr to the model).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

let filePath;
try {
  filePath = JSON.parse(raw)?.tool_input?.file_path;
} catch {
  process.exit(0);
}

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
if (!filePath || !/\.(ts|tsx)$/.test(filePath) || !existsSync(filePath)) process.exit(0);

const relative = path.relative(root, path.resolve(root, filePath));
if (relative.startsWith('..') || !relative.split(path.sep).includes('src')) process.exit(0);

const eslint = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!existsSync(eslint)) process.exit(0);

const result = spawnSync(process.execPath, [eslint, '--max-warnings', '0', relative], {
  cwd: root,
  encoding: 'utf8',
});

if (result.status === 0) process.exit(0);

process.stderr.write(
  `Lint failed for ${relative}. Fix these problems before continuing. ` +
    `Do not disable the rules.\n${result.stdout ?? ''}${result.stderr ?? ''}`,
);
process.exit(2);
