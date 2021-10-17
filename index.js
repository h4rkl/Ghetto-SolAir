const fs = require("fs");
const _ = require("lodash");
const Spreadsheet = require("@moreavy/simple-csv-tools");

const csvToJSON = () => {
  const sheet = new Spreadsheet("data/raw.csv");
  const data = sheet.toArr("data/raw.json");
  // sheet.parse(data);
  const head = ['timestamp','handle','address'];
  const kvData = [];
  _.forEach(data, (value) => {
    var result = {};
    for (var i = 0; i < head.length; i++) {
      result[head[i]] = value[i];
    }
    kvData.push(result);
  });
  fs.appendFile('data/cleaned.json', JSON.stringify(kvData), function (err) {
    if (err) return console.log(err);
    console.log('Cleaned');
  });
};

const dedupeJSONKey = (key) => {
  var data = require('./data/raw.json');
  data.forEach(d => {

  });
  fs.appendFile('data/cleaned.json', JSON.stringify(data), function (err) {
    if (err) return console.log(err);
    console.log('Cleaned');
  });
}

csvToJSON();
// dedupeJSONKey();
