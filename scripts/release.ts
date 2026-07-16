/**
 * Bumps the project version and promotes CHANGELOG.md's [Unreleased] section
 * to a new dated version heading, in one atomic step so package.json,
 * package-lock.json, and CHANGELOG.md never drift out of sync.
 *
 * Usage: tsx scripts/release.ts <patch|minor|major>
 * (via `npm run release:patch` / `release:minor` / `release:major`)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

const bumpType = process.argv[2];
if (bumpType !== 'patch' && bumpType !== 'minor' && bumpType !== 'major') {
  console.error('Usage: tsx scripts/release.ts <patch|minor|major>');
  process.exit(1);
}

const changelog = readFileSync(CHANGELOG_PATH, 'utf-8');
const unreleasedMatch = changelog.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/);
if (!unreleasedMatch?.[1]?.trim()) {
  console.error("Nothing to release: CHANGELOG.md's [Unreleased] section is empty.");
  process.exit(1);
}

// bumpType is validated above to be one of a fixed set of literals, so it is
// safe to interpolate directly into the shell command string.
const npmVersionOutput = execSync(`npm version ${bumpType} --no-git-tag-version`, {
  cwd: ROOT,
  encoding: 'utf-8'
}).trim();
const newVersion = npmVersionOutput.replace(/^v/, '');
const today = new Date().toISOString().slice(0, 10);

const updatedChangelog = changelog.replace(
  '## [Unreleased]\n',
  `## [Unreleased]\n\n## [${newVersion}] - ${today}\n`
);
writeFileSync(CHANGELOG_PATH, updatedChangelog);

console.log(
  `Released ${newVersion}: CHANGELOG.md's [Unreleased] entries are now under [${newVersion}] - ${today}.`
);
console.log('package.json and package-lock.json versions updated. Review the diff, then commit.');
