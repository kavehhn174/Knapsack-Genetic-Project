const csv = require('csvtojson');
const csvFilePath = './data.csv';
const {promisify} = require('util');
const sleep = promisify(setTimeout);

// Constraints :
const MaxWeight = 220;
const MaxSize = 2;
let Items = [];
const NumberOfGenerations = 300;
const NumberOfSamples = 200;
const MutationRate = 0.8;
let SampleEvaluation = [];
let FullDetailEval = [];
const Samples = [];
let ForbidIndexes = [];

// Get Random Integer For A Certain Range
const getRangedRandomInt = (min,max) => Math.floor(Math.random() * (max - min + 1) + min)

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

    if (weight > MaxWeight || size > MaxSize) {
        return 0;
    }

    return value;
}


// Create Samples And Population

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
    // Evaluates The Samples And Checks How Much They Will Weight And Size
    const tempEval = [];
    for (let i = 0; i < Samples.length; i++) {
        tempEval.push(calculateFitness(Samples[i], i))
    }

    SampleEvaluation = tempEval;
}

// Crossover, Gets The Best & Worst Chromosome And Creates 2 Children With Them Using Crossover
function Crossover (SampleIndex1, SampleIndex2) {

    // Randomly Select A Number Between 0 - 28 , Which The Chromosome Gets Mixed From This Index
    const CrossOverIndex = getRangedRandomInt(0, Items.length) // Generates Index Between 1 and 28, So The Last and First Index Don't Get Picked

    // First Segment Of First Array
    const Array1_1 = Samples[SampleIndex1].slice(0, CrossOverIndex);

    // First Segment Of First Array
    const Array1_2 = Samples[SampleIndex1].slice(CrossOverIndex, Samples[SampleIndex1].length);

    // First Segment Of Second Array
    const Array2_1 = Samples[SampleIndex2].slice(0, CrossOverIndex);

    // First Segment Of Second Array
    const Array2_2 = Samples[SampleIndex2].slice(CrossOverIndex, Samples[SampleIndex2].length);

    // A Child With First Segment Of First Array And Second Segment Of Second Array
    let Child1 = Array1_1.concat(Array2_2);

    // A Child With First Segment Of Second Array And First Segment Of Second Array
    let Child2 = Array2_1.concat(Array1_2);

    // Generate A Random Number, If It Was Less Than Mutation Rate, It Mutates A Chromosome Index, For First Child
    if (Math.random() < MutationRate) {
        Child1 = Mutate(Child1)
    }
    // Generate A Random Number, If It Was Less Than Mutation Rate, It Mutates A Chromosome Index, For Second Child
    if (Math.random() < MutationRate) {
        Child2 = Mutate(Child2)
    }

    return {Child1, Child2}
}

function Mutate (Array) {

    // Generate A Random Number Between 0-28, Which Is The Index Of The Chromosome That Will Mutate
    const MutationPoint = Math.floor(Math.random() * Array.length);

    // If The Index Is 0, It Changes To 1 And If It's 1 It Changes To 0
    if (Array[MutationPoint] === 0) {
        Array[MutationPoint] = 1;
    } else {
        Array[MutationPoint] = 0;
    }

    return Array;
}

// Logs The Average For All The Samples In A Generation
function LogAverages(Array) {
        let SizeSum = 0;
        let WeightSum = 0;
        for (let i = 0; i < Array.length; i++) {
            SizeSum += Array[i].size;
            WeightSum += Array[i].weight;
        }

        let SizeThreshold = SizeSum / Array.length;
        let WeightThreshold = WeightSum / Array.length;

        console.log('Size AVG :  ', parseFloat(SizeThreshold.toFixed(2)), '  ', 'Weight AVG : ', parseFloat(WeightThreshold.toFixed(2)))
        console.log()
}


// Selects The Two Worst Chromosomes In The Given Sample
function TwoWorstSelector(Array) {
    let WorstIndexes = [];

    let WeightDifferenceArray = [];
    let SizeDifferenceArray = [];
    let SmallSizeDifference = [];
    let SmallWeightDifference = [];
    let AVGDiff = [];

    // Calculates The Weight & Size Difference For Each Chromosome
    for (let i = 0; i < Array.length; i++) {
        if ((Array[i].weight - MaxWeight) >= 0) {
            WeightDifferenceArray.push(Array[i].weight - MaxWeight)
        } else {
            WeightDifferenceArray.push((Array[i].weight - MaxWeight) * -1)
        }

        if ((Array[i].size - MaxSize) >= 0) {
            SizeDifferenceArray.push(Array[i].size - MaxSize)
        } else {
            SizeDifferenceArray.push((Array[i].size - MaxSize) * -1)
        }

    }

    // Saves A Static Copy Of The Given Differences
    let WDA = JSON.parse(JSON.stringify(WeightDifferenceArray))
    let SDA = JSON.parse(JSON.stringify(SizeDifferenceArray))

    // Sorts The Differences Biggest To Smallest And Picks The Biggest One
    let BiggestWeightDiff = WDA.sort(function (a, b) {  return b - a;  })[0];
    let BiggestSizeDiff = SDA.sort(function (a, b) {  return b - a;  })[0];

    // Divides All Differences By The Biggest To Convert Them To Values Between 0 and 1
    for (let i = 0; i < Array.length; i++) {
        SmallSizeDifference.push(parseFloat((SizeDifferenceArray[i] / BiggestSizeDiff).toFixed(2)))
        SmallWeightDifference.push(parseFloat((WeightDifferenceArray[i] / BiggestWeightDiff).toFixed(2)))
    }

    // Calculates And AVG Of Both Size And Weight Differences To Sort Them Evenly
    for (let i = 0; i < Array.length; i++) {
        AVGDiff.push(parseFloat(((SmallSizeDifference[i] + SmallWeightDifference[i]) / 2).toFixed(2)))
    }

    // Select The 2 Chromosomes With The Max Difference (The Worst Ones)
    let Max1 = -1;
    let Max2 = -1;
    for (let i = 0; i < AVGDiff.length; i++) {
        if (AVGDiff[i] > Max1) {
            Max1 = AVGDiff[i]
            WorstIndexes[0] = i;
        } else if (AVGDiff[i] > Max2) {
            Max2 = AVGDiff[i];
            WorstIndexes[1] = i;
        }
    }

    return WorstIndexes
}

// Selects The Two Best Chromosomes In The Given Sample
function TwoBestSelector(Array) {
    let BestIndexes = [];
    let WeightDifferenceArray = [];
    let SizeDifferenceArray = [];
    let SmallSizeDifference = [];
    let SmallWeightDifference = [];
    let AVGDiff = [];


    // Calculates The Weight & Size Difference For Each Chromosome
    for (let i = 0; i < Array.length; i++) {
        if ((Array[i].weight - MaxWeight) >= 0) {
            WeightDifferenceArray.push(Array[i].weight - MaxWeight)
        } else {
            WeightDifferenceArray.push((Array[i].weight - MaxWeight) * -1)
        }

        if ((Array[i].size - MaxSize) >= 0) {
            SizeDifferenceArray.push(Array[i].size - MaxSize)
        } else {
            SizeDifferenceArray.push((Array[i].size - MaxSize) * -1)
        }

    }


    // Saves A Static Copy Of The Given Differences
    let WDA = JSON.parse(JSON.stringify(WeightDifferenceArray))
    let SDA = JSON.parse(JSON.stringify(SizeDifferenceArray))

    // Sorts The Differences Biggest To Smallest And Picks The Biggest One
    let BiggestWeightDiff = WDA.sort(function (a, b) {  return b - a;  })[0];
    let BiggestSizeDiff = SDA.sort(function (a, b) {  return b - a;  })[0];

    // Divides All Differences By The Biggest To Convert Them To Values Between 0 and 1
    for (let i = 0; i < Array.length; i++) {
        SmallSizeDifference.push(parseFloat((SizeDifferenceArray[i] / BiggestSizeDiff).toFixed(2)))
        SmallWeightDifference.push(parseFloat((WeightDifferenceArray[i] / BiggestWeightDiff).toFixed(2)))
    }

    // Calculates And AVG Of Both Size And Weight Differences To Sort Them Evenly
    for (let i = 0; i < Array.length; i++) {
        AVGDiff.push(parseFloat(((SmallSizeDifference[i] + SmallWeightDifference[i]) / 2).toFixed(2)))
    }

    let AcceptedAnswers = 0
    for (let i = 0; i < SampleEvaluation.length; i++) {
        if (SampleEvaluation[i] > 0) {
            AcceptedAnswers++
        }
    }

    // Select The 2 Chromosomes With The Least Difference (The Best Ones)
    let Min1 = 100000;
    let Min2 = 100000;
    for (let i = 0; i < AVGDiff.length; i++) {
        if (AcceptedAnswers >= 2) {
            if (AVGDiff[i] < Min1 && SampleEvaluation[i] > 0) {
                Min1 = AVGDiff[i]
                BestIndexes[0] = i;
            } else if (AVGDiff[i] < Min2 && SampleEvaluation[i] > 0) {
                Min2 = AVGDiff[i];
                BestIndexes[1] = i;
            }
        } else {
            if (AVGDiff[i] < Min1) {
                Min1 = AVGDiff[i]
                BestIndexes[0] = i;
            } else if (AVGDiff[i] < Min2) {
                Min2 = AVGDiff[i];
                BestIndexes[1] = i;
            }
        }

    }

    return BestIndexes
}

function TournamentSelection(Array) {
        const NumberOfRandoms = getRangedRandomInt(1, NumberOfSamples)
        const ListOfSelection = [];
        const ListOfSelectionIndex = [];
        for (let i = 0; i < NumberOfRandoms; i++) {
            const RandomSampleIndex = getRandomInt(NumberOfSamples)
            ListOfSelectionIndex.push(RandomSampleIndex);
            ListOfSelection.push(Array[RandomSampleIndex]);
        }

        const SelectedIndex = getRangedRandomInt(0, NumberOfRandoms-1)

        return ListOfSelectionIndex[SelectedIndex]
        // const TwoBestInTournamentPopulation = TwoBestSelector(ListOfSelection)

        // return ListOfSelectionIndex[TwoBestInTournamentPopulation[0]]

}

// Main Function To Run The Program
async function main() {

    await loadJson() // Load CSV Data Into Project
    createPopulation(); // Create A List Called Samples; Each List Index Contains A List Of Selections Of Items
    SampleEval() // Evaluate The Samples Array And Their Values

    for (let i = 0; i < NumberOfGenerations; i++) {
        SampleEval() // Evaluate The Samples Array And Their Values
        // console.log('Generation : ' ,i + 1)
        // console.log(SampleEvaluation)
        // LogAverages(FullDetailEval) // Logs The Average For All The Samples In A Generation
        const TwoBest = TwoBestSelector(FullDetailEval); // Selects The Two Best Chromosome In Each Generation
        const TwoWorst = TwoWorstSelector(FullDetailEval); // Selects The Two Worst Chromosomes In Each Generation
        const TournamentSelectionParent = TournamentSelection(FullDetailEval);
        const TournamentSelectionChild = TournamentSelection(FullDetailEval);
        // const SelectedChromosomes = [TwoBest[0], TwoWorst[1]] // Selects Two Chromosomes, One From Best and One From Worst
        const SelectedChromosomes = [TwoBest[0], TournamentSelectionParent] // Selects Two Chromosomes, One From Best and One From Worst
        if (SelectedChromosomes) {
            if (SelectedChromosomes.length >= 2) {
                // Makes 2 Children From The Selected Chromosomes And Replaces Them With Two Worst Options
                Samples[TwoWorst[0]] = Crossover(SelectedChromosomes[0], SelectedChromosomes[1]).Child1
                // Samples[TwoWorst[1]] = Crossover(SelectedChromosomes[0], SelectedChromosomes[1]).Child2
                Samples[TournamentSelectionChild] = Crossover(SelectedChromosomes[0], SelectedChromosomes[1]).Child2
            }
        }
        // await sleep(300)
    }


    // Creates An Array Of Acceptable Answers
    const AnswersArray = [];
    for (let i = 0; i < SampleEvaluation.length; i++) {
        if (SampleEvaluation[i] > 0) {
            AnswersArray.push(FullDetailEval[i])
        }
    }

    // Finds The Best Answer Among Selected Answers
    let Max = -1;
    let MaxIndex = 0;
    for (let i = 0; i < AnswersArray.length; i++) {
        if (AnswersArray[i].value > Max && AnswersArray[i].size <= MaxSize && AnswersArray[i].weight <= MaxWeight) {
            Max = AnswersArray[i].value
            MaxIndex = i;
        }
    }

    // Finds The Products That Are Selected For The Best Chromosome
    const selectedProducts = [];
    for (let i = 0; i < Samples[MaxIndex].length; i++) {
        if (Samples[MaxIndex][i] === 1) {
            selectedProducts.push(Items[i]);
        }
    }

    // Logs The Final Answer To The Question
    console.log(' The best chromosome is : ', Samples[MaxIndex]);
    console.log(' List of selected products : ', selectedProducts)
    console.log('You can see the evaluation here : ', AnswersArray[MaxIndex]);
    console.log(AnswersArray)
    console.log(`We Got ${AnswersArray.length} Correct Answers`)


}

main()
