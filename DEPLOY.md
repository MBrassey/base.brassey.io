# Standard Deployment Guide

This project is configured for standard deployment on Vercel with pnpm. The following configuration ensures a smooth build process:

## Build Configuration

1. **Node.js Version**: 20.x
2. **Framework Preset**: Next.js
3. **Build Command**: `node build.js`
4. **Output Directory**: `.next`
5. **Package Manager**: pnpm with `--no-frozen-lockfile` flag to handle lockfile mismatches

## Key Files

- **build.js**: Standard build script that detects package manager (pnpm), enables corepack if needed, and installs TypeScript dependencies.
- **postcss.config.mjs**: ES Module version of PostCSS config.
- **postcss.config.js**: CommonJS fallback for PostCSS config.
- **next.config.js**: Standard Next.js configuration with type checking disabled during builds.
- **vercel.json**: Vercel-specific configuration with environment variables and build settings.

## Environment Variables

The following environment variables are automatically used from your Vercel project settings:

- `WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `ALCHEMY_API_KEY`
- `CDP_PROJECT_ID`

## Deployment Process

1. Push changes to your repository
2. Vercel will automatically detect changes and deploy
3. The build process will:
   - Detect pnpm as the package manager
   - Install dependencies with `--no-frozen-lockfile` to handle lockfile mismatches
   - Install TypeScript dependencies
   - Skip type checking during build
   - Build the Next.js application with pnpm
   - Deploy the result

If you encounter build issues, check the Vercel build logs for details. 