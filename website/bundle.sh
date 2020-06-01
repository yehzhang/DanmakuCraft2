#!/bin/bash

set -e

# Setup build directory.
readonly buildPath="../build/website"
rm -rf "$buildPath"
mkdir "$buildPath"

# Copy non-Typescript code.
cp -r "./src" "$buildPath"
readonly srcBuildPath="$buildPath/src"
find "$srcBuildPath" -name "*.ts" -type f -delete

# Compile Typescript code.
tsc --outDir "$buildPath"

# Copy package.json.
cp "./package.json" "$srcBuildPath"

# Copy public.
cp -r ./public "$buildPath"
