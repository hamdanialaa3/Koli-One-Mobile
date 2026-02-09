// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for import.meta issues: Force Metro to use CommonJS by prioritizing .cjs and .js
// and removing .mjs from the default resolution if it causes issues.
config.resolver.sourceExts = ['cjs', 'js', 'jsx', 'json', 'ts', 'tsx'];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config;
