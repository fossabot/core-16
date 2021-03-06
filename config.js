/**
 * @fileoverview Cloud CNC Core Config
 */

//Export
module.exports = {
  core: {
    //Access Control List
    acl: {
      roles: {
        admin: {
          inherits: 'user',
          rules: [
            'accounts:all',
            'accounts:create',
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
        user: {
          rules: [
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

    //SSL certificate
    cert: './crypto/cert.pem',
    key: './crypto/key.pem',

    //Domain (Used for CORS and session cookies)
    domain: '127.0.0.1',

    //Listening port
    port: 443,

    //Session secret location
    secret: './crypto/secret.txt',

    //Session expire time (MS)
    expire: 1000 * 60 * 30,

    //Logging directory (Only used in production)
    logs: './logs/',

    //Max upload size
    upload: '100mb'
  },
  controller: {
    //Websocket auto-remove delay (MS)
    delay: 3000,

    //Controller key length
    keyLength: 512
  },
  data: {
    //MongoDB URI
    database: `mongodb://127.0.0.1:27017/${process.env.NODE_ENV == 'testing' ? 'testing' : 'production'}`,

    //Filesystem (Used for storing user files)
    filesystem: './files/'
  },
  //RegEx Filters (Used for frontend and backend validation)
  filters: {
    command: /^text$/,
    description: /^(.|\\s){0,1000}$/,
    key: /^[A-z0-9+/]+={0,3}$/,
    name: /^.{3,30}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-z0-9]).{12,256}$/,
    role: /^admin|user$/,
    status: /^[01]$/,
    tags: /^.{0,200}$/,
    type: /^[01]$/,
    username: /^.{3,30}$/
  }
};