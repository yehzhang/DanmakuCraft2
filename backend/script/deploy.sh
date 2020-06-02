#!/bin/bash

set -e

# Parse args
readonly env="$1"

# Setup build directory.
cd ..
readonly buildPath="$PWD/build"
readonly deployPath="$buildPath/deploy"
rm -rf "$deployPath"
mkdir "$deployPath"

readonly publicPath="$deployPath/public"
mkdir "$publicPath"

readonly resourcePath="$publicPath/resource"
mkdir "$resourcePath"

readonly cloudPath="$deployPath/cloud"
mkdir "$cloudPath"

# Copy resources.
cp -a "$buildPath/audio/." "$resourcePath"

# Copy config.
cp -a ./backend/config/b4aProject/. "$deployPath"

# Copy website.
cp -a "$buildPath/website/src/." "$cloudPath"
cp -a "$buildPath/website/public/." "$publicPath"

# Copy client script.
cp "$buildPath/bundle.js" "$publicPath"

# Deploy.
cd "$deployPath"
b4a deploy "$env"
