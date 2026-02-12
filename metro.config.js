// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure all needed extensions are resolved (including .mjs for Firebase)
config.resolver.sourceExts = ['cjs', 'mjs', 'js', 'jsx', 'json', 'ts', 'tsx'];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config;
