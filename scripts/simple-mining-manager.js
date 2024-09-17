import { MINING_MANAGER_PORT } from "scripts/constants";
import { getMiningTarget, getUnlockedServers } from "scripts/storage";
import { formatRAM, tprintSeparator, openExistingIfAlreadyRunning } from "scripts/utils";

const MINER_SCRIPT = "/scripts/remote/miner.js";
// const MINER_SCRIPT_RAM_USAGE;

export function autocomplete(data, args) {
	return [...data.servers];
}

// Have global script variables, so other instance can print report.
// Also make sure that other instance can't start managing.
// Save log, have log argument to see what happened.



/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	let [miningTarget] = ns.args;

	

	if (!miningTarget) miningTarget = getMiningTarget(ns);
	if (!miningTarget) {
		ns.tprintf("FAILED: Failed to get Target nor was it provided.");
		return;
	}

	const availableServers = getUnlockedServers(ns); // TODO: maybe it should get it from find-servers.js script.
	if (!availableServers || availableServers.length == 0 || !availableServers[0]) {
		ns.tprintf("FAILED: No servers available.");
		return;
	}

	openExistingIfAlreadyRunning(ns);

	// INITIALIZATION

	const scriptRamUsage = ns.getScriptRam(MINER_SCRIPT);

	tprintSeparator(ns, "=");
	ns.tprintf(`Mining manager starting(target: [${miningTarget}])...`);
	ns.tprintf(`Using: ${MINER_SCRIPT} (${formatRAM(scriptRamUsage, 2)}).`);
	ns.tprintf(`Found ${availableServers.length} servers.`);

	for (const server of availableServers) {
		if (server == "home") continue; // TODO: implement. Also specify how much RAM of "home" it can manage.

		if (ns.getServerMaxRam(server) == 0) continue;
		if (isRunningOptimally(ns, MINER_SCRIPT, server, miningTarget)) continue;

		deployAndStart(ns, MINER_SCRIPT, server, miningTarget);
	}

	ns.tprintf(`Mining manager successfully started.`);
	tprintSeparator(ns, "=");

	// INFINITE LOOP

	ns.clearPort(MINING_MANAGER_PORT);
	while (true) {
		const server = ns.readPort(MINING_MANAGER_PORT);

		if (server != "NULL PORT DATA") {

			if (ns.getServerMaxRam(server) == 0) continue;
			if (isRunningOptimally(ns, MINER_SCRIPT, server, miningTarget)) continue;

			deployAndStart(ns, MINER_SCRIPT, server, miningTarget);
		}

		await ns.sleep(200);
	}
}

/** @param {NS} ns */
function deployAndStart(ns, script, server, miningTarget) {
	ns.killall(server); // TODO: check if success.
	ns.scp(script, server); // TODO: check if success.
	const threadsCount = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam(script));
	if (threadsCount == 0) return;
	ns.exec(script, server, threadsCount, miningTarget); // TODO: check if success.
}

/** @param {NS} ns */
function isRunningOptimally(ns, script, server, miningTarget) {
	return ns.scriptRunning(script, server)
		&& ns.getRunningScript(script, server, miningTarget)
		&& (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) < ns.getScriptRam(script));
}

/** 
 * Notifies manager about server changes/modifications.
 * 
 * @param {NS} ns 
 * @param {string} hostname Server that was added or modified. 
 * @returns {boolean} TRUE - success, otherwise FALSE.
*/
export function notifyServerAddedOrModified(ns, hostname) {
	return ns.writePort(MINING_MANAGER_PORT, hostname) === null;
}