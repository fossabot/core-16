/**
 * @fileoverview Middleware
 */

//Imports
const json = require('express').json;
const logger = require('./logger.js');
const router = require('express').Router();
const sanitizer = require('express-sanitizer');
const security = require('./security.js');
const session = require('./session.js');
const {upload} = require('../../config.js').core;

//Middleware
router.use(logger);
router.use(sanitizer());
router.use(json({
  limit: upload
}));
router.use(security);
router.use('/api', session);

//Export
module.exports = router;