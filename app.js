const csv = require('csvtojson');
const csvFilePath = './data.csv';
const {promisify} = require('util');
const sleep = promisify(setTimeout);

// Constraints :
const MaxWeight = 220;
const MaxSize = 2;
let Items = [];
const NumberOfGenerations = 10000;
const NumberOfSamples = 200;
const SizeThresh = 6
const WeightThresh = 660
const FixedThresholdMode = false;
const MutationRate = 0.9;
let SampleEvaluation = [];
let FullDetailEval = [];
const Samples = [];

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
    let BadIndexes = [];
    let WeightDifferenceArray = [];
    let SizeDifferenceArray = [];
    let SmallSizeDifference = [];
    let SmallWeightDifference = [];
    let AVGDiff = [];
    for (let i = 0; i < Array.length; i++) {
        WeightDifferenceArray.push(Array[i].weight - MaxWeight)
        SizeDifferenceArray.push(Array[i].size - MaxSize)
    }
    let WDA = JSON.parse(JSON.stringify(WeightDifferenceArray))
    let SDA = JSON.parse(JSON.stringify(SizeDifferenceArray))

    let BiggestWeightDiff = WDA.sort(function (a, b) {  return b - a;  })[0];
    let BiggestSizeDiff = SDA.sort(function (a, b) {  return b - a;  })[0];

    for (let i = 0; i < Array.length; i++) {
        SmallSizeDifference.push(parseFloat((WeightDifferenceArray[i] / BiggestWeightDiff).toFixed(2)))
        SmallWeightDifference.push(parseFloat((SizeDifferenceArray[i] / BiggestSizeDiff).toFixed(2)))
    }

    for (let i = 0; i < Array.length; i++) {
        AVGDiff.push(parseFloat(((SmallSizeDifference[i] + SmallWeightDifference[i]) / 2).toFixed(2)))
    }

    // console.log(SmallWeightDifference)
    // console.log(SmallSizeDifference)
    // console.log(AVGDiff)


    let Max1 = -1;
    let Max2 = -1;

    for (let i = 0; i < AVGDiff.length; i++) {
        if (AVGDiff[i] > Max1) {
            Max1 = AVGDiff[i]
            BadIndexes[0] = i;
        } else if (AVGDiff[i] > Max2) {
            Max2 = AVGDiff[i];
            BadIndexes[1] = i;
        }
    }



    for (let i = 0; i < AVGDiff.length; i++) {
        if (AVGDiff[i] === Max2 && i !== BadIndexes[0] && i !== BadIndexes[1]) {
            BadIndexes.push(i)
        }
    }


    // const BadIndexes = [];
    //
    // if (FixedThresholdMode === true) {
    //     for (let i = 0; i < Array.length; i++) {
    //         if (Array[i].size > SizeThresh && Array[i].weight > WeightThresh) {
    //             // console.log(Array[i])
    //             BadIndexes.push(i)
    //         }
    //     }
    // }
    //
    // if (FixedThresholdMode === false) {
    //     let SizeSum = 0;
    //     let WeightSum = 0;
    //     for (let i = 0; i < Array.length; i++) {
    //         SizeSum += Array[i].size;
    //         WeightSum += Array[i].weight;
    //     }
    //
    //     let SizeThreshold = SizeSum / Array.length;
    //     let WeightThreshold = WeightSum / Array.length;
    //
    //     for (let i = 0; i < Array.length; i++) {
    //         if (Array[i].size > SizeThreshold && Array[i].weight > WeightThreshold) {
    //             BadIndexes.push(i)
    //         }
    //     }
    //
    //     console.log('ST ',SizeThreshold)
    //     console.log('WT ',WeightThreshold)
    // }



    return BadIndexes
}

// Chromosome Selector
function ChromosomeSelector(Array) {
    if (Array.length === 2) {
        return [Array[0], Array[1]]
    }

    if (Array.length < 2) {
        return
    }

    const FirstParentIndex = Math.floor(Math.random() * Array.length)
    let SecondParentIndex;
    let isAllowed = false;

    // Lines Below Avoid Returning Similar Indexes
    while (!isAllowed) {
        // console.log(Array)
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

    let Child1 = Array1_1.concat(Array2_2);
    let Child2 = Array2_1.concat(Array1_2);

    if (Math.random() < MutationRate) {
        Child1 = Mutate(Child1)
    }
    if (Math.random() < MutationRate) {
        Child2 = Mutate(Child2)
    }
    // console.log('----------------------')
    //
    // console.log(JSON.stringify(Child1))
    // console.log(JSON.stringify(Child2))
    //
    // console.log('CrossOver Index : ',CrossOverIndex)

    return {Child1, Child2}
}

function Mutate (Array) {
    const MutationPoint = Math.floor(Math.random() * Array.length);
    if (Array[MutationPoint] === 0) {
        Array[MutationPoint] = 1;
    } else {
        Array[MutationPoint] = 0;
    }

    return Array;
}

function LogAverages(Array) {
        let SizeSum = 0;
        let WeightSum = 0;
        for (let i = 0; i < Array.length; i++) {
            SizeSum += Array[i].size;
            WeightSum += Array[i].weight;
        }

        let SizeThreshold = SizeSum / Array.length;
        let WeightThreshold = WeightSum / Array.length;

        console.log('Size AVG :  ', parseFloat(SizeThreshold.toFixed(2)))
        console.log('Weight AVG : ', parseFloat(WeightThreshold.toFixed(2)))
}

// Main Function To Run The Program
async function main() {
    await loadJson() // Load CSV Data Into Project
    createPopulation(); // Create A List Called Samples, Each List Index Contains A List Of Selections Of Items
    SampleEval() // Evaluate The Samples Array And Their Values

    // console.log(FullDetailEval)

    for (let i = 0 ; i < NumberOfGenerations; i++) {
        SampleEval() // Evaluate The Samples Array And Their Values
        LogAverages(FullDetailEval)
        console.log('Generation : ' ,i + 1)
        const SelectedChromosomes = ChromosomeSelector(getMaxIndexes(FullDetailEval)) // Select 2 Samples From The Worst Evaluations
        if (SelectedChromosomes) {
            if (SelectedChromosomes.length >= 2) {
                Samples[SelectedChromosomes[0]] = Crossover(SelectedChromosomes[0], SelectedChromosomes[1]).Child1
                Samples[SelectedChromosomes[1]] = Crossover(SelectedChromosomes[0], SelectedChromosomes[1]).Child2
            }
        }
        // await sleep(300)
        // console.log('Generation : ', i)
    }
    // console.log(FullDetailEval)
    //
    // console.log(SampleEvaluation)


    for (let i = 0; i < SampleEvaluation.length; i++) {
        if (SampleEvaluation[i] > 0) {
            console.log(FullDetailEval[i])
            console.log(Samples[i])
        }
    }


}

main();
