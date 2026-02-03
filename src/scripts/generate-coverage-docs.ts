import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const COVERAGE_FILE = path.resolve(__dirname, '../../coverage/coverage-summary.json');
const ROOT_DIR = path.resolve(__dirname, '../../');
const OUTPUT_COVERA = path.resolve(ROOT_DIR, 'COVERA.md');
const OUTPUT_CRITICAL = path.resolve(ROOT_DIR, 'critical_coverage.md');

// Codegen & irrelevant exclusion patterns
const EXCLUDES = [
  'src/types/generated',
  'src/components',
  '.g.ts',
  'vitest.config.ts',
  'vitest.coverage.config.ts',
  'src/scripts',
  'src/admin',
  '__tests__',
  '.test.ts',
  '.spec.ts',
  '.d.ts',
  'node_modules',
];

function isExcluded(filePath) {
  return EXCLUDES.some((pattern) => filePath.includes(pattern));
}

function generateDocs() {
  let coverage = {};
  if (fs.existsSync(COVERAGE_FILE)) {
    const data = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'));
    if (data.total) delete data.total;
    coverage = data;
  } else {
    console.warn('⚠️ Coverage file not found. Assuming 0 coverage for all tested files.');
  }

  // 1. Find all source files manually
  const allFiles = globSync('src/**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
  });

  const fileStats = [];

  allFiles.forEach((relPath) => {
    if (isExcluded(relPath)) return;

    const absPath = path.resolve(ROOT_DIR, relPath);
    const cov = coverage[absPath];

    if (cov) {
      fileStats.push({
        path: relPath,
        statements: cov.statements.pct,
        branches: cov.branches.pct,
        functions: cov.functions.pct,
        lines: cov.lines.pct,
        status: 'covered',
      });
    } else {
      fileStats.push({
        path: relPath,
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        status: 'missing',
      });
    }
  });

  // Sort by statement coverage (ascending)
  fileStats.sort((a, b) => a.statements - b.statements);

  const totalFiles = fileStats.length;
  const coveredFiles = fileStats.filter((f) => f.statements > 0).length;
  const globalCoverage = fileStats.reduce((acc, f) => acc + f.statements, 0) / totalFiles;

  // 1. Generate COVERA.md
  let coveraContent = `# Code Coverage Report\n\n`;
  coveraContent += `**Global Statement Coverage**: ${globalCoverage.toFixed(2)}%\n`;
  coveraContent += `**Files Covered**: ${coveredFiles}/${totalFiles}\n\n`;
  coveraContent += `| File | Statements | Branches | Functions | Lines |\n`;
  coveraContent += `|------|------------|----------|-----------|-------|\n`;

  fileStats.forEach((file) => {
    coveraContent += `| \`${file.path}\` | ${file.statements}% | ${file.branches}% | ${file.functions}% | ${file.lines}% |\n`;
  });

  fs.writeFileSync(OUTPUT_COVERA, coveraContent);
  console.log('✅ Generated COVERA.md');

  // 2. Generate critical_coverage.md
  let criticalContent = `# Critical Coverage Todo List

This document lists files with low coverage (< 80%) that require attention. 
Testing these files is critical to ensure system stability and prevent regressions.

**Strategy**: Focus on Core Engine and Service files first.

## Priority Checklist

`;

  const criticalFiles = fileStats.filter((f) => f.statements < 80);

  // Group by directory
  const grouped = {};
  criticalFiles.forEach((f) => {
    const dir = path.dirname(f.path);
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(f);
  });

  Object.keys(grouped)
    .sort()
    .forEach((dir) => {
      criticalContent += `### 📂 ${dir}\n`;
      grouped[dir].forEach((f) => {
        criticalContent += `- [ ] **${f.statements}%** - \`${path.basename(f.path)}\` <!-- ${f.path} -->\n`;
      });
      criticalContent += `\n`;
    });

  fs.writeFileSync(OUTPUT_CRITICAL, criticalContent);
  console.log('✅ Generated critical_coverage.md');
}

generateDocs();
