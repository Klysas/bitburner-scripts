import { findFiles } from "scripts/find-files";
import { tprintLines } from "scripts/utils";

const COMMANDS = ["description"];

export function autocomplete(data, args) {
	return COMMANDS;
}

const SOLUTIONS = {
	"Algorithmic Stock Trader II": solveStockTrader2,
	"Array Jumping Game": solveArrayJumpingGame,
	"Encryption I: Caesar Cipher": solveCaesarCipher,
};

/** @param {NS} ns */
export async function main(ns) {
	const [command, argument] = ns.args;

	if (command && !COMMANDS.includes(command)) {
		ns.tprintf(`FAILED: Command is not supported. Commands: ${COMMANDS}`);
		return;
	}

	if (command) {
		const returnIndex = argument ?? 0;
		const contract = findFiles(ns, ".cct")[returnIndex];

		tprintLines(ns, 200, `TYPE: '${ns.codingcontract.getContractType(contract.file, contract.hostname)}'`, "DESCRIPTION:", ns.codingcontract.getDescription(contract.file, contract.hostname));
		return;
	}

	for (const contract of findFiles(ns, ".cct")) {
		if (hasSolutionFor(ns, contract.hostname, contract.file)) {
			solveContract(ns, contract.hostname, contract.file, ns.tprintf);
		} else {
			ns.tprintf(`No solution for '${contract.file}' on [${contract.hostname}] server.`);
		}
	}
}

/** 
 * Provides answer to "Encryption I: Caesar Cipher" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @param {Function} print Function that accepts string.
 * @returns {boolean} TRUE if success, otherwise FALSE.
*/
function solveContract(ns, hostname, file, print) {
	const answer = SOLUTIONS[ns.codingcontract.getContractType(file, hostname)](ns, hostname, file);
	const reward = ns.codingcontract.attempt(answer, file, hostname);
	print(reward ? `Success: ${reward}` 
		: `Failed '${file}' on [${hostname}] with '${answer}' answer. Remaining attempts: ${ns.codingcontract.getNumTriesRemaining(file, hostname)}`);
}

function hasSolutionFor(ns, hostname, file) {
	return Object.keys(SOLUTIONS).includes(ns.codingcontract.getContractType(file, hostname));
}

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
 * Provides answer to "Algorithmic Stock Trader II" type contract.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server on which contract is present.
 * @param {string} file Contract's file.
 * @returns {any} Answer to puzzle.
*/
function solveStockTrader2(ns, hostname, file) {
	const array = ns.codingcontract.getData(file, hostname);
	let profit = 0;
	let buyPrice = NaN;

	for (let i = 1; i < array.length; i++) {
		if (array[i - 1] === array[i]) continue;

		// BUY
		if (array[i - 1] < array[i] && isNaN(buyPrice)) {
			buyPrice = array[i - 1];
		}

		// SELL
		if (array[i - 1] > array[i] && !isNaN(buyPrice)) {
			profit += array[i - 1] - buyPrice;
			buyPrice = NaN;
		}
	}
	if (!isNaN(buyPrice)) profit += array[array.length - 1] - buyPrice;

	return profit;
}