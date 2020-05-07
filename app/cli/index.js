/**
 * @fileoverview Cloud CNC CLI
 */

//Imports
const constants = require('fs').constants;
const crypto = require('crypto');
const fs = require('fs').promises;
const ip = require('ip');
const mongoose = require('mongoose');
const path = require('path');
const prompts = require('prompts');
const selfsigned = require('selfsigned');
require('colors');

/**
 * Display success message
 * @param {String} text 
 */
const success = text =>
{
  console.log(`${'√'.green} ${text.bold}`);
};

/**
 * Display warning message
 * @param {String} text 
 */
const warn = text =>
{
  console.warn(`${'⚠'.yellow} ${text.bold}`);
};

/**
 * Display fail message and exit
 * @param {String} text 
 */
const fail = text =>
{
  console.error(`${'✕'.red} ${text.bold}`);
  process.exit();
};

/**
 * Safely write data to file
 * @param {String} path 
 * @param {String|Buffer|URL} data 
 */
const safeWrite = async (path, data) =>
{
  //Ensure file doesn\'t exist
  try
  {
    await fs.access(path, constants.R_OK | constants.W_OK);
    fail(`Could not write to "${path}": file already exists!`);
  }
  catch (error)
  {
    if (error.code == 'ENOENT')
    {
      fs.writeFile(path, data);
    }
    else
    {
      fail(`Could not write to "${path}": ${error}`);
    }
  }
};

const onCancel = () =>
{
  fail('User canceled setup!');
  prompts.
  process.exit();
};

const main = async () =>
{
  //Ensure crypto directory exists
  try
  {
    await fs.access(path.resolve(__dirname, '../../crypto'), constants.R_OK | constants.W_OK);
  }
  catch (error)
  {
    if (error && error.code == 'ENOENT')
    {
      await fs.mkdir(path.resolve(__dirname, '../../crypto'));
    }
    else
    {
      fail(`Could not create the "crypto" folder: ${error}`);
    }
  }

  //Read file
  let config = await fs.readFile(path.resolve(__dirname, './local.js'), 'utf8');

  //Prompt user
  const {mongoUri} = await prompts({
    type: 'text',
    name: 'mongoUri',
    message: 'MongoDB URI',
    initial: 'mongodb://localhost:27017/cloud-cnc',
    validate: value => /^mongodb:\/\/.+:\d+.+$/.test(value) || 'Must be a valid URI!'
  }, {onCancel});

  const {secretDirectory} = await prompts({
    type: 'text',
    name: 'secretDirectory',
    message: 'Session secret directory',
    initial: './config/secret.txt',
    validate: value => /^(.+)\/([^/]+)$/.test(value) || 'Must be a valid directory!'
  }, {onCancel});

  const {tls} = await prompts({
    type: 'toggle',
    name: 'tls',
    message: 'Use TLS',
    initial: true
  }, {onCancel});

  //Edit config
  config = config
    .replace('[MONGO_URI]', mongoUri)
    .replace('[SECRET_DIRECTORY]', secretDirectory)
    .replace('[TLS]', tls);

  //Certificate generation/selection
  if (tls)
  {
    //Edit config
    config = config
      .replace('[PORT]', 443);

    const {generateCertificate} = await prompts({
      type: 'toggle',
      name: 'generateCertificate',
      message: 'Generate self-signed certificate',
      initial: true
    }, {onCancel});

    //Edit config
    config = config
      .replace('[SELF_SIGNED]', generateCertificate);

    //Generate self-signed certificate
    if (generateCertificate)
    {
      //Prompt user
      const {address} = await prompts({
        type: 'text',
        name: 'address',
        message: 'Domain/IP',
        validate: value => (value && (ip.isV4Format(value) || /^[A-z0-9-]{1,63}\.[A-z0-9]{2,6}$/.test(value))) || 'Must be a valid domain or IP address!'
      }, {onCancel});

      //Edit config
      config = config
        .replace('[DOMAIN]', address)
        .replace('[CERT_DIRECTORY]', './config/cert.cer')
        .replace('[KEY_DIRECTORY]', './config/key.pem');

      //Create certificate
      const certificate = selfsigned.generate([
        {name: 'commonName', value: address},
        {name: 'organizationName', value: `Cloud CNC - ${address}`},
        {name: 'organizationalUnitName', value: `Cloud CNC - ${address}`}
      ], {
        algorithm: 'sha256',
        days: 365,
        keySize: 2048,
        extensions: [{
          name: 'subjectAltName',
          altNames: [
            ip.isV4Format(address) ? {
              type: 7,
              ip: address
            } : {
                type: 6,
                value: address
              }
          ]
        }]
      });

      //Save certificate
      await safeWrite(path.resolve(__dirname, '../../config/cert.cer'), certificate.cert);
      await safeWrite(path.resolve(__dirname, '../../config/key.pem'), certificate.private);

      success('Generated self-signed certificates!');
    }
    //Ask for user-provided certificate and key
    else
    {
      //Prompt user
      const {certificateDirectory, keyDirectory} = await prompts([
        {
          type: 'text',
          name: 'certificateDirectory',
          message: 'TLS certificate directory',
          initial: './config/cert.cer',
          validate: value => /^(.+)\/([^/]+)$/.test(value) || 'Must be a valid directory!'
        },
        {
          type: 'text',
          name: 'keyDirectory',
          message: 'TLS key directory',
          initial: './config/key.pem',
          validate: value => /^(.+)\/([^/]+)$/.test(value) || 'Must be a valid directory!'
        }
      ], {onCancel});

      //Edit config
      config = config
        .replace('[CERT_DIRECTORY]', certificateDirectory)
        .replace('[KEY_DIRECTORY]', keyDirectory);
    }
  }
  else
  {
    //Edit config
    config = config
      .replace('[CERT_DIRECTORY]', '')
      .replace('[KEY_DIRECTORY]', '')
      .replace('[PORT]', 80);
  }

  //Save config
  await safeWrite(path.resolve(__dirname, '../../config/local.js'), config);
  success('Saved modified config!');

  //Generate salt
  await safeWrite(path.resolve(__dirname, '../../config/secret.txt'), crypto.randomBytes(512).toString('base64'));
  success('Generated salt for session secrets!');

  //Prompt user
  const {createAdmin} = await prompts({
    type: 'toggle',
    name: 'createAdmin',
    message: 'Create root admin',
    initial: true
  }, {onCancel});

  //Create root admin
  if (createAdmin)
  {
    //Loop until passwords match
    while (true)
    {
      //Prompt user
      const {username, password, confirmPassword} = await prompts([
        {
          type: 'text',
          name: 'username',
          message: 'Root admin username',
          validate: value => /^.{3,30}$/.test(value) || 'Must be between 3 and 30 characters!'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Root admin password',
          validate: value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-z0-9]).{12,256}$/.test(value) || 'Must be between 12 and 256 characters, contain one upper and one lower case letter, a number, and a symbol!'
        },
        {
          type: 'password',
          name: 'confirmPassword',
          message: 'Confirm password',
          validate: value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-z0-9]).{12,256}$/.test(value) || 'Must be between 12 and 256 characters, contain one upper and one lower case letter, a number, and a symbol!'
        }
      ], {onCancel});

      if (password != confirmPassword)
      {
        console.clear();
        warn('Passwords don\'t match!');
      }
      else
      {
        //Connect to MongoDB
        await mongoose.connect(mongoUri, {
          useCreateIndex: true,
          useFindAndModify: false,
          useNewUrlParser: true,
          useUnifiedTopology: true
        });

        //Create account
        const account = require('../controllers/account');

        await account.create(username, password, false, 'admin');

        success('Created root admin!');

        break;
      }
    }
  }

  //Start information
  console.log(`
${`Start Cloud CNC by running "${'npm start'.underline}".`.bgWhite.black}
${'Make sure your MongoDB instance is running first!'.bgWhite.black}

You can re-run this command at any time by running "${'npm run config'.underline}" or manually edit "${'config/local.js'.underline}".

Thanks for installing Cloud CNC. You can find the docs at "${'https://cloud-cnc.github.io'.underline}".
`);
  process.exit();
};
main();