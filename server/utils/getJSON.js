const https = require('https');

module.exports = function getJSON(options) {
  return new Promise((resolve, reject) => {
    https
      .get(options, (res) => {
        if (res.statusCode !== 200)
          reject(
            new Error('Request Failed.\n' + `Status Code: ${res.statusCode}`)
          );

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(rawData));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
};
