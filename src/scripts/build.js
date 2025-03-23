#!/usr/bin/env node

/**
 * Build script for astro-docs-mcp
 * 
 * This script:
 * 1. Runs the TypeScript compiler
 * 2. Makes the main file executable
 * 3. Adds output redirection to prevent debug messages from mixing with JSON
 * 4. Patches optional chaining for older Node.js versions if needed
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const buildDir = path.join(projectRoot, 'build');
const mainFile = path.join(buildDir, 'index.js');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

console.log(`${colors.green}Building astro-docs-mcp...${colors.reset}`);

try {
  // Run TypeScript compiler
  console.log('Running TypeScript compiler...');
  execSync('npx tsc', { stdio: 'inherit', cwd: projectRoot });
  
  // Make the main file executable
  console.log('Making main file executable...');
  fs.chmodSync(mainFile, '755');
  
  // Add shebang and console redirection to the main file
  console.log('Updating main file...');
  let content = fs.readFileSync(mainFile, 'utf8');
  let modified = false;
  
  if (!content.startsWith('#!/usr/bin/env node')) {
    console.log('Adding shebang to main file...');
    content = '#!/usr/bin/env node\n' + content;
    modified = true;
  }
  
  // Insert code at the top to redirect console.log to console.error during startup
  // This will prevent debug output from being mixed with JSON responses
  const redirectCode = `
// Redirect console.log to stderr to avoid breaking JSON communication with MCP
const originalConsoleLog = console.log;
console.log = function() {
  console.error('[DEBUG]', ...arguments);
};
`;

  if (!content.includes('// Redirect console.log to stderr')) {
    console.log('Adding debug output redirection...');
    content = content.replace('#!/usr/bin/env node', '#!/usr/bin/env node\n' + redirectCode);
    modified = true;
  }
  
  // Replace optional chaining (?.) with safer alternative for compatibility
  if (content.includes('?.')) {
    console.log('Patching optional chaining for older Node.js compatibility...');
    content = content.replace(/(\w+)\.(\w+)\?\./g, '$1.$2 && $1.$2.');
    content = content.replace(/(\w+)\?\./g, '$1 && $1.');
    modified = true;
  }
  
  // Write changes back to file if needed
  if (modified) {
    fs.writeFileSync(mainFile, content);
  }
  
  // Create a bin directory in the project root if it doesn't exist
  const binDir = path.join(projectRoot, 'bin');
  if (!fs.existsSync(binDir)) {
    console.log('Creating bin directory...');
    fs.mkdirSync(binDir);
  }
  
  // Copy the launcher scripts
  console.log('Creating launcher scripts...');
  
  // Create the main launcher script - need to escape $ in template literals
  const launcherScript = `#!/bin/bash

# Launcher script for Astro Docs MCP
# This script handles Node.js version detection and proper stderr redirection

SCRIPT_DIR="\$( cd "\$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="\$( cd "\$SCRIPT_DIR/.." && pwd )"
BUILD_FILE="\$PROJECT_DIR/build/index.js"

# Redirect ALL debug output to stderr
exec 3>&1  # Save original stdout
exec 1>&2  # Redirect stdout to stderr for all debug messages

echo "Starting Astro Docs MCP server..."

# Verify the build file exists
if [ ! -f "\$BUILD_FILE" ]; then
  echo "ERROR: Main index.js file not found at \$BUILD_FILE"
  echo "Please run 'npm run build' first"
  exit 1
fi

# Detect Node.js version
if command -v node >/dev/null 2>&1; then
  NODE_VERSION=\$(node --version)
  MAJOR_VERSION=\$(echo "\$NODE_VERSION" | cut -c2- | cut -d. -f1)
  echo "Found Node.js version: \$NODE_VERSION (major: \$MAJOR_VERSION)"
else
  echo "Node.js not found in PATH"
  MAJOR_VERSION=0
fi

# Try to use NVM if needed
if [[ \$MAJOR_VERSION -lt 16 ]]; then
  export NVM_DIR="\$HOME/.nvm"
  if [ -s "\$NVM_DIR/nvm.sh" ]; then
    source "\$NVM_DIR/nvm.sh"
    if nvm ls 16 >/dev/null 2>&1; then
      nvm use 16 >/dev/null 2>&1
      NODE_VERSION=\$(node --version)
      MAJOR_VERSION=\$(echo "\$NODE_VERSION" | cut -c2- | cut -d. -f1)
      echo "Node.js version after NVM: \$NODE_VERSION"
    fi
  fi
fi

# Restore stdout for the actual server process
exec 1>&3

# Use appropriate Node.js flags based on version
if [[ \$MAJOR_VERSION -ge 16 ]]; then
  echo "Using Node.js \$MAJOR_VERSION" >&2
  exec node --no-warnings "\$BUILD_FILE"
else
  echo "ERROR: Node.js 16+ is required" >&2
  exit 1
fi`;
  
  const launcherPath = path.join(binDir, 'astro-docs-mcp');
  fs.writeFileSync(launcherPath, launcherScript);
  
  // Make the launcher script executable
  fs.chmodSync(launcherPath, '755');
  
  console.log(`${colors.green}Build completed successfully!${colors.reset}`);
  console.log(`Run the server with: ${colors.yellow}./bin/astro-docs-mcp${colors.reset}`);
  
} catch (error) {
  console.error(`${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
} 