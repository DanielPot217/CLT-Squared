// app.config.js
import 'dotenv/config'; // Requires: npm install dotenv

export default ({ config }) => {
  return {
    ...config, // This copies everything currently in your app.json
    plugins: [
      [
        "@rnmapbox/maps",
        {
          // Reads the secret token from your .env file
          RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN
        }
      ]
    ]
  };
};
