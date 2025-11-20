import { getUnlockedServers, saveMiningTarget, getMiningTarget } from "scripts/storage";
import { tprintLines } from "scripts/utils/utils";


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");

	const myHackingLevel = ns.getHackingLevel();
	const hostnames = getUnlockedServers(ns).filter(s => s != "home");
	const savedMiningTarget = getMiningTarget(ns);

	let potentialServers = [];
	for (let hostname of hostnames) {
		let serverInfo = getInfo(ns, hostname);
		if (serverInfo.maximumMoney > 0 && (myHackingLevel / serverInfo.requiredHackingLevel) >= 2) {
			potentialServers.push(serverInfo);
		} else if (myHackingLevel == 1 && serverInfo.requiredHackingLevel == 1) {
			potentialServers.push(serverInfo);
		}
	}

	const bestServer = potentialServers.reduce((prev, current) => (+prev.maximumMoney > +current.maximumMoney) ? prev : current)

	const status = [`Best mining target: ${bestServer.hostname}`];
	if(!savedMiningTarget || savedMiningTarget != bestServer.hostname){
		saveMiningTarget(ns, bestServer.hostname);
		status.push(`New target saved.`);
	}

	tprintLines(ns, ...status);
}

/** 
 * @param {NS} ns 
 * @param {string} hostname 
*/
function getInfo(ns, hostname) {
	let hachingLevel = ns.getServerRequiredHackingLevel(hostname);
	let maximumMoney = ns.getServerMaxMoney(hostname);

	return { hostname: hostname, requiredHackingLevel: hachingLevel, maximumMoney: maximumMoney };
}