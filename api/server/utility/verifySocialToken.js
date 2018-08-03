const axios = require('axios');
const errors = require('feathers-errors');
module.exports = (network, socialId, socialToken) => {
  return new Promise(async (resolve, reject) => {
    let url;
    switch (network) {
    case 'google'  : url = `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${socialToken}`; break;
    case 'facebook': url = `https://graph.facebook.com/me?access_token=${socialToken}`; break;
    case 'github'  : url = `https://api.github.com/user?access_token=${socialToken}`; break;
    case 'windows' : url = `https://apis.live.net/v5.0/me?access_token=${socialToken}`; break;
    // TODO: (later) Add other social login API endpoints here.
    // TODO: (soon) Implement single table of social logins, including data for client-side (client_id, url, proxy for oauth1, etc.), move data to config.
    default:
      reject(new errors.BadRequest('Invalid network.', { network }));
    }
    let socialAuth = await axios.get(url);
    socialAuth = socialAuth.data;
    // if 'sub' key does not exist, auth fails
    if (!socialAuth.hasOwnProperty('sub')) {
      reject(new errors.BadRequest('Invalid Social Token.', { socialToken }));
    }
    if (socialAuth.sub !== socialId) {
      reject(new errors.BadRequest('Social Token does not match Social Id.', { socialToken, socialId }));
    }
    resolve(true);
  });
};