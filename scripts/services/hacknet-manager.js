import { getSpendableAmount } from "scripts/bank";
import { getCurrentTimeInFormat, controlService } from "scripts/utils/common";
import { NONE, SERVICE_COMMANDS } from "scripts/utils/constants";

const MAX_HACKNET_LEVEL = 200;
const MAX_HACKNET_RAM = 7;
const MAX_HACKNET_CORES_COUNT = 16;

export function autocomplete(data, args) {
	return SERVICE_COMMANDS;
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	const [command] = ns.args;

	await controlService(ns, "Hacknet manager", command, async () => await run(ns));
}

/** @param {NS} ns */
async function run(ns) {
	while (true) {
		var message = upgradeHacknet(ns);
		ns.printf(`[${getCurrentTimeInFormat()}] ${message}`);
		await ns.sleep(2000);
	}
}

/** @param {NS} ns */
function upgradeHacknet(ns) {
	var message = NONE;

	if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
		if (getSpendableAmount(ns) > ns.hacknet.getPurchaseNodeCost()) {
			return ns.hacknet.purchaseNode() >= 0 ? "Purchased node." : "Failed to purchase node(error).";
		} else message = "Failed to purchase node(not enough money).";
	} 

	const lowestLevelIndex = [...Array(ns.hacknet.numNodes()).keys()].reduce((a, b) => ns.hacknet.getNodeStats(b).level < ns.hacknet.getNodeStats(a).level ? b : a);
	if (ns.hacknet.getNodeStats(lowestLevelIndex).level < MAX_HACKNET_LEVEL) {
		if (getSpendableAmount(ns) > ns.hacknet.getLevelUpgradeCost(lowestLevelIndex)) {
			return ns.hacknet.upgradeLevel(lowestLevelIndex) ? "Upgraded level." : "Failed to upgrade level(error).";
		} else message = "Failed to upgrade level(not enough money).";
	}

	const lowestRAMIndex = [...Array(ns.hacknet.numNodes()).keys()].reduce((a, b) => ns.hacknet.getNodeStats(b).ram < ns.hacknet.getNodeStats(a).ram ? b : a);
	if (ns.hacknet.getNodeStats(lowestRAMIndex).ram < MAX_HACKNET_RAM) {
		if (getSpendableAmount(ns) > ns.hacknet.getRamUpgradeCost(lowestRAMIndex)) {
			return ns.hacknet.upgradeRam(lowestRAMIndex) ? "Upgraded RAM." : "Failed to upgrade RAM(error).";
		} else message = "Failed to upgrade RAM(not enough money).";
	}

	const lowestCoresCountIndex = [...Array(ns.hacknet.numNodes()).keys()].reduce((a, b) => ns.hacknet.getNodeStats(b).cores < ns.hacknet.getNodeStats(a).cores ? b : a);
	if (ns.hacknet.getNodeStats(lowestCoresCountIndex).cores < MAX_HACKNET_CORES_COUNT) {
		if (getSpendableAmount(ns) > ns.hacknet.getCoreUpgradeCost(lowestCoresCountIndex)) {
			return ns.hacknet.upgradeCore(lowestCoresCountIndex) ? "Upgraded cores." : "Failed to upgrade cores(error).";
		} else message = "Failed to upgrade cores(not enough money).";
	}

	return message;
}