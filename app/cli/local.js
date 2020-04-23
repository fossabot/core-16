/**	
 * @fileoverview Production ready Cloud CNC core config
 * This config file was generated by "npm run config"
 */

//Export	
module.exports = {
  core: {
    //Access Control List (Controls what permissions each role has)	
    acl: {
      //List of roles
      roles: {
        //Role name
        admin: {
          //What permissions this role inherits
          inherits: 'user',

          //What permissions this role gains
          rules: [
            'accounts:admin',
            'accounts:all',
            'accounts:create',
            'accounts:impersonate:start',
            'controllers:all',
            'controllers:create',
            'controllers:get',
            'controllers:update',
            'controllers:remove',
            'machines:create',
            'machines:update',
            'machines:remove'
          ]
        },
        //Role name
        user: {
          //What permissions this role gains
          rules: [
            'accounts:roles',
            'accounts:impersonate:stop',
            'accounts:get',
            'accounts:update',
            'accounts:remove',
            'files:all',
            'files:create',
            'files:get',
            'files:update',
            'files:remove',
            'trash:all',
            'trash:recover',
            'trash:remove',
            'machines:all',
            'machines:get',
            'machines:command',
            'machines:execute'
          ]
        }
      }
    },

    //Cryptography options
    cryptography: {
      //TLS certificate	and key location (PEM encoded)
      cert: '[CERT_DIRECTORY]',
      key: '[KEY_DIRECTORY]',

      //Self signed (Temporarily trust certificate when running healthcheck and tests)
      selfSigned: [SELF_SIGNED],

      //Enable TLS (If enabled, you must provide TLS certificates)
      tls: [TLS],

      //Session secret location	(Used to generate session cookies, should be at least 512 bytes long)
      secret: '[SECRET_DIRECTORY]',

      //[ADVANCED USERS ONLY] Length of OTP/MFA secret (Bytes)	
      otpSecretLength: 32,

      //[ADVANCED USERS ONLY] OTP/MFA window forgiveness (30 second units)	
      otpWindows: 1
    },

    //Persistant data storage
    data: {
      //MongoDB URI	
      database: '[MONGO_URI]',

      //Filesystem (Used for storing user files)	
      filesystem: './files/',

      //Logging directory to store logs (Only used in non-Docker production)	
      logs: './logs/'
    },

    //TLS/Websocket server options
    server: {
      //Domain (Used for CORS, sessions, and tests)	
      domain: '[DOMAIN]',

      //Listening port	
      port: [PORT],

      //Session expire time (How long a login is good for) (Milliseconds)	
      sessionExpire: 1000 * 60 * 30,

      //Rate limit window (Milliseconds)	
      rateLimitWindow: 1000 * 60 * 15,

      //Maximum requests per rate limit window
      rateLimitRequests: 100,

      //Max upload size	(How big are your files going to be)
      uploadLimit: '100mb'
    }
  },
  controller: {
    //How long to wait after pinging a controller before declaring it offline (Milliseconds)	
    timeout: 1000 * 3,

    //[ADVANCED USERS ONLY] Controller symmetric key length	(Used to authenticate controllers with the core) (Bytes)
    keyLength: 512
  }
}; 