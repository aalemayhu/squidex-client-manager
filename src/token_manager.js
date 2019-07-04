const fs = require('fs');

const axios = require('axios');
const querystring = require('querystring');

const { Log } = require('./logger');

class SquidexTokenManager {
  constructor(url, id, secret, debugTokenFile) {
    this.connectUrl = url;
    this.client_id = id;
    this.client_secret = secret;
    this.debugTokenFile = debugTokenFile;

    // Use cache if available
    if (debugTokenFile && fs.existsSync(debugTokenFile)) {
      this.accessToken = JSON.parse(fs.readFileSync(debugTokenFile));
    }
  }

  /**
   * Check if the token is valid
   */
  isTokenValid() {
    return this.secondsSinceCreation() < this.accessToken.expires_in;
  }

  /**
   * Asynchronous function to retrieve token.
   */
  async getToken() {
    // If don't have token yet trigger the refresh
    if (!this.accessToken) {
      await this.refresh();
    } else if (!this.isTokenValid()) {
      // We have a token, check it's not expired
      await this.refresh();
    }
    return this.accessToken.access_token;
  }

  /**
   * Retrieve a new accessToken for the client and optionally cache it.
   */
  async refresh() {
    const accessToken = await axios.post(this.connectUrl,
      querystring.stringify({
        grant_type: 'client_credentials',
        client_id: this.client_id,
        client_secret: this.client_secret,
        scope: 'squidex-api',
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

    if (!accessToken) {
      throw Error('Received a bad accessToken!');
    }
    this.accessToken = accessToken.data;
    this.accessToken.createdAt = new Date();

    if (this.debugTokenFile) {
      fs.writeFileSync(this.debugTokenFile, JSON.stringify(this.accessToken, null, 2));
      Log.Debug(`token cached at ${this.debugTokenFile}`);
    }
  }

  /**
     * Return the number of seconds since the token was cached.
     */
  secondsSinceCreation() {
    const startDate = new Date(this.accessToken.createdAt);
    const endDate = new Date();
    return (endDate.getTime() - startDate.getTime()) / 1000;
  }
}

module.exports.SquidexTokenManager = SquidexTokenManager;
