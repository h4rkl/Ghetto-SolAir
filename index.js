const fs = require("fs");
const _ = require("lodash");
const Spreadsheet = require("@moreavy/simple-csv-tools");
const { PublicKey } = require("@solana/web3.js");

const deleteFile = (filepath) => {
  fs.unlink(filepath, function (err) {
    if (err) return console.log(err);
    console.log('Deleted');
  });
}

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

const removeOffCurveKeys = async () => {
  const d = require("./data/cleaned.json");
  const curved = _.filter(d, v => {
    // base58 only has upper, lower and numeric
    const base58Str = v.address.replace(/[^a-z0-9s]/gi,'');
    // Solana keys are 44 chars in length
    if (base58Str.length === 44) {
      key = new PublicKey(base58Str);
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

// csvToJSON();
removeOffCurveKeys();
// dedupeJSONKey();
