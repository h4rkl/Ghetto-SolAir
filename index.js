const Spreadsheet = require("@moreavy/simple-csv-tools");

const csvToJSON = () => {
    const sheet = new Spreadsheet("data/raw.csv");
    console.log(sheet.toStr());
};

csvToJSON();
