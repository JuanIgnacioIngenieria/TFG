// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.assetExts = [...config.resolver.assetExts, 'mp4'];
  return config;
})();