import { MINING_MANAGER_PORT } from "scripts/utils/constants";
import { getMiningTarget, getUnlockedServers } from "scripts/storage";
import { formatRAM, openExistingIfAlreadyRunning, tprintLines, restartCurrentScript } from "scripts/utils/utils";

const HOME_SERVER_RAM_RESERVE = 200;
const MINER_SCRIPT = "/scripts/remote/miner.js";
var MINER_SCRIPT_RAM_USAGE;
var MINING_TARGET;

export function autocomplete(data, args) {
	return [...data.servers, "restart"];
}

// TODO: Save log, have log argument to see what happened.

/**
 * Deploys miner script to all available servers ensuring full RAM use.
 *
 * At start ensures that `MINER_SCRIPT` is running on all unlocked servers optimally(same script, same target, all RAM in use),
 * if needed kills and restarts scripts.
 * Then runs in background waiting for notifications about changes and ensures that all RAM is in use by `MINER_SCRIPT`.
 *
 * @param {NS} ns
 **/
export async function main(ns) {
	let [argument] = ns.args;
	if (argument && argument === "restart") {
		try {
			restartCurrentScript(ns);
		} catch (error) {
			ns.tprintf(error);
		}
		return;
	}
	openExistingIfAlreadyRunning(ns);

	ns.disableLog("sleep");
	MINER_SCRIPT_RAM_USAGE = ns.getScriptRam(MINER_SCRIPT);

	if (!argument) argument = getMiningTarget(ns);
	if (!argument) {
		ns.tprintf("FAILED: Failed to get target server nor was it provided.");
		return;
	}
	MINING_TARGET = argument;

	const availableServers = getUnlockedServers(ns).filter((s) => ns.getServerMaxRam(s) > 0);
	for (const server of availableServers) {
		if (!isMinerScriptRunningOptimally(ns, server)) deployAndStartMiningScript(ns, server);
	}

	tprintLines(ns,
		`Mining manager starting(target: [${MINING_TARGET}])...`,
		`Using: ${MINER_SCRIPT} (${formatRAM(MINER_SCRIPT_RAM_USAGE, 2)}).`,
		`Found ${availableServers.length} servers.`,
		`Mining manager successfully started.`
	);

	ns.clearPort(MINING_MANAGER_PORT);
	while (true) {
		const server = ns.readPort(MINING_MANAGER_PORT);
		if (server != "NULL PORT DATA") {
			if (ns.getServerMaxRam(server) == 0) continue;
			if (isMinerScriptRunningOptimally(ns, server)) continue;

			deployAndStartMiningScript(ns, server);
		}

		await ns.sleep(200);
	}
}

/** @param {NS} ns */
function deployAndStartMiningScript(ns, server) {
	const killedAllInstancesOfMinerScript = findAllRunningScriptInstances(ns, MINER_SCRIPT, server).every((p) => ns.kill(p.pid));
	if (!killedAllInstancesOfMinerScript) {
		ns.printf(`FAILED: Failed to kill script on [${server}] server.`); // LOG
		return;
	}

	if (server != "home" && !ns.scp(MINER_SCRIPT, server)) {
		ns.printf(`FAILED: Failed to deploy script to [${server}] server.`); // LOG
		return;
	}
	
	const serverMaxRam = getServerMaxRam(ns, server);
	const threadsCount = Math.floor(serverMaxRam / MINER_SCRIPT_RAM_USAGE);

	if (threadsCount == 0) return;

	if (!ns.exec(MINER_SCRIPT, server, threadsCount, MINING_TARGET)) {
		ns.printf(`FAILED: Failed to start script on [${server}] server.`); // LOG
		return;
	}
	ns.printf(`Successfully deployed and started mining script on [${server}] server.`); // LOG
}

/** @param {NS} ns */
function isMinerScriptRunningOptimally(ns, server) {
	return ns.getRunningScript(MINER_SCRIPT, server, MINING_TARGET)
		&& getServerMaxRam(ns, server) - ns.getServerUsedRam(server) < MINER_SCRIPT_RAM_USAGE;
}

function getServerMaxRam(ns, server) {
	return server == "home" ? Math.max(ns.getServerMaxRam(server) - HOME_SERVER_RAM_RESERVE, 0) : ns.getServerMaxRam(server);
}

/** 
 * @param {NS} ns 
 * @param {string} scriptName 
 * @param {string} hostname 
 * @returns {ProcessInfo[]}
 * */
function findAllRunningScriptInstances(ns, scriptName, hostname) {
	scriptName = scriptName.slice(1); // Removes leading '/'
	return ns.ps(hostname).filter((p) => p.filename.includes(scriptName));
}

/**
 * Notifies manager about server changes.
 *
 * @param {NS} ns Netscript instance.
 * @param {string} hostname Server that was added or modified.
 * @returns {boolean} TRUE - success, otherwise FALSE.
 */
export function notifyServerAddedOrModified(ns, hostname) {
	return ns.writePort(MINING_MANAGER_PORT, hostname) === null;
}