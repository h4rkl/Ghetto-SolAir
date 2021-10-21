const fs = require("fs");
const _ = require("lodash");
const Spreadsheet = require("@moreavy/simple-csv-tools");
const { PublicKey } = require("@solana/web3.js");
const ObjectsToCsv = require('objects-to-csv');

const deleteFile = (filepath) => {
  fs.unlink(filepath, function (err) {
    if (err) return console.log(err);
    console.log('Deleted');
  });
}

/**
 * Turns a raw.csv file into a cleaned.json file
 * contianing an array of key/vale pairs
 */
const csvToJSON = () => {
  const sheet = new Spreadsheet("data/raw.csv");
  const data = sheet.toArr("data/raw.json");
  const head = ['timestamp','handle','address'];
  const kvData = [];
  _.forEach(data, (value) => {
    var result = {};
    for (var i = 0; i < head.length; i++) {
      result[head[i]] = value[i];
    }
    kvData.push(result);
  });
  deleteFile('data/cleaned.json');
  fs.appendFile('data/cleaned.json', JSON.stringify(kvData), function (err) {
    if (err) return console.log(err);
    console.log('Cleaned');
  });
};

/**
 * Removes all keys that aren't alpha-numeris and 43/44 chars in length
 * Eg. base58 Solana keys
 */
const removeOffCurveKeys = async () => {
  const d = require("./data/cleaned.json");
  const curved = _.filter(d, v => {
    // base58 only has upper, lower and numeric
    const base58Str = v.address.replace(/\W+/g,'').replace(/\s+/g, "");
    // Solana keys are 43/44 chars in length
    if (base58Str.length === 43 || base58Str.length === 44) {
      const key = new PublicKey(base58Str);
      return PublicKey.isOnCurve(key);
    }
    return null;
  });
  deleteFile('data/curved.json');
  fs.appendFile('data/curved.json', JSON.stringify(curved), function (err) {
    if (err) return console.log(err);
    console.log('Curved');
  });
};

/**
 * Removes all the duplicates from the curved.json file by data.key
 * @param {string} key 
 */
const removeDupesByKey = async (key) => {
  let d = require("./data/curved.json");
  d = d.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t[key] === value[key]
    ))
  );
  console.log(`There are ${d.length} addresses in the list`);
  deleteFile('data/curved.json');
  fs.appendFile('data/curved.json', JSON.stringify(d), function (err) {
    if (err) return console.log(err);
    console.log('Keyed the curve');
  });
};

const bulkTokenCSV = async (amount, token) => {
  const d = require("./data/curved.json");
  const bulkData = [];
  _.map(d, v => {
    bulkData.push({
      Address: v.address,
      Amount: amount,
      Coin: token
    }); 
  });
  deleteFile('data/bulkData.csv');
  const csv = new ObjectsToCsv(bulkData);
  await csv.toDisk('./data/bulkData.csv');
};

// csvToJSON();
// removeOffCurveKeys();
// bulkTokenCSV();

module.exports = {
  deleteFile,
  csvToJSON,
  removeOffCurveKeys,
  removeDupesByKey,
  bulkTokenCSV
}