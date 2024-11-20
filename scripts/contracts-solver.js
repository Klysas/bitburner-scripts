import { findFiles } from "scripts/find-files";
import { tprintLines } from "scripts/utils";

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
	"Encryption I: Caesar Cipher": solveCaesarCipher,
	"Generate IP Addresses": solveGenerateIPAddresses,
	"Merge Overlapping Intervals": solveMergeOverlappingIntervals,
	"Proper 2-Coloring of a Graph": solveProper2ColoringOfAGraph,
	"Subarray with Maximum Sum": solveSubarrayWithMaximumSum,
	"Total Ways to Sum": solveTotalWaysToSum,
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

	do {
		const oldWeight = weight;
		weight = Math.max(...weightArray.slice(0, weight + 1));
		if (oldWeight === weight) return 0;
		jumps++;
	} while (weight < weightArray.length);

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