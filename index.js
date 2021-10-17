const Spreadsheet = require("@moreavy/simple-csv-tools");

const csvToJSON = () => {
    const sheet = new Spreadsheet("data/raw.csv");
    sheet.writeJSON("data/raw.json")
};

csvToJSON();
