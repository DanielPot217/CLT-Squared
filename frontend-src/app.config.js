// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),  // keep expo-router, expo-splash-screen, etc.
    [
      "@rnmapbox/maps",
      { RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN }
    ]
  ]
});