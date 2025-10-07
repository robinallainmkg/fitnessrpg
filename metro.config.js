const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for ES modules and Three.js
config.resolver.alias = {
  'three/examples/jsm': 'three/examples/jsm',
  'three': 'three',
};

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
  'cjs',
];

// Fix for React Native Firebase ES Module imports
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
