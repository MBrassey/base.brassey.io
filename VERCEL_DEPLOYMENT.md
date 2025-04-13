# Vercel Deployment Guide

This document provides guidelines and troubleshooting tips for deploying this Next.js 15 + React 19 application to Vercel.

## Prerequisites

- Vercel account with access to the repository
- Required environment variables (see below)

## Environment Variables

The following environment variables must be set in the Vercel project settings:

| Variable                          | Description                                              |
|-----------------------------------|----------------------------------------------------------|
| `WALLETCONNECT_PROJECT_ID`        | WalletConnect Project ID from https://cloud.walletconnect.com/ |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Same as above, exposed to client-side                |
| `ALCHEMY_API_KEY`                 | Alchemy API Key for Base mainnet                         |
| `CDP_PROJECT_ID`                  | Coinbase Developer Platform Project ID (optional)        |

## Deployment Configuration

The project includes a `vercel.json` file with specific deployment settings:

```json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max_old_space_size=4096"
    }
  },
  "framework": "nextjs",
  "buildCommand": "node build.js",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "WALLETCONNECT_PROJECT_ID": "${WALLETCONNECT_PROJECT_ID}",
    "ALCHEMY_API_KEY": "${ALCHEMY_API_KEY}",
    "CDP_PROJECT_ID": "${CDP_PROJECT_ID}",
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID": "${NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ]
}
```

## Custom Build Script

The project uses a custom build script (`build.js`) to ensure all required dependencies are properly installed before building:

```javascript
// Custom build script for Vercel deployment
const { execSync } = require('child_process');

console.log('Starting custom build process...');

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

// Ensure critical dependencies are installed
console.log('Installing critical dependencies...');
runCommand('npm install --no-save tailwindcss@3.4.17 postcss@8.4.35 autoprefixer@10.4.17 pino-pretty@13.0.0');

// Install project dependencies
console.log('Installing project dependencies...');
runCommand('npm install');

// Run the Next.js build
console.log('Building Next.js application...');
runCommand('npx next build');

console.log('Build completed successfully!');
```

This script ensures that critical dependencies like `tailwindcss` and `pino-pretty` are available during the build process.

## Node.js Version

The project requires Node.js 20.12.0 or later. This is specified in the `.nvmrc` file and the `engines` field in `package.json`.

## Common Issues and Troubleshooting

### Missing Dependencies

If you encounter errors about missing dependencies like `tailwindcss` or `pino-pretty`, ensure:

1. These are explicitly installed in the build command or custom build script
2. They are listed with exact versions in `package.json`
3. The custom build script (`build.js`) is being used

### API Route Errors (401, 500)

If API routes return errors:

1. Verify that all required environment variables are set in Vercel
2. Check API route implementation for proper error handling
3. Ensure the `ALCHEMY_API_KEY` is valid and has access to the Base network

### Package Manager Issues

The project uses:
- Local development: pnpm
- Vercel deployment: npm

This is configured in `vercel.json` to ensure compatibility.

## Deployment Steps

1. Push changes to the connected repository
2. Vercel will automatically deploy the latest commit
3. Verify the deployment by checking the logs at `https://vercel.com/[your-account]/[project-name]/deployments`
4. Test the API routes and frontend functionality after deployment

## Manual Deployment

To manually deploy from your local machine:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy with environment prompt
vercel

# Or deploy with existing env variables
vercel --prod
``` 