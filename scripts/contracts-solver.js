import { findFiles } from "scripts/find-files";
import { tprintLines } from "scripts/utils/printing";

const COMMANDS = ["description"];

export function autocomplete(data, args) {
	return COMMANDS;
}

const SOLUTIONS = {
	"Algorithmic Stock Trader I": solveStockTrader1,
	"Algorithmic Stock Trader II": solveStockTrader2,
	"Algorithmic Stock Trader III": solveStockTrader3,
	"Algorithmic Stock Trader IV": solveStockTrader4,
	"Array Jumping Game": solveArrayJumpingGame,
	"Array Jumping Game II": solveArrayJumpingGame2,
	"Compression I: RLE Compression": solveCompressionI,
	"Compression II: LZ Decompression": solveCompressionII,
	"Compression III: LZ Compression": solveCompressionIII,
	"Encryption I: Caesar Cipher": solveCaesarCipher,
	// "Find All Valid Math Expressions": solveFindAllValidMathExpressions, // FIX: Crashes
	"Find Largest Prime Factor": solveFindLargestPrimeFactor, // FIX: Takes long time.
	"Generate IP Addresses": solveGenerateIPAddresses,
	"Merge Overlapping Intervals": solveMergeOverlappingIntervals,
	"Minimum Path Sum in a Triangle": solveMinimumPathSumInATriangle,
	// "Proper 2-Coloring of a Graph": solveProper2ColoringOfAGraph, // FIX: Fails to solve.
	"Sanitize Parentheses in Expression": solveSanitizeParenthesesInExpression,
	"Shortest Path in a Grid": solveShortestPathInAGrid,
	"Spiralize Matrix": solveSpiralizeMatrix,
	"Subarray with Maximum Sum": solveSubarrayWithMaximumSum,
	"Total Ways to Sum": solveTotalWaysToSum,
	"Total Ways to Sum II": solveTotalWaysToSum2,
	"Unique Paths in a Grid I": solveUniquePathsInAGridI,
	"Unique Paths in a Grid II": solveUniquePathsInAGridII,
};

/** @param {NS} ns */
export async function main(ns) {
	const [command, argument] = ns.args;

	if (command && !COMMANDS.includes(command)) {
		ns.tprintf(`FAILED: Command is not supported. Commands: ${COMMANDS}`);
		return;
	}

	if (command) {
		const contract = argument ? findFiles(ns, ".cct").filter((f) => f.file.includes(argument))[0] : findFiles(ns, ".cct")[0];

		tprintLines(ns, 200, `TYPE: '${ns.codingcontract.getContractType(contract.file, contract.hostname)}'`, "DESCRIPTION:", ns.codingcontract.getDescription(contract.file, contract.hostname));
		return;
	}

	const outputLines = [];
	for (const contract of findFiles(ns, ".cct")) {
		if (hasSolutionFor(ns, contract.hostname, contract.file)) {
			const result = solveContract(ns, contract.hostname, contract.file);
			outputLines.push(result.reward ? `Success: ${result.reward}` 
				: `Failed '${contract.file}' on [${contract.hostname}] with '${result.answer}' answer. Remaining attempts: ${ns.codingcontract.getNumTriesRemaining(contract.file, contract.hostname)}`);
		} else {
			outputLines.push(`No solution for '${contract.file}'(TYPE: '${ns.codingcontract.getContractType(contract.file, contract.hostname)}') on [${contract.hostname}] server.`);
		}
	}
	tprintLines(ns, ...outputLines);
}

/** 
 * Attempts to solve provided contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {{answer: any, reward: ?string}} Used answer and reward if successful.
*/
function solveContract(ns, hostname, file) {
	const answer = SOLUTIONS[ns.codingcontract.getContractType(file, hostname)](ns, hostname, file);
	const reward = ns.codingcontract.attempt(answer, file, hostname);
	return {answer: answer, reward: reward};
}

function hasSolutionFor(ns, hostname, file) {
	return Object.keys(SOLUTIONS).includes(ns.codingcontract.getContractType(file, hostname));
}

/**
 * Calculates maximum possible profit from given stock prices.
 * 
 * @param {Array<number>} prices Array of stock prices of each day.
 * @returns {number} Maximum profit.
 */
