import { findFiles } from "scripts/find-files";

const SOLUTIONS = {
	"Encryption I: Caesar Cipher" : solveCaesarCipher
}

/** @param {NS} ns */
export async function main(ns) {
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