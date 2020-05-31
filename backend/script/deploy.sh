#!/bin/bash

set -e

# Setup build directory.
cd ..
readonly cwd="$PWD"
readonly buildPath="$cwd/build"
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
cp -a "$buildPath/website/." "$cloudPath"

# Deploy.
cd "$deployPath"
b4a deploy