function calculateMaximumProfit(prices) {
	let profit = 0;

	for (let i = 1; i < prices.length; i++) {
		profit += Math.max(prices[i] - prices[i - 1], 0);
	}
	return profit;
}

/**
 * Calculates maximum possible profit from given stock prices and limited amount of transactions.
 * 
 * @param {Array<number>} prices Array of stock prices of each day.
 * @param {number} maxTransactionsCount Maximum amount of buy+sell orders.
 * @returns {number} Maximum profit.
 */
function calculateMaximumProfitWithLimitedTransactions(prices, maxTransactionsCount) {
	const pricesCount = prices.length;

	if (pricesCount === 0 || maxTransactionsCount === 0) return 0;

	if (maxTransactionsCount >= Math.floor(pricesCount / 2)) return calculateMaximumProfit(prices);

	const dp = Array.from({ length: maxTransactionsCount + 1 }, () => Array(pricesCount).fill(0));

	for (let i = 1; i <= maxTransactionsCount; i++) {
		let maxDiff = -prices[0];
		for (let j = 1; j < pricesCount; j++) {
			dp[i][j] = Math.max(dp[i][j - 1], prices[j] + maxDiff);
			maxDiff = Math.max(maxDiff, dp[i - 1][j] - prices[j]);
		}
	}
	return dp[maxTransactionsCount][pricesCount - 1];
}

//========================================================
//	SOLUTIONS
//========================================================

/** 
 * Provides answer to "Encryption I: Caesar Cipher" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveCaesarCipher(ns, hostname, file) {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const alphabetLength = alphabet.length;
	const [text, shiftNumber] = ns.codingcontract.getData(file, hostname);

	return text.split("").map((letter) => {
		if (letter === " ") return letter;
		const letterIndex = (alphabet.indexOf(letter) - shiftNumber + alphabetLength) % alphabetLength;
		return alphabet[letterIndex];
	}).join("");
}

/** 
 * Provides answer to "Array Jumping Game" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveArrayJumpingGame(ns, hostname, file) {
	const array = ns.codingcontract.getData(file, hostname);
	const canReachEnd = (startingIndex) => {
		if (startingIndex + array[startingIndex] >= array.length - 1) return 1;

		const weightArray = array.slice(startingIndex, startingIndex + array[startingIndex] + 1).map((v, i) => v + i);
		const newIndex = startingIndex + weightArray.lastIndexOf(Math.max(...weightArray));
		if (startingIndex === newIndex) return 0;
		return canReachEnd(newIndex);
	};
	return canReachEnd(0);
}

/** 
 * Provides answer to "Array Jumping Game II" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveArrayJumpingGame2(ns, hostname, file) {
	const array = ns.codingcontract.getData(file, hostname);
	const weightArray = array.map((v, i) => v + i);
	let jumps = 0;
	let weight = weightArray[0];
	if (weight >= weightArray.length - 1) return 1;

	do {
		const oldWeight = weight;
		weight = Math.max(...weightArray.slice(0, weight + 1));
		if (oldWeight === weight) return 0;
		jumps++;
	} while (weight < weightArray.length - 1);

	return jumps + 1;
}

/** 
 * Provides answer to "Algorithmic Stock Trader I" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveStockTrader1(ns, hostname, file) {
	const array = ns.codingcontract.getData(file, hostname);

	return calculateMaximumProfitWithLimitedTransactions(array, 1);
}

/** 
 * Provides answer to "Algorithmic Stock Trader II" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveStockTrader2(ns, hostname, file) {
	const array = ns.codingcontract.getData(file, hostname);

	return calculateMaximumProfit(array);
}

/** 
 * Provides answer to "Algorithmic Stock Trader III" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveStockTrader3(ns, hostname, file) {
	const array = ns.codingcontract.getData(file, hostname);

	return calculateMaximumProfitWithLimitedTransactions(array, 2);
}

/** 
 * Provides answer to "Algorithmic Stock Trader IV" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveStockTrader4(ns, hostname, file) {
	const [maxTransactionsCount, prices] = ns.codingcontract.getData(file, hostname);

	return calculateMaximumProfitWithLimitedTransactions(prices, maxTransactionsCount);
}

/** 
 * Provides answer to "Subarray with Maximum Sum" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveSubarrayWithMaximumSum(ns, hostname, file) {
	const array = ns.codingcontract.getData(file, hostname);
	let sum = 0;

	for (let i = 0; i < array.length; i++) {
		for (let j = i; j < array.length; j++) {
			const newSum = array.slice(i, j + 1).reduce((partialSum, a) => partialSum + a, 0);
			sum = newSum > sum ? newSum : sum;
		}
	}
	return sum;
}

/** 
 * Provides answer to "Total Ways to Sum" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveTotalWaysToSum(ns, hostname, file) {
	const number = ns.codingcontract.getData(file, hostname);
	let table = new Array(number + 1).fill(0);
	table[0] = 1;

	for (let i = 1; i < number; i++) 
		for (let j = i; j <= number; j++) 
			table[j] += table[j - i];

	return table[number];
}

/** 
 * Provides answer to "Total Ways to Sum II" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveTotalWaysToSum2(ns, hostname, file) {
	const [number, integers] = ns.codingcontract.getData(file, hostname);
	let table = new Array(number + 1).fill(0);
	table[0] = 1;

	for (const i of integers) 
		for (let j = i; j <= number; j++) 
			table[j] += table[j - i];

	return table[number];
}

/** 
 * Provides answer to "Merge Overlapping Intervals" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveMergeOverlappingIntervals(ns, hostname, file) {
	const initialIntervals = ns.codingcontract.getData(file, hostname);
	const merge = (intervals) => {
		const result = [intervals.shift()];

		for (const interval of intervals) {
			for (let i = 0; i < result.length; i++) {
				if (interval[1] < result[i][0]) {
					result.splice(i, 0, interval);
					break;
				} else if (interval[0] <= result[i][1]) {
					if (interval[0] < result[i][0]) result[i][0] = interval[0];
					if (interval[1] > result[i][1]) result[i][1] = interval[1];
					break;
				}
				if (i + 1 === result.length) result.push(interval);
			}
		}

		return intervals.length + 1 === result.length ? result : merge(result);
	};

	return merge(initialIntervals);
}

/** 
 * Provides answer to "Generate IP Addresses" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveGenerateIPAddresses(ns, hostname, file) {
	const digitsString = ns.codingcontract.getData(file, hostname);

	const MAXIMUM_DIGITS_COUNT = 12;
	const MINIMUM_DIGITS_COUNT = 4;

	if (digitsString.length < MINIMUM_DIGITS_COUNT || digitsString.length > MAXIMUM_DIGITS_COUNT)
		return [];

	const constructValidIPs = (leadingIpPart, followingDigitsString) => {
		const validIPs = [];
		const maximumFollowingDigitsCount = MAXIMUM_DIGITS_COUNT - leadingIpPart.split(".").length * 3;

		for (let i = 1; i <= 3; i++) {
			if (i > followingDigitsString.length) continue; // Avoids generating duplicate ips when there are less than 3 following digits

			const ipPart = followingDigitsString.slice(0, i);
			const followingDigitsEnding = followingDigitsString.slice(i);

			if (ipPart.length > 1 && ipPart[0] == 0) continue;
			if (Number(ipPart) > 255) continue;
			if (followingDigitsEnding.length > maximumFollowingDigitsCount) continue;

			const ip = leadingIpPart + ipPart + (maximumFollowingDigitsCount ? "." : "");
			validIPs.push(...(maximumFollowingDigitsCount ? constructValidIPs(ip, followingDigitsEnding) : [ip]));
		}

		return validIPs;
	};

	return constructValidIPs("", digitsString);
}

/** 
 * Provides answer to "Proper 2-Coloring of a Graph" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveProper2ColoringOfAGraph(ns, hostname, file) {
	const [verticesCount, edges] = ns.codingcontract.getData(file, hostname);
	const NO_COLOR = -1;
	// there can be multiple disconnected graphs(even of one vertex).
	const vertices = Array.from({ length: verticesCount }, (value, index) => {
		return { index: index, edges: [], color: NO_COLOR };
	});
	edges.forEach((e) => {
		vertices[e[0]].edges.push(e);
		vertices[e[1]].edges.push(e);
	});
	vertices[0].color = 1;

	for (let i = 0; i < 100; i++) {
		for (const vertex of vertices) {
			if (vertex.color == NO_COLOR) continue;

			const connectedVertexIndexes = vertex.edges.map((e) => e[0] ^ e[1] ^ vertex.index);
			const connectedVertices = vertices.filter((v) => connectedVertexIndexes.includes(v.index));

			for (const connectedVertex of connectedVertices) {
				if (connectedVertex.color == vertex.color) return [];

				connectedVertex.color = vertex.color ^ 1;
			}
		}
		if (vertices.every((v) => v.color != NO_COLOR)) break;
	}

	return vertices.map((v) => v.color);
}

/** 
 * Provides answer to "Sanitize Parentheses in Expression" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveSanitizeParenthesesInExpression(ns, hostname, file) {
	const str = ns.codingcontract.getData(file, hostname);

	const isValid = (str) => {
		let balance = 0;
		for (const char of str) {
			if (char === "(") balance++;
			else if (char === ")") balance--;
			if (balance < 0) return false;
		}
		return balance === 0;
	};

	const result = new Set();
	const queue = [str];
	const visited = new Set([str]);
	let found = false;

	while (queue.length > 0) {
		const current = queue.shift();

		if (isValid(current)) {
			result.add(current);
			found = true;
		}

		if (found) continue;

		for (let i = 0; i < current.length; i++) {
			if (current[i] !== "(" && current[i] !== ")") continue;

			const next = current.slice(0, i) + current.slice(i + 1);
			if (!visited.has(next)) {
				visited.add(next);
				queue.push(next);
			}
		}
	}

	return Array.from(result);
}

/** 
 * Provides answer to "Shortest Path in a Grid" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveShortestPathInAGrid(ns, hostname, file) {
	const grid = ns.codingcontract.getData(file, hostname);
	const EMPTY = 0;
	const MAXIMUM_X = grid[0].length - 1;
	const MAXIMUM_Y = grid.length - 1;
	const DIRECTIONS = [
		{ x: 0, y: -1, dir: 'U' },// Up
		{ x: 0, y: 1, dir: 'D' }, // Down
		{ x: 1, y: 0, dir: 'R' }, // Right
		{ x: -1, y: 0, dir: 'L' } // Left
	];

	const queue = [{ x: 0, y: 0, path: "" }];
	const visited = new Set(["0,0"]);

	while (queue.length > 0) {
		const { x, y, path } = queue.shift();

		if (x === MAXIMUM_X && y === MAXIMUM_Y) 
			return path;

		for (const { x: dx, y: dy, dir } of DIRECTIONS) {
			const newX = x + dx;
			const newY = y + dy;

			if (
				newX >= 0 && newX <= MAXIMUM_X &&
				newY >= 0 && newY <= MAXIMUM_Y &&
				grid[newY][newX] === EMPTY &&
				!visited.has(`${newX},${newY}`)
			) {
				visited.add(`${newX},${newY}`);
				queue.push({ x: newX, y: newY, path: path + dir });
			}
		}
	}

	return "";
}

/** 
 * Provides answer to "Find Largest Prime Factor" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveFindLargestPrimeFactor(ns, hostname, file) {
	let number = ns.codingcontract.getData(file, hostname);
	let divisor = 2;

	while (number > 1) {
		if (number % divisor == 0) 
			number /= divisor;
		else if (divisor > Math.pow(number, 2)) 
			return number;
		else divisor += 1;
	}
	return divisor;
}

/** 
 * Provides answer to "Spiralize Matrix" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveSpiralizeMatrix(ns, hostname, file) {
	const matrix = ns.codingcontract.getData(file, hostname);
	const ELEMENTS_COUNT_IN_MATRIX = matrix.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0);
	const output = [];
	const currentPosition = { x: -1, y: 0 }; // Start out of Matrix, so first postion is {0,0}
	const visited = new Set();
	const DIRECTIONS = [
		{ xChange: 1, yChange: 0 },
		{ xChange: 0, yChange: 1 },
		{ xChange: -1, yChange: 0 },
		{ xChange: 0, yChange: -1 },
	];
	let directionIndex = 0;

	while (ELEMENTS_COUNT_IN_MATRIX > visited.size) {
		let { xChange, yChange } = DIRECTIONS[directionIndex];
		let newX = currentPosition.x + xChange;
		let newY = currentPosition.y + yChange;

		if (
			newY >= 0 && newY < matrix.length &&
			newX >= 0 && newX < matrix[newY].length &&
			!visited.has(`${newX},${newY}`)
		) {
			visited.add(`${newX},${newY}`);
			currentPosition.x = newX;
			currentPosition.y = newY;
			output.push(matrix[currentPosition.y][currentPosition.x]);
		} else {
			directionIndex = (directionIndex + 1) % 4;
		}
	}
	return output;
}

/** 
 * Provides answer to "Minimum Path Sum in a Triangle" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveMinimumPathSumInATriangle(ns, hostname, file) {
	const triangle = ns.codingcontract.getData(file, hostname);

	for (let y = triangle.length - 2; y >= 0; y--) {
		for (let x = 0; x < triangle[y].length; x++) {
			triangle[y][x] += Math.min(triangle[y + 1][x], triangle[y + 1][x + 1]);
		}
	}
	return triangle[0][0];
}

/** 
 * Provides answer to "Compression I: RLE Compression" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveCompressionI(ns, hostname, file) {
	const str = ns.codingcontract.getData(file, hostname);
	let outputStr = "";
	let currentChar = str[0];
	let currentLength = 1;

	for (const char of str.slice(1)) {
		if (char == currentChar && currentLength < 9) {
			currentLength++;
		} else {
			outputStr += `${currentLength}${currentChar}`;
			currentChar = char;
			currentLength = 1;
		}
	}

	return outputStr + `${currentLength}${currentChar}`;
}

/** 
 * Provides answer to "Compression II: LZ Decompression" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveCompressionII(ns, hostname, file) {
	const encodedStr = ns.codingcontract.getData(file, hostname);
	let outputStr = "";
	let chunkType = 0;

	for (let i = 0; i < encodedStr.length; i++) {
		chunkType ^= 1;
		const length = Number(encodedStr[i]);
		if (length == 0) continue;

		if (chunkType) {
			outputStr += encodedStr.slice(i + 1, i + 1 + length);
			i += length;
		} else {
			outputStr += "".padEnd(length, outputStr.slice(encodedStr[i + 1] * -1));
			i++;
		}
	}
	return outputStr;
}

/** 
 * Provides answer to "Compression III: LZ Compression" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveCompressionIII(ns, hostname, file) {
	const str = ns.codingcontract.getData(file, hostname);
	const set = (state, i, j, str) => {
		if (state[i][j] === undefined || str.length < state[i][j].length) state[i][j] = str;
	};
	let cur_state = Array.from(Array(10), (_) => Array(10)), new_state, tmp_state, result;
	cur_state[0][1] = ""; // Initial state is a literal of length 1

	for (let i = 1; i < str.length; i++) {
		new_state = Array.from(Array(10), (_) => Array(10));
		const c = str[i];
		// TYPE 1: Copy up to 9 characters directly
		for (let len = 1; len <= 9; len++) {
			const input = cur_state[0][len];
			if (input === undefined) continue;
			if (len < 9) set(new_state, 0, len + 1, input); // Extend current literal
			else set(new_state, 0, 1, input + "9" + str.substring(i - 9, i) + "0"); // Start new literal
			for (let offset = 1; offset <= Math.min(9, i); offset++) {
				// Start new reference
				if (str[i - offset] === c)
					set(new_state, offset, 1, input + len + str.substring(i - len, i));
			}
		}
		// TYPE 2: Reference previous characters
		for (let offset = 1; offset <= 9; offset++) {
			for (let len = 1; len <= 9; len++) {
				const input = cur_state[offset][len];
				if (input === undefined) continue;
				if (str[i - offset] === c) {
					if (len < 9) set(new_state, offset, len + 1, input); // Extend current reference
					else set(new_state, offset, 1, input + "9" + offset + "0"); // Start new reference
				}
				set(new_state, 0, 1, input + len + offset); // Start new literal
				// End current reference and start new reference
				for (let new_offset = 1; new_offset <= Math.min(9, i); new_offset++) {
					if (str[i - new_offset] === c) set(new_state, new_offset, 1, input + len + offset + "0");
				}
			}
		}
		tmp_state = new_state;
		new_state = cur_state;
		cur_state = tmp_state;
	}

	for (let len = 1; len <= 9; len++) {
		let input = cur_state[0][len];
		if (input === undefined) continue;
		input += len + str.substring(str.length - len, str.length);
		if (result === undefined || input.length < result.length) result = input;
	}

	for (let offset = 1; offset <= 9; offset++) {
		for (let len = 1; len <= 9; len++) {
			let input = cur_state[offset][len];
			if (input === undefined) continue;
			input += len + "" + offset;
			if (result === undefined || input.length < result.length) result = input;
		}
	}

	return result ?? "";
}

/** 
 * Provides answer to "Unique Paths in a Grid I" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveUniquePathsInAGridI(ns, hostname, file) {
	const [rows, columns] = ns.codingcontract.getData(file, hostname);
	if (!rows && !columns) return 0;

	const dp = Array.from({ length: rows }, () => Array(columns).fill(0));
	dp[0][0] = 1;

	for (let i = 0; i < dp.length; i++) {
		for (let j = 0; j < dp[i].length; j++) {
			if (dp[i][j] > 0) continue; // Should skip only [0;0]

			dp[i][j] = (i > 0 ? dp[i - 1][j] : 0) + (j > 0 ? dp[i][j - 1] : 0);
		}
	}
	return dp[rows - 1][columns - 1];
}

/** 
 * Provides answer to "Unique Paths in a Grid II" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveUniquePathsInAGridII(ns, hostname, file) {
	const dp = ns.codingcontract.getData(file, hostname);
	const OBSTACLE = -1;
	for (let i = 0; i < dp.length; i++) {
		for (let j = 0; j < dp[i].length; j++) {
			if (dp[i][j] == 1) dp[i][j] = OBSTACLE;
		}
	}
	dp[0][0] = 1;

	for (let i = 0; i < dp.length; i++) {
		for (let j = 0; j < dp[i].length; j++) {
			if (dp[i][j] > 0) continue; // Should skip only [0;0]
			if (dp[i][j] == OBSTACLE) continue;

			dp[i][j] = Math.max(0, i > 0 ? dp[i - 1][j] : 0) + Math.max(0, j > 0 ? dp[i][j - 1] : 0);
		}
	}
	return dp[dp.length - 1][dp[0].length - 1];
}

/** 
 * Provides answer to "Find All Valid Math Expressions" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveFindAllValidMathExpressions(ns, hostname, file) {
	const [digits, targetNumber] = ns.codingcontract.getData(file, hostname);
	const SYMBOLS = ["+", "-", "*"];
	const outputExpressions = [];

	const queue = [digits];
	const visited = new Set(digits);
	while(queue.length > 0){
		const str = queue.shift();
		for (let i = 1; i < str.length; i++) {
			if (str[i] == " " || str[i - 1] == " ") continue;
			if (str[i] == "0" && i + 1 < str.length ? str[i + 1] != " " : false) continue;

			const newStr = str.slice(0, i) + " " + str.slice(i);
			if (!visited.has(newStr)) {
				visited.add(newStr);
				queue.push(newStr);
			}
		}

		const numbers = str.split(" ").map(s => parseInt(s));
		if(numbers.length == 1){
			if(numbers[0] == targetNumber) outputExpressions.push([numbers[0].toString()]);
			continue;
		}

		const symbolsLength = numbers.length - 1;
		let possibleExpressions = SYMBOLS.map((s) => numbers[0] + s);

		for (let i = 1; i < symbolsLength; i++) {
			const newPossibleExpressions = [];

			possibleExpressions.forEach((combination) => {
				SYMBOLS.forEach((symbol) => {
					newPossibleExpressions.push(combination + numbers[i] + symbol);
				});
			});

			possibleExpressions = newPossibleExpressions;
		}
		possibleExpressions = possibleExpressions.map((e) => e + numbers[numbers.length - 1]);

		for (const pe of possibleExpressions) {
			if (eval(pe) == targetNumber) outputExpressions.push(pe);
		}
	}
	return outputExpressions;
}