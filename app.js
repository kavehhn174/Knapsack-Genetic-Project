const csv = require('csvtojson');
const csvFilePath = './data.csv';

// Constraints :
const MaxWeight = 220;
const MaxSize = 2;
let Items = [];
const NumberOfGenerations = 300;
const NumberOfSamples = 200;
const Samples = [];
const TestItems = [
    0,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    0,
    0,
]



// Generate Random Array For All The Items In The Vault
const getRandomInt = max => Math.floor(Math.random() * max);

// Loads CSV Of Data Into Item Array as JSON
const loadJson = async () => Items = await csv().fromFile(csvFilePath);

// It Checks If A List Of Selected Items Is Acceptable Or Not
function calculateFitness(UsedItemsArray) {
    let weight = 0;
    let size = 0;
    let value = 0;
    for (let i = 0; i < UsedItemsArray.length; i++) {
        if (UsedItemsArray[i] === 1) {
            weight += parseInt(Items[i].weight);
            size += parseFloat(Items[i].size);
            size = parseFloat(size.toFixed(2))
            value += parseInt(Items[i].value);
        }
        console.log(weight,'/', size, '/', value)
    }
    if (weight > MaxWeight) {
        return 0;
    }
    if (size > MaxSize) {
        return 0;
    }
    return value;
}


// Create Population

function createPopulation() {
    for (let i = 0; i < NumberOfSamples; i++) {
        const tempArray = [];
        for (let j = 0; j < Items.length; j++) {
            tempArray.push(getRandomInt(2))
        }
        Samples.push(tempArray);
    }
}
// Main Function To Run The Program
async function main() {
    await loadJson()
    // calculateFitness(TestItems)

    createPopulation();
    console.log(Samples)
}

main();
