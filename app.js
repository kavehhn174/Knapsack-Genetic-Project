const csv = require('csvtojson');
const csvFilePath = './data.csv';

// Constraints :
const MaxWeight = 220;
const MaxSize = 2;
let Items = [];
const NumberOfGenerations = 30;
const NumberOfSamples = 20;
let SampleEvaluation = [];
let FullDetailEval = [];
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
function calculateFitness(UsedItemsArray, Index) {
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

    }
    FullDetailEval[Index] = {
        weight,
        size,
        value
    }
    if (weight > MaxWeight) {
        return 0;
    }
    if (size > MaxSize) {
        return 0;
    }
    return value;
}


// Create Samples

function createPopulation() {
    for (let i = 0; i < NumberOfSamples; i++) {
        const tempArray = [];
        for (let j = 0; j < Items.length; j++) {
            tempArray.push(getRandomInt(2))
        }
        Samples.push(tempArray);
    }
}

// Sample Evaluation

function SampleEval() {

    const tempEval = [];
    for (let i = 0; i < Samples.length; i++) {
        // console.log(Samples.length)
        tempEval.push(calculateFitness(Samples[i], i))
    }

    SampleEvaluation = tempEval;
}

function getMaxIndexes(Array) {
    let Max1 = -1;
    let Max2 = -1;
    const TopIndexes = [];

    for (let i = 0; i < Array.length; i++) {
        if (Array[i] > Max1) {
            Max1 = Array[i]
            TopIndexes[0] = i;
        } else if (Array[i] > Max2) {
            Max2 = Array[i];
            TopIndexes[1] = i;
        }
    }



    for (let i = 0; i < Array.length; i++) {
        if (Array[i] === Max2 && i !== TopIndexes[0] && i !== TopIndexes[1]) {
            TopIndexes.push(i)
        }
    }

    return TopIndexes
}

// Chromosome Selector
function ChromosomeSelector(Array) {
    if (Array.length === 2) {
        return [Array[0], Array[1]]
    }

    // Lines Below Avoid Returning Similar Indexes
    const FirstParentIndex = Math.floor(Math.random() * Array.length)
    let SecondParentIndex;
    let isAllowed = false;

    while (!isAllowed) {
        // console.log(isAllowed)
        SecondParentIndex = Math.floor(Math.random() * Array.length)
        if (SecondParentIndex !== FirstParentIndex) {
            isAllowed = true;
        }
    }

    return [Array[FirstParentIndex], Array[SecondParentIndex]]
}

// Crossover , Gets The Best 2 Selected Chromosomes And Then Performs Crossover Between Them
function Crossover (SampleIndex1, SampleIndex2) {
    // console.log('----------------------')
    // console.log(JSON.stringify(Samples[SampleIndex1]))
    // console.log(JSON.stringify(Samples[SampleIndex2]))
    // console.log('----------------------')

    // console.log(SampleIndex1 , ' ' , SampleIndex2)

    const CrossOverIndex = Math.floor(Math.random() * (((Samples[SampleIndex1].length - 1)- 1 )+1) + 1); // Generates Index Between 1 and 28, So The Last and First Index Don't Get Picked
    const Array1_1 = Samples[SampleIndex1].slice(0, CrossOverIndex); // First Segment Of First Array
    const Array1_2 = Samples[SampleIndex1].slice(CrossOverIndex, Samples[SampleIndex1].length); // First Segment Of First Array
    const Array2_1 = Samples[SampleIndex2].slice(0, CrossOverIndex); // First Segment Of Second Array
    const Array2_2 = Samples[SampleIndex2].slice(CrossOverIndex, Samples[SampleIndex2].length); // First Segment Of Second Array

    // console.log(JSON.stringify(Array1_1) ,JSON.stringify(Array1_2))
    // console.log(JSON.stringify(Array2_1) ,JSON.stringify(Array2_2))

    const Child1 = Array1_1.concat(Array2_2);
    const Child2 = Array2_1.concat(Array1_2);
    // console.log('----------------------')
    //
    // console.log(JSON.stringify(Child1))
    // console.log(JSON.stringify(Child2))
    //
    // console.log('CrossOver Index : ',CrossOverIndex)

    return {Child1, Child2}
}

// Main Function To Run The Program
async function main() {
    await loadJson() // Load CSV Data Into Project
    createPopulation(); // Create A List Called Samples, Each List Index Contains A List Of Selections Of Items

    for (let i = 0 ; i < NumberOfGenerations; i++) {
        SampleEval() // Evaluate The Samples Array And Their Values
        const SelectedChromosomes = ChromosomeSelector(getMaxIndexes(SampleEvaluation)) // Select 2 Samples From T
        // console.log(SelectedChromosomes)
        Samples[SelectedChromosomes[0]] = Crossover(SelectedChromosomes[0], SelectedChromosomes[1]).Child1
        Samples[SelectedChromosomes[1]] = Crossover(SelectedChromosomes[0], SelectedChromosomes[1]).Child2
    }

    console.log(FullDetailEval)

    for (let i = 0; i < SampleEvaluation; i++) {
        if (SampleEvaluation[i] !== 0) {
            console.log(SampleEvaluation[i])
        }
    }


}

main();
