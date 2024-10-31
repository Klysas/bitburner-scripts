import { saveAvailableServers, getAvailableServers, saveUnlockedServers, getUnlockedServers, 
		saveLockedServers, getLockedServers, savePurchasedServers, getPurchasedServers } from "scripts/storage";
import { tprintLines } from "scripts/utils";
import { exitOnInvalidCommand } from "scripts/utils/validations";

const COMMANDS = ["all", "purchased", "unlocked", "locked", "refresh"];

export function autocomplete(data, args) {
	return [...COMMANDS];
}

/** 
 * Finds specified servers and saves data to storage.
 * 
 * Commands:
 *   all        - all available servers on network(including purchased and "home").
 *   purchased  - only purchased servers.
 *   unlocked   - all servers with root access.
 *   locked     - all servers without root access.
 *   refresh    - updates all lists.
 * 
 * @param {NS} ns 
 */
export async function main(ns) {
	const [command] = ns.args;

	if (!command) {
		printReport(ns);
		return;
	}

	exitOnInvalidCommand(ns, command, COMMANDS);

	let statuses = [];

	if (["all", "refresh"].includes(command)) {
		const savedAvailableServersCount = getAvailableServers(ns).length;
		const availableServers = findAllServers(ns);
		saveAvailableServers(ns, availableServers);
		statuses.push(`Available: ${availableServers.length} ${formatChange(availableServers.length - savedAvailableServersCount)}`);
	}

	if (["purchased", "refresh"].includes(command)) {
		const savedPurchasedServersCount = getPurchasedServers(ns).length;
		const purchasedServers = ns.getPurchasedServers();
		savePurchasedServers(ns, purchasedServers);
		statuses.push(`Purchased: ${purchasedServers.length} ${formatChange(purchasedServers.length - savedPurchasedServersCount)}`);
	}

	if (["unlocked", "refresh"].includes(command)) {
		const savedUnlockedServersCount = getUnlockedServers(ns).length;
		const unlockedServers = findAllServers(ns).filter((s) => ns.hasRootAccess(s));
		saveUnlockedServers(ns, unlockedServers);
		statuses.push(`Unlocked:  ${unlockedServers.length} ${formatChange(unlockedServers.length - savedUnlockedServersCount)}`);
	}

	if (["locked", "refresh"].includes(command)) {
		const savedlockedServersCount = getLockedServers(ns).length;
		const lockedServers = findAllServers(ns).filter((s) => !ns.hasRootAccess(s));
		saveLockedServers(ns, lockedServers);
		statuses.push(`Locked:    ${lockedServers.length} ${formatChange(lockedServers.length - savedlockedServersCount)}`);
	}

	if (command == "refresh") statuses.push("\nRefreshed and saved.");

	tprintLines(ns, ...statuses);
}

/** @param {NS} ns */
function printReport(ns) {
	tprintLines(ns,
		`Available: ${getAvailableServers(ns).length}`,
		`Purchased: ${getPurchasedServers(ns).length}`,
		`Unlocked:  ${getUnlockedServers(ns).length}`,
		`Locked:    ${getLockedServers(ns).length}`);
}

function formatChange(change) {
	if (change == 0) return "";
	return `(${change > 0 ? "+" : "-"}${Math.abs(change)})`;
}

/** 
 * Scans throught network and finds all servers.
 * 
 * @param {NS} ns Netscript instance.
 * @returns {string[]} All servers found.
 */
export function findAllServers(ns) {
	let set = new Set(["home"]);
	return set.forEach((h) => ns.scan(h).forEach((o) => set.add(o))) || [...set.values()];
}