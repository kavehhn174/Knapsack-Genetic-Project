# Genetic Algorithm for Solving the Backpack Problem

## Overview
This program uses a **Genetic Algorithm (GA)** to solve the **Backpack Problem** (a variation of the Knapsack Problem), optimizing the selection of items based on given constraints. The goal is to maximize the value of items selected while staying within the defined weight and size limits.

### Constraints
- **Maximum Weight**: 220 Kg
- **Maximum Size**: 2 Cubic Meters

### Input
The program reads the following properties of items from a CSV file (`data.csv`):
- `weight` (Kg)
- `size` (Cubic Meters)
- `value` (Utility Value)

### Genetic Algorithm Basics
1. **Chromosome Representation**:
    - Each chromosome is a binary array where:
        - `1` = Item is selected
        - `0` = Item is not selected
    - Example: `1000000001` means only the first and last items are picked.

2. **Fitness Function**:
    - Calculates the total weight, size, and value of items selected.
    - Returns a fitness score of `0` if constraints are violated; otherwise, returns the total value.

3. **Population**:
    - Initially generates 200 random chromosomes, which might violate constraints.

4. **Selection**:
    - Ranks chromosomes based on how close they are to the weight and size limits.
    - Normalizes differences into percentages and calculates an average score for ranking.

5. **Crossover and Mutation**:
    - Combines two parent chromosomes to produce children.
    - Introduces random mutations to maintain genetic diversity.

6. **Evolution**:
    - Replaces the worst chromosomes in each generation with newly generated children.

7. **Termination**:
    - Runs for 300 iterations or until satisfactory solutions are achieved.

---

## How It Works

### 1. Initialization
- Generates 200 random chromosomes (binary arrays).
- Example Chromosome: `1001010101`
    - Selects the 1st, 4th, 6th, and 8th items.

### 2. Fitness Evaluation
- Evaluates each chromosome by:
    - Summing up the weight, size, and value of selected items.
    - Penalizing chromosomes that exceed constraints (fitness = `0`).

### 3. Ranking
- Calculates the difference between:
    - Chromosome weight and `220 Kg` (normalized to 0-1).
    - Chromosome size and `2 Cubic Meters` (normalized to 0-1).
- Averages these percentages to rank chromosomes based on fitness.

### 4. Selection and Reproduction
- Selects chromosomes for reproduction:
    - The **best chromosome** (highest fitness).
    - The **worst chromosome** (lowest fitness) or a random parent.
- Produces two children using crossover:
    - Combines segments of the parent chromosomes.
    - Introduces random mutations with a probability of `0.8`.

### 5. Evolution
- Replaces the worst chromosomes in the population with the new children.
- Repeats for 300 generations or until acceptable solutions are found.

### 6. Result
- Logs the best chromosome:
    - List of items selected.
    - Total value, weight, and size.
- Achieves over 190 valid solutions from an initial population of invalid solutions in less than 300 iterations.

---

## Example Output
### Best Chromosome
```
The best chromosome is: 1010010101
```
### Selected Products
```
List of selected products:
- Item 1: Weight = 50 Kg, Size = 0.5 m³, Value = 100
- Item 4: Weight = 30 Kg, Size = 0.3 m³, Value = 70
- Item 6: Weight = 40 Kg, Size = 0.4 m³, Value = 90
- Item 8: Weight = 20 Kg, Size = 0.2 m³, Value = 50
```
### Evaluation
```
You can see the evaluation here:
{ weight: 140 Kg, size: 1.4 m³, value: 310 }

We got 192 correct answers.
```

---

## Features
- **Dynamic Population Evolution**: Starts with random chromosomes and evolves toward optimal solutions.
- **Constraint Handling**: Ensures solutions respect weight and size limits.
- **Efficient Optimization**: Achieves high-quality solutions in less than 300 iterations.
- **Randomness and Mutation**: Maintains diversity in the population, avoiding local optima.

---

## How to Run
1. Place your item data in a CSV file named `data.csv` with the columns:
    - `weight`
    - `size`
    - `value`

2. Run the script:
```bash
node backpack-genetic.js
```
3. View the results in the console.

---

## Notes
- Modify `MaxWeight`, `MaxSize`, `NumberOfGenerations`, and `NumberOfSamples` to adjust constraints or performance.
- Ensure the CSV file is correctly formatted with appropriate numerical values.

---