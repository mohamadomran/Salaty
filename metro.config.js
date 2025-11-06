const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Enable path aliases for cleaner imports
  resolver: {
    alias: {
      '@': './src',
    },
    
    // Optimize asset handling
    assetExts: [
      // Default asset extensions
      'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
      'ttf', 'otf', 'woff', 'woff2',
      // Add any custom asset types
    ],
    
    // Source extensions for better module resolution
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
  
  // Optimizations for better performance
  transformer: {
    // Enable minification for production builds
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
    
    // Enable Babel plugin for runtime optimization
    babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  },
  
  // Improve bundling performance
  maxWorkers: 4,
  
  // Watch settings for development
  watchFolders: [
    // Only watch necessary folders
    './src',
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
