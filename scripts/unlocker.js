import { getLockedServers, saveLockedServers, getUnlockedServers, saveUnlockedServers } from "scripts/storage";
import { tprintLines, retry } from "scripts/utils";
import { PORT_OPENING_PROGRAMS } from "scripts/utils/constants";
import { notifyServerAddedOrModified } from "scripts/simple-mining-manager";

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
		unlockedServers.forEach((s) => retry(ns, 500, 6, () => notifyServerAddedOrModified(ns, s)));

		tprintLines(ns, unlockFilesDisplay, `${unlockedServers.length} out of ${lockedServers.length} were unlocked.`);
	} else {
		const success = unlock(ns, target);
		tprintLines(ns, unlockFilesDisplay, `Target: [${target}]`, success ? "Successfully unlocked." : "Failed to gain access.");
		if (success) await retry(ns, 500, 6, () => notifyServerAddedOrModified(ns, target));
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