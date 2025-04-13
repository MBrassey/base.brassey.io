// Standard build script for Vercel
const { execSync } = require('child_process');
const fs = require('fs');

// Function to execute commands and log output
function runCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing ${command}:`, error);
    process.exit(1);
  }
}

// Detect package manager (npm, yarn, pnpm)
function detectPackageManager() {
  if (fs.existsSync('pnpm-lock.yaml')) {
    return 'pnpm';
  } else if (fs.existsSync('yarn.lock')) {
    return 'yarn';
  } else {
    return 'npm';
  }
}

const packageManager = detectPackageManager();
console.log(`Detected package manager: ${packageManager}`);

// Enable corepack for pnpm if needed
if (packageManager === 'pnpm') {
  try {
    console.log('Enabling corepack for pnpm support...');
    execSync('corepack enable', { stdio: 'inherit' });
    // Check pnpm version
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    console.log(`PNPM version: ${pnpmVersion}`);
  } catch (error) {
    console.warn('Corepack enabling failed, but continuing with build:', error.message);
  }
}

// Log build environment
console.log('Build Environment:');
console.log(`Node version: ${process.version}`);
console.log(`PWD: ${process.cwd()}`);
console.log(`Platform: ${process.platform}`);

// Copy package.json to avoid pnpm workspace issues if they exist
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Ensure TypeScript dependencies are in package.json
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  
  packageJson.devDependencies.typescript = packageJson.devDependencies.typescript || "^5.4.5";
  packageJson.devDependencies["@types/node"] = packageJson.devDependencies["@types/node"] || "^20.10.0";
  packageJson.devDependencies["@types/react"] = packageJson.devDependencies["@types/react"] || "^18.2.0";
  packageJson.devDependencies["@types/react-dom"] = packageJson.devDependencies["@types/react-dom"] || "^18.2.0";
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with TypeScript dependencies');
}

// Ensure TypeScript is installed
console.log('Installing TypeScript dependencies...');
if (packageManager === 'pnpm') {
  runCommand('pnpm install --save-dev typescript@latest @types/node @types/react @types/react-dom');
} else if (packageManager === 'yarn') {
  runCommand('yarn add --dev typescript @types/node @types/react @types/react-dom');
} else {
  runCommand('npm install --save-dev typescript @types/node @types/react @types/react-dom');
}

// Set environment variables to skip type checking
process.env.NEXT_SKIP_TYPECHECKING = 'true';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

// Ensure tsconfig exists
if (!fs.existsSync('tsconfig.json')) {
  console.log('Creating temporary tsconfig.json...');
  const tsConfig = {
    "compilerOptions": {
      "target": "es5",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": false,
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [{ "name": "next" }],
      "paths": { "@/*": ["./*"] }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  };
  fs.writeFileSync('tsconfig.json', JSON.stringify(tsConfig, null, 2));
}

// Run standard build
console.log('Running Next.js build...');
if (packageManager === 'pnpm') {
  runCommand('NODE_OPTIONS=--max-old-space-size=4096 pnpm run build');
} else if (packageManager === 'yarn') {
  runCommand('NODE_OPTIONS=--max-old-space-size=4096 yarn build');
} else {
  runCommand('NODE_OPTIONS=--max-old-space-size=4096 npm run build');
} 