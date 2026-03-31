// Utility that returns JSON data from the City of Charlotte API with project details

const https = require('https');

/**
 * Make a GET request to an external API
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional request options (headers, etc.)
 * @returns {Promise<Object>} - The parsed JSON response
 */
async function fetchFromCity(url, options = {}) {
  return new Promise((resolve, reject) => {

    const protocol = https;
    const requestOptions = {
      method: 'GET',
      headers: {
        ...options.headers,
      },
      timeout: options.timeout || 30000,
    };

    const request = protocol.get(url, requestOptions, (response) => {
      let data = '';

      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`API request failed with status ${response.statusCode}: ${response.statusMessage}`));
      }

      // Collect response data
      response.on('data', (chunk) => {
        data += chunk;
      });

      // Parse and resolve when done
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    });

    request.on('error', (error) => {
      reject(new Error(`API request failed: ${error.message}`));
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('API request timeout'));
    });
  });
}

module.exports = {
  fetchFromCity,
};
