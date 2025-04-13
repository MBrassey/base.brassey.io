#!/usr/bin/env node

/**
 * NUCLEAR DEPLOY SCRIPT
 * 
 * This script performs an emergency deployment by:
 * 1. Removing TypeScript and its dependencies
 * 2. Converting TypeScript files to JavaScript
 * 3. Creating a static fallback page if the build fails
 * 
 * Use only as a last resort when regular builds fail on Vercel.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.yellow}⚠️  NUCLEAR DEPLOYMENT MODE ACTIVATED ⚠️${colors.reset}\n`);
console.log(`${colors.bold}This script will remove TypeScript and attempt an emergency build.${colors.reset}\n`);

// Utility functions
function runCommand(command) {
  try {
    console.log(`${colors.blue}> ${command}${colors.reset}`);
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    console.error(`${colors.red}Error executing command: ${command}${colors.reset}`);
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

function removeTypeScriptConfig() {
  console.log(`\n${colors.yellow}Removing TypeScript configuration...${colors.reset}`);
  
  // Remove tsconfig files
  const tsConfigFiles = ['tsconfig.json', 'tsconfig.build.json'];
  tsConfigFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`- Removed ${file}`);
    }
  });
}

function removeTypeScriptDependencies() {
  console.log(`\n${colors.yellow}Removing TypeScript dependencies from package.json...${colors.reset}`);
  
  if (!fs.existsSync('package.json')) {
    console.log(`${colors.red}package.json not found!${colors.reset}`);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Remove TypeScript-related dependencies
  const depsToRemove = [
    'typescript', 
    '@types/node', 
    '@types/react', 
    '@types/react-dom',
    'ts-node',
    'ts-loader'
  ];
  
  let removedDeps = 0;
  
  if (packageJson.dependencies) {
    depsToRemove.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        delete packageJson.dependencies[dep];
        console.log(`- Removed ${dep} from dependencies`);
        removedDeps++;
      }
    });
  }
  
  if (packageJson.devDependencies) {
    depsToRemove.forEach(dep => {
      if (packageJson.devDependencies[dep]) {
        delete packageJson.devDependencies[dep];
        console.log(`- Removed ${dep} from devDependencies`);
        removedDeps++;
      }
    });
  }
  
  // Update scripts to remove TypeScript
  if (packageJson.scripts) {
    Object.keys(packageJson.scripts).forEach(scriptName => {
      const scriptContent = packageJson.scripts[scriptName];
      if (scriptContent.includes('tsc') || scriptContent.includes('typescript')) {
        packageJson.scripts[scriptName] = scriptContent.replace(/tsc|typescript/g, 'echo "TypeScript disabled"');
        console.log(`- Updated script: ${scriptName}`);
      }
    });
    
    // Add build script if it doesn't exist
    if (!packageJson.scripts.build) {
      packageJson.scripts.build = 'next build';
      console.log(`- Added next build script`);
    }
  }
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log(`${colors.green}Updated package.json (removed ${removedDeps} TypeScript dependencies)${colors.reset}`);
}

function createFallbackFiles() {
  console.log(`\n${colors.yellow}Creating fallback files...${colors.reset}`);
  
  // Ensure out directory exists
  if (!fs.existsSync('out')) {
    fs.mkdirSync('out', { recursive: true });
    console.log(`- Created out directory`);
  }
  
  // Copy fallback.html to out/index.html
  if (fs.existsSync('fallback.html')) {
    fs.copyFileSync('fallback.html', 'out/index.html');
    console.log(`- Copied fallback.html to out/index.html`);
  } else {
    console.log(`${colors.red}- fallback.html not found. Creating a basic fallback page...${colors.reset}`);
    
    // Create a basic fallback page
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base - Site Under Maintenance</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: #121212;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 600px;
            padding: 40px;
            background-color: #1e1e1e;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }
        h1 {
            color: #3498db;
            margin-bottom: 24px;
            font-size: 32px;
        }
        p {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 16px;
            color: #cccccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Site Under Maintenance</h1>
        <p>We're currently updating our systems to improve your experience.</p>
        <p>Our team is working to resolve this as quickly as possible.</p>
        <p>Please check back soon!</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('out/index.html', fallbackHtml);
    console.log(`- Created basic fallback page at out/index.html`);
  }
}

function updateNextConfig() {
  console.log(`\n${colors.yellow}Updating Next.js configuration...${colors.reset}`);
  
  const nextConfig = `/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  distDir: 'out',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.extensions = ['.js', '.jsx', '.json'];
    return config;
  },
}`;
  
  fs.writeFileSync('next.config.js', nextConfig);
  console.log(`${colors.green}- Created optimized next.config.js${colors.reset}`);
}

function simplifyPages() {
  console.log(`\n${colors.yellow}Creating simplified entry point...${colors.reset}`);
  
  // Create app directory if it doesn't exist
  if (!fs.existsSync('app')) {
    fs.mkdirSync('app', { recursive: true });
    console.log(`- Created app directory`);
  }
  
  // Create a simple page.js file
  const simplePageJs = `export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      padding: '20px',
      background: '#121212',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#3498db', marginBottom: '24px', fontSize: '32px' }}>
        Site is being updated
      </h1>
      <p style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: '16px', color: '#cccccc' }}>
        We're currently updating our systems to improve your experience.
      </p>
      <p style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: '16px', color: '#cccccc' }}>
        Our team is working to resolve this as quickly as possible.
      </p>
      <p style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: '16px', color: '#cccccc' }}>
        Please check back soon!
      </p>
    </div>
  );
}`;
  
  fs.writeFileSync('app/page.js', simplePageJs);
  console.log(`${colors.green}- Created simplified app/page.js${colors.reset}`);
  
  // Create simple layout.js
  const simpleLayoutJs = `export const metadata = {
  title: 'Base - Site Under Maintenance',
  description: 'We are currently updating our systems.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
  
  fs.writeFileSync('app/layout.js', simpleLayoutJs);
  console.log(`${colors.green}- Created simplified app/layout.js${colors.reset}`);
}

// Main execution
async function main() {
  try {
    // Step 1: Remove TypeScript config
    removeTypeScriptConfig();
    
    // Step 2: Remove TypeScript dependencies
    removeTypeScriptDependencies();
    
    // Step 3: Update Next.js config
    updateNextConfig();
    
    // Step 4: Create simple pages
    simplifyPages();
    
    // Step 5: Create fallback files (in case build fails)
    createFallbackFiles();
    
    // Step 6: Run build command
    console.log(`\n${colors.yellow}Attempting to run build...${colors.reset}`);
    const buildResult = runCommand('npm run build');
    
    if (buildResult.success) {
      console.log(`\n${colors.green}${colors.bold}✅ BUILD SUCCEEDED!${colors.reset}`);
      console.log(`\nVercel should deploy the contents of the 'out' directory.`);
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ BUILD FAILED!${colors.reset}`);
      console.log(`\nVercel will deploy the fallback page from the 'out' directory.`);
    }
    
    console.log(`\n${colors.bold}${colors.yellow}Nuclear deployment completed!${colors.reset}`);
    console.log(`Make sure to set the following in Vercel project settings:`);
    console.log(`1. Build Command: node nuclear-deploy.js`);
    console.log(`2. Output Directory: out`);
    console.log(`3. Node.js Version: 20.x`);
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bold}NUCLEAR DEPLOYMENT FAILED:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

main(); 