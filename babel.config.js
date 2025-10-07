module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-paper/babel',
      // Handle import.meta for web builds
      ['@babel/plugin-syntax-import-meta'],
    ],
  };
};
