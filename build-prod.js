#!/usr/bin/env node

/**
 * Production Build Script
 *
 * This script performs a complete production build with the following steps:
 * 1. Clean previous build artifacts
 * 2. Run ESLint to check code quality
 * 3. Run TypeScript type checking
 * 4. Build the production bundle with Vite
 * 5. Display build statistics
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}[${step}]${colors.reset} ${message}`, colors.cyan);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function runCommand(command, description) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    logError(`${description} failed`);
    return false;
  }
}

function cleanDist() {
  logStep('1/4', 'Cleaning previous build artifacts...');

  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
    logSuccess('Removed dist directory');
  } else {
    log('No previous build found');
  }
}

function lint() {
  logStep('2/4', 'Running ESLint...');

  if (!runCommand('npm run lint', 'Linting')) {
    logError('Linting failed. Please fix the errors before building.');
    process.exit(1);
  }

  logSuccess('Code quality checks passed');
}

function typeCheck() {
  logStep('3/4', 'Running TypeScript type checking...');

  if (!runCommand('npm run type-check', 'Type checking')) {
    logWarning('Type checking completed with errors');
    // Don't exit - let the build continue as tsc -b in build will catch these
  } else {
    logSuccess('Type checking passed');
  }
}

function build() {
  logStep('4/4', 'Building production bundle...');

  if (!runCommand('npm run build', 'Build')) {
    logError('Build failed');
    process.exit(1);
  }

  logSuccess('Production build completed');
}

function getDirectorySize(dirPath) {
  let totalSize = 0;

  function calculateSize(path) {
    const stats = statSync(path);

    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = readdirSync(path);
      files.forEach(file => calculateSize(join(path, file)));
    }
  }

  calculateSize(dirPath);
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function displayStats() {
  log('\n' + '='.repeat(50), colors.bright);
  log('Build Statistics', colors.bright);
  log('='.repeat(50), colors.bright);

  if (existsSync('dist')) {
    const distSize = getDirectorySize('dist');
    log(`\nTotal bundle size: ${colors.green}${formatBytes(distSize)}${colors.reset}`);

    // List main files
    const distFiles = readdirSync('dist');
    const assetDir = distFiles.find(f => f === 'assets');

    if (assetDir && existsSync(join('dist', 'assets'))) {
      log('\nMain assets:', colors.cyan);
      const assets = readdirSync(join('dist', 'assets'));

      assets.forEach(file => {
        const filePath = join('dist', 'assets', file);
        const stats = statSync(filePath);
        const size = formatBytes(stats.size);

        if (file.endsWith('.js')) {
          log(`  📦 ${file}: ${size}`, colors.blue);
        } else if (file.endsWith('.css')) {
          log(`  🎨 ${file}: ${size}`, colors.yellow);
        }
      });
    }

    log('\n' + '='.repeat(50), colors.bright);
    logSuccess('Build ready for deployment!');
    log('\nTo preview the production build, run:', colors.cyan);
    log('  npm run preview\n', colors.bright);
  }
}

// Main execution
async function main() {
  const startTime = Date.now();

  log('\n' + '='.repeat(50), colors.bright);
  log('🚀 Production Build Script', colors.bright);
  log('='.repeat(50) + '\n', colors.bright);

  try {
    cleanDist();
    lint();
    typeCheck();
    build();
    displayStats();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n⏱️  Total build time: ${colors.green}${duration}s${colors.reset}\n`);

  } catch (error) {
    logError(`\nBuild process failed: ${error.message}`);
    process.exit(1);
  }
}

main();
