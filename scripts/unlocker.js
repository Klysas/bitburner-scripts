import { getLockedServers, saveLockedServers, getUnlockedServers, saveUnlockedServers } from "scripts/storage";
import { tprintLines } from "scripts/utils";
import { PORT_OPENING_PROGRAMS } from "scripts/constants";

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

	if (!ns.serverExists(target) && target != "locked") {
		ns.tprintf("FAILED: Target doesn't exist.");
		return;
	}

	const availableProgramsCount = getAvailablePrograms(ns).length;
	const unlockFilesDisplay = "[X]".repeat(availableProgramsCount) + "[ ]".repeat(5 - availableProgramsCount);

	if (target == "locked") {
		const lockedServers = getLockedServers(ns);
		const unlockedServers = lockedServers.filter((s) => unlock(ns, s));
		saveLockedServers(ns, lockedServers.filter((s) => !unlockedServers.includes(s)));
		saveUnlockedServers(ns, [...new Set(getUnlockedServers(ns).concat(unlockedServers))]);

		tprintLines(ns, unlockFilesDisplay, `${unlockedServers.length} out of ${lockedServers.length} were unlocked.`);
	} else {
		tprintLines(ns, unlockFilesDisplay, `Target: [${target}]`, unlock(ns, target) ? "Successfully unlocked." : "Failed to gain access.");
	}
}

/** 
 * @param {NS} ns Netscript instance.
 * @param {string} server Server to be unlocked.
 * @returns {boolean} TRUE if root access was gained, otherwise FALSE. 
*/
function unlock(ns, server) {
	try { ns.brutessh(server); } catch { }
	try { ns.ftpcrack(server); } catch { }
	try { ns.relaysmtp(server); } catch { }
	try { ns.httpworm(server); } catch { }
	try { ns.sqlinject(server); } catch { }
	try { ns.nuke(server); } catch { }

	return ns.hasRootAccess(server);
}

/** @param {NS} ns */
function getAvailablePrograms(ns) {
	return PORT_OPENING_PROGRAMS.filter(p => ns.fileExists(p));
}