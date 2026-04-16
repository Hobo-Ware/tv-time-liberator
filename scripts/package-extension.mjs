import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extensionDir = path.join(rootDir, 'src', 'extension');
const extensionPkgPath = path.join(extensionDir, 'package.json');
const distDir = path.join(extensionDir, 'dist');

const SEMVER_REGEX = /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function normalizeVersion(rawVersion) {
  const candidate = rawVersion.trim();

  if (!SEMVER_REGEX.test(candidate)) {
    throw new Error(`Invalid version \"${rawVersion}\". Expected semver like 1.2.3 or v1.2.3.`);
  }

  return candidate.replace(/^v/, '');
}

async function resolveVersionFromInput() {
  const argVersion = process.argv[2];
  if (argVersion) {
    return normalizeVersion(argVersion);
  }

  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question('Extension version (e.g. 1.2.3): ');
    return normalizeVersion(answer);
  } finally {
    rl.close();
  }
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function updateExtensionVersion(version) {
  const pkg = JSON.parse(readFileSync(extensionPkgPath, 'utf8'));
  pkg.version = version;
  writeFileSync(extensionPkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

async function main() {
  const version = await resolveVersionFromInput();
  const zipName = `tv-time-liberator-${version}.zip`;
  const zipPath = path.join(rootDir, zipName);

  updateExtensionVersion(version);
  console.log(`Updated src/extension/package.json to version ${version}`);

  run('bun', ['run', 'extension:build'], rootDir);

  if (existsSync(zipPath)) {
    rmSync(zipPath);
  }

  run('zip', ['-r', zipPath, '.'], distDir);

  console.log(`Created ${zipName}`);
  console.log(`Path: ${zipPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
