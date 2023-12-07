const csv = require('csvtojson');
const csvFilePath = './data.csv';
const random = require('random');

// Constraints :
const MaxWeight = 220;
const MaxSize = 2;
let Items = [];
const NumberOfGenerations = 300;
const NumberOfSamples = 200;

main();


// Generate Random Array For All The Items In The Vault
const getRandomInt = max => Math.floor(Math.random() * max);

// Loads CSV Of Data Into Item Array as JSON
const loadJson = async () => Items = await csv().fromFile(csvFilePath);


// Main Function To Run The Program
async function main() {
    await loadJson()
    console.log(Items)


}
