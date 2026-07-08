const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to a local folder in the project.
  // This is required for Render deployments so it persists after the build step.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
