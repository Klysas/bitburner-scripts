// import { getLockedServers, saveLockedServers, getUnlockedServers, saveUnlockedServers } from "scripts/storage";
import { tprintLines } from "scripts/utils";

export function autocomplete(data, args) {
	return [...data.servers, "locked"];
}

/** @param {NS} ns */
export async function main(ns) {
	const [target] = ns.args;

	if (!target) {
		ns.tprintf("FAILED: Target is required as argument.");
		return;
	}

	if (!ns.serverExists(target)) {
		ns.tprintf("FAILED: Target doesn't exist.");
		return;
	}

	if (target == "locked") {
		// TODO: implement mass unlocking of "locked" servers.
		ns.tprintf("FAILED: Not implemented yet.");
		return;
	}

	const unlocked = unlock(ns, target);

	// TODO: add backdoor.

	const availableProgramsCount = getAvailablePrograms(ns).length;
	const unlockFilesDisplay = "[X]".repeat(availableProgramsCount) + "[ ]".repeat(5 - availableProgramsCount);
	tprintLines(ns, unlockFilesDisplay, `Target: [${target}]`, unlocked ? "Successfully unlocked." : "Failed to gain access");
}

/** 
 * @param {NS} ns 
 * @param {string} target 
 * @returns {boolean} TRUE if root access was gained, otherwise FALSE. 
*/
function unlock(ns, target) {
	try { ns.brutessh(target); } catch { }
	try { ns.ftpcrack(target); } catch { }
	try { ns.relaysmtp(target); } catch { }
	try { ns.httpworm(target); } catch { }
	try { ns.sqlinject(target); } catch { }
	try { ns.nuke(target); } catch { }

	return ns.hasRootAccess(target);
}

/** @param {NS} ns */
function getAvailablePrograms(ns) {
	return ["SQLInject.exe", "HTTPWorm.exe", "relaySMTP.exe", "FTPCrack.exe", "BruteSSH.exe"].filter(p => ns.fileExists(p));
}