const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bind IPv4 loopback so both daily clients can reach Metro:
//   emulator → 10.0.2.2:8081 (AVD alias of host 127.0.0.1)
//   physical → adb reverse → 127.0.0.1:8081
// Windows Node otherwise prefers [::1], which 10.0.2.2 cannot hit.
config.server = {
  ...config.server,
  host: '127.0.0.1',
};

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = config;
