/**
 * Generates PROJECT_TREE.md: a directory tree plus a per-file map of every
 * exported function, class, interface, type, and top-level const under
 * src/, tests/, and scripts/. Run via `npm run docs:tree` (write mode) or
 * `npm run docs:tree:check` (--check, used in `npm run verify`).
 *
 * Parsing uses ts-morph (its own bundled compiler API) rather than the
 * project's `typescript` devDependency. Signatures are derived purely
 * syntactically — no full type-checking is performed.
 *
 * Adapted from the TabaqatPerfect project's generate-project-tree.ts.
 */
import { Project, Node, Scope, SourceFile, ts } from 'ts-morph';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const OUTPUT_PATH = path.join(ROOT, 'PROJECT_TREE.md');
const CHECK_MODE = process.argv.includes('--check');

const TREE_ROOTS = ['src', 'tests', 'scripts', 'docs', 'public'];
const PARSE_ROOTS = new Set(['src', 'tests', 'scripts']);
const PARSE_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.cjs', '.js']);
const EXCLUDE_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  'icons' // static assets, no exports
]);

interface FileNode {
  type: 'file';
  name: string;
  relPath: string;
}
interface DirNode {
  type: 'dir';
  name: string;
  relPath: string;
  children: (FileNode | DirNode)[];
}

function walk(dir: string, base: string): DirNode {
  const entries = readdirSync(dir, { withFileTypes: true })
    .filter((e) => !EXCLUDE_DIR_NAMES.has(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const children: (FileNode | DirNode)[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).split(path.sep).join('/');
    if (entry.isDirectory()) {
      children.push(walk(full, base));
    } else {
      children.push({ type: 'file', name: entry.name, relPath: rel });
    }
  }
  return {
    type: 'dir',
    name: path.basename(dir),
    relPath: path.relative(base, dir).split(path.sep).join('/'),
    children
  };
}

function renderTree(node: DirNode, prefix = ''): string[] {
  const lines: string[] = [];
  const sorted = [...node.children].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  sorted.forEach((child, idx) => {
    const isLast = idx === sorted.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    lines.push(`${prefix}${connector}${child.name}${child.type === 'dir' ? '/' : ''}`);
    if (child.type === 'dir') {
      lines.push(...renderTree(child, prefix + (isLast ? '    ' : '│   ')));
    }
  });
  return lines;
}

function collectFiles(node: DirNode, exts: Set<string>, out: string[]): void {
  const sorted = [...node.children].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const child of sorted) {
    if (child.type === 'dir') {
      collectFiles(child, exts, out);
    } else if (exts.has(path.extname(child.name))) {
      out.push(child.relPath);
    }
  }
}

interface ExportedItem {
  text: string;
  description?: string | undefined;
  children?: ExportedItem[] | undefined;
}

function firstSentence(text: string): string {
  const cleaned = text.trim();
  const match = cleaned.match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : cleaned).trim();
}

function getJsDocDescription(node: Node): string | undefined {
  if (!Node.isJSDocable(node)) return undefined;
  const docs = node.getJsDocs();
  if (docs.length === 0) return undefined;
  const text = (docs[0]?.getDescription() ?? '').trim().replace(/\s+/g, ' ');
  return text ? firstSentence(text) : undefined;
}

function jsDocForDeclaration(node: Node): string | undefined {
  if (Node.isVariableDeclaration(node)) {
    const stmt = node.getVariableStatement();
    return stmt ? getJsDocDescription(stmt) : undefined;
  }
  return getJsDocDescription(node);
}

function paramText(p: {
  getName(): string;
  hasQuestionToken(): boolean;
  hasInitializer(): boolean;
  getTypeNode(): Node | undefined;
}): string {
  const optional = p.hasQuestionToken() || p.hasInitializer() ? '?' : '';
  const typeNode = p.getTypeNode();
  const type = typeNode ? `: ${typeNode.getText().replace(/\s+/g, ' ')}` : '';
  return `${p.getName()}${optional}${type}`;
}

function signatureOf(node: {
  getTypeParameters(): { getText(): string }[];
  getParameters(): Parameters<typeof paramText>[0][];
  getReturnTypeNode(): Node | undefined;
}): string {
  const typeParams = node.getTypeParameters();
  const tp = typeParams.length ? `<${typeParams.map((t) => t.getText()).join(', ')}>` : '';
  const params = node.getParameters().map(paramText).join(', ');
  const retNode = node.getReturnTypeNode();
  const ret = retNode ? `: ${retNode.getText().replace(/\s+/g, ' ')}` : '';
  return `${tp}(${params})${ret}`;
}

function isPrivateMethod(method: { getScope(): Scope; getName(): string }): boolean {
  return method.getScope() !== Scope.Public || method.getName().startsWith('#');
}

function classItem(name: string, decl: Node): ExportedItem {
  if (!Node.isClassDeclaration(decl)) return { text: `class ${name}` };
  const typeParams = decl.getTypeParameters();
  const tp = typeParams.length ? `<${typeParams.map((t) => t.getText()).join(', ')}>` : '';
  const children: ExportedItem[] = [];
  for (const ctor of decl.getConstructors()) {
    children.push({ text: `constructor${signatureOf(ctor)}` });
  }
  for (const method of decl.getMethods()) {
    if (isPrivateMethod(method)) continue;
    children.push({
      text: `${method.getName()}${signatureOf(method)}`,
      description: getJsDocDescription(method)
    });
  }
  return { text: `class ${name}${tp}`, description: jsDocForDeclaration(decl), children };
}

function describeDeclaration(name: string, decl: Node): ExportedItem {
  if (
    Node.isFunctionDeclaration(decl) ||
    Node.isArrowFunction(decl) ||
    Node.isFunctionExpression(decl)
  ) {
    const displayName = Node.isFunctionDeclaration(decl) ? (decl.getName() ?? name) : name;
    return {
      text: `function ${displayName}${signatureOf(decl)}`,
      description: jsDocForDeclaration(decl)
    };
  }
  if (Node.isClassDeclaration(decl)) return classItem(decl.getName() ?? name, decl);
  if (Node.isVariableDeclaration(decl)) {
    const init = decl.getInitializer();
    const typeNode = decl.getTypeNode();
    if (!typeNode && init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
      return { text: `const ${name}${signatureOf(init)}`, description: jsDocForDeclaration(decl) };
    }
    return {
      text: typeNode
        ? `const ${name}: ${typeNode.getText().replace(/\s+/g, ' ')}`
        : `const ${name}`,
      description: jsDocForDeclaration(decl)
    };
  }
  if (Node.isInterfaceDeclaration(decl)) {
    return { text: `interface ${name}`, description: jsDocForDeclaration(decl) };
  }
  if (Node.isTypeAliasDeclaration(decl)) {
    return { text: `type ${name}`, description: jsDocForDeclaration(decl) };
  }
  if (Node.isEnumDeclaration(decl)) {
    return { text: `enum ${name}`, description: jsDocForDeclaration(decl) };
  }
  return { text: name };
}

function collectExports(sourceFile: SourceFile): ExportedItem[] {
  const entries: { name: string; item: ExportedItem }[] = [];
  for (const [name, decls] of sourceFile.getExportedDeclarations()) {
    const decl = decls[0];
    if (!decl) continue;
    entries.push({ name, item: describeDeclaration(name, decl) });
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  return entries.map((e) => e.item);
}

interface ParsedFile {
  summary?: string | undefined;
  items: ExportedItem[];
  parseError?: boolean;
}

function parseFile(project: Project, absPath: string): ParsedFile {
  try {
    const sourceFile = project.addSourceFileAtPath(absPath);
    const [firstStatement] = sourceFile.getStatements();
    const summary = firstStatement ? getJsDocDescription(firstStatement) : undefined;
    return { summary, items: collectExports(sourceFile) };
  } catch (err) {
    process.stderr.write(`Warning: failed to parse ${absPath}: ${String(err)}\n`);
    return { items: [], parseError: true };
  }
}

function renderItem(item: ExportedItem, indent: string): string[] {
  const desc = item.description ? ` — ${item.description}` : '';
  const lines = [`${indent}- \`${item.text}\`${desc}`];
  for (const child of item.children ?? []) {
    lines.push(...renderItem(child, indent + '  '));
  }
  return lines;
}

export function generate(rootDir: string): string {
  const lines: string[] = [];
  lines.push('<!--');
  lines.push('  AUTO-GENERATED — DO NOT EDIT BY HAND.');
  lines.push('  Generated by `npm run docs:tree`. Verified up to date by');
  lines.push('  `npm run docs:tree:check`, which is part of `npm run verify`.');
  lines.push('  If this file is out of date, run `npm run docs:tree` and commit the');
  lines.push('  result — do not edit this file directly, your changes will be');
  lines.push('  overwritten the next time it regenerates.');
  lines.push('-->');
  lines.push('');
  lines.push('# Project Tree');
  lines.push('');

  const roots: DirNode[] = [];
  lines.push('## Directory tree');
  lines.push('');
  lines.push('```');
  for (const rootName of TREE_ROOTS) {
    const abs = path.join(rootDir, rootName);
    if (!existsSync(abs)) continue;
    const node = walk(abs, rootDir);
    roots.push(node);
    lines.push(`${rootName}/`);
    lines.push(...renderTree(node));
  }
  lines.push('```');
  lines.push('');

  lines.push('## Per-file function map');
  lines.push('');

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      target: ts.ScriptTarget.Latest,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.Bundler
    }
  });

  for (const node of roots) {
    if (!PARSE_ROOTS.has(node.name)) continue;
    const files: string[] = [];
    collectFiles(node, PARSE_EXTENSIONS, files);
    for (const relPath of files) {
      // Skip the legacy engine — it's a .mjs file with no TypeScript exports to map.
      if (relPath.includes('legacyEngine.mjs')) {
        lines.push(`### \`${relPath}\``);
        lines.push(
          '(Legacy character-level Brill engine — not parsed; treat rules as load-bearing.)'
        );
        lines.push('');
        continue;
      }
      const absPath = path.join(rootDir, relPath);
      const parsed = parseFile(project, absPath);
      lines.push(`### \`${relPath}\``);
      if (parsed.parseError) {
        lines.push('(could not be parsed)');
        lines.push('');
        continue;
      }
      if (parsed.summary) lines.push(parsed.summary);
      lines.push('');
      if (parsed.items.length === 0) {
        lines.push('(no exports)');
      } else {
        for (const item of parsed.items) {
          lines.push(...renderItem(item, ''));
        }
      }
      lines.push('');
    }
  }

  return (
    lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  );
}

export async function generateFormatted(rootDir: string): Promise<string> {
  const raw = generate(rootDir);
  const config = await prettier.resolveConfig(path.join(rootDir, 'PROJECT_TREE.md'));
  return prettier.format(raw, { ...config, parser: 'markdown' });
}

export async function isCurrent(rootDir: string, outputPath: string): Promise<boolean> {
  const content = await generateFormatted(rootDir);
  const existing = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '';
  return existing === content;
}

async function main(): Promise<void> {
  if (CHECK_MODE) {
    if (!(await isCurrent(ROOT, OUTPUT_PATH))) {
      process.stderr.write(
        "PROJECT_TREE.md is out of date — run 'npm run docs:tree' and commit the result.\n"
      );
      process.exit(1);
    }
    process.stdout.write('PROJECT_TREE.md is up to date.\n');
    return;
  }
  writeFileSync(OUTPUT_PATH, await generateFormatted(ROOT), 'utf8');
  process.stdout.write(`Wrote ${path.relative(ROOT, OUTPUT_PATH)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  main();
}
