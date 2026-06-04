module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 56) auto-configures the Reanimated/Worklets plugin.
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
  };
};
