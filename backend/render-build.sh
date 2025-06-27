#!/bin/bash

# Install all dependencies including devDependencies for building
npm install

# Build the TypeScript code
npm run build

# Remove devDependencies after build to reduce size
npm prune --production