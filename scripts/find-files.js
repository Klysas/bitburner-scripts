import { tprintLines, getAllServers } from "scripts/utils";

export function autocomplete(data, args) {
	return [".js", ".txt", ".cct", ".msg", ".lit", ".exe"];
}

/** @param {NS} ns */
export async function main(ns) {
	const [fileSubstring] = ns.args;

	if (!fileSubstring) {
		ns.tprintf("FAILED: Requires part of or full file name as argument.");
		return;
	}

	const files = findFiles(ns, fileSubstring);

	const lines = files.length == 0 ? ["No files found."] : files.map(o => `[${o.hostname}] : ${o.file}`);
	tprintLines(ns, 0, ...lines, "", `Found ${files.length} files.`);
}

/** 
 * Finds all files by provided file name part on all servers.
 * 
 * @param {NS} ns 
 * @param {string} fileSubstring Part of filename.
 * @returns {Object[]} List of found files throughtout whole network.
*/
function findFiles(ns, fileSubstring) {
	return getAllServers(ns).flatMap(s => ns.ls(s, fileSubstring).map(f => ({ hostname: s, file: f })));
}