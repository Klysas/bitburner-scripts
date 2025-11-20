import { tprintLines } from "scripts/utils/printing";
import { findAllServers } from "scripts/find-servers";

export function autocomplete(data, args) {
	return [".js", ".txt", ".cct", ".msg", ".lit", ".exe", ...data.servers];
}

/** @param {NS} ns */
export async function main(ns) {
	const [fileSubstring, server] = ns.args;

	if (!fileSubstring) {
		ns.tprintf("FAILED: Requires part of or full file name as argument.");
		return;
	}

	if (server && !ns.serverExists(server)) {
		ns.tprintf("FAILED: Provided server doesn't exist.");
		return;
	}

	let files = findFiles(ns, fileSubstring);
	if (server) files = files.filter((f) => f.hostname == server);

	const lines = files.length == 0 ? ["No files found."] : files.map(o => `[${o.hostname}] : ${o.file}`);
	tprintLines(ns, 0, ...lines, "", `Found ${files.length} files${server ? ` on [${server}]` : ""}.`);
}

/** 
 * Finds all files by provided file name part on all servers.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} fileSubstring Part of filename.
 * @returns {Array<{hostname: string, file: string}>} List of found files throughtout whole network.
*/
export function findFiles(ns, fileSubstring) {
	return findAllServers(ns).flatMap(s => ns.ls(s, fileSubstring).map(f => ({ hostname: s, file: f })));
}