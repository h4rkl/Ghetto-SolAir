const shell = require('shelljs');
const _ = require("lodash");
const fs = require("fs");
const { deleteFile } = require('./index')

/**
 * WARNING!!!!!
 * This will execute your token transfer
 * @param {*} amount 
 * @param {*} token 
 */
const exeAirdrop = (amount, token, file) => {
  const d = require(file);
  const errors = [];
  _.forEach(d,(v, i) => {
    console.log(`Airdropping to count: ${i}/${d.length}`)
    // Execute the token transfer here
    shell.exec(`spl-token transfer ${token} ${amount} ${v.address} --fund-recipient --allow-unfunded-recipient`);
    // Push any accounts that have errors
    if (shell.error()) {
      errors.push(v);
    }
  });
  // Write the error file - should be [] if none
  deleteFile('data/errors.json');
  fs.appendFile('data/errors.json', JSON.stringify(errors), function (err) {
    if (err) return console.log(err);
    console.log('Errors');
  });
};

module.exports = {
  exeAirdrop
}