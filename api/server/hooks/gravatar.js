// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks, see: http://docs.feathersjs.com/api/hooks.html

// We need this to create the MD5 hash
const crypto = require('crypto');

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    const app = context.app;
    if (app.get('gravatar_only') || !context.data.avatar) {
      const ext = app.get('gravatar_ext') || '.jpg'; // Image type
      // The query.
      const query = 's=' + (app.get('gravatar_size') || 80) + '&d=' + (app.get('gravatar_default') || 'robohash') + '&r=' + (app.get('gravatar_rating') || 'g');
      // Gravatar URL query parameters
      // s= size, 1px up to 2048px
      // d= default image
      //  - <url>    : URL-encoded URL of default image
      //  - 404      : do not load any image if none is associated with the email hash, instead return an HTTP 404 (File Not Found) response
      //  - mp       : (mystery-person) a simple, cartoon-style silhouetted outline of a person (does not vary by email hash)
      //  - identicon: a geometric pattern based on an email hash
      //  - monsterid: a generated 'monster' with different colors, faces, etc
      //  - wavatar  : generated faces with differing features and backgrounds
      //  - retro    : awesome generated, 8-bit arcade-style pixelated faces
      //  - robohash : a generated robot with different colors, faces, etc
      //  - blank    : a transparent PNG image
      // r= rating
      //  - g : suitable for display on all websites with any audience type.
      //  - pg: may contain rude gestures, provocatively dressed individuals, the lesser swear words, or mild violence.
      //  - r : may contain such things as harsh profanity, intense violence, nudity, or hard drug use.
      //  - x : may contain hardcore sexual imagery or extremely disturbing violence.

      // The user email
      const { email } = context.data;
      // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
      const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');

      context.data.avatar = `${gravatarUrl}/${hash}${ext}?${query}`;
    }
    // Best practice: hooks should always return the context
    return context;
  };
};
