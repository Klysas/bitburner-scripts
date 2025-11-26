import { getSpendableAmount } from "scripts/bank";
import { getCurrentTimeInFormat, controlService } from "scripts/utils/common";
import { SERVICE_COMMANDS } from "scripts/utils/constants";

const TRAVEL_COST = 200000;

export function autocomplete(data, args) {
	return SERVICE_COMMANDS;
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	const [command] = ns.args;

	await controlService(ns, "Sleeves manager", command, async () => await run(ns));
}

/** @param {NS} ns */
async function run(ns) {
	while (true) {
		await ns.sleep(10000);

		const currentTask = ns.singularity.getCurrentWork();
		if (!currentTask) {
			printLog(ns, "Player is idle. Skipping.");
			continue;
		}

		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			if (ns.sleeve.getSleeve(i).city != ns.getPlayer().city) {
				if (getSpendableAmount(ns) > TRAVEL_COST && ns.sleeve.travel(i, ns.getPlayer().city)) {
					printLog(ns, `'${i}' sleeve moved to ${ns.getPlayer().city}.`);
				} else {
					printLog(ns, `'${i}' sleeve failed to move to ${ns.getPlayer().city}.`);
					continue;
				}
			}

			switch (currentTask.type) {
				case "CRIME": {
					if (ns.sleeve.getTask(i).type != currentTask.type || ns.sleeve.getTask(i).crimeType != currentTask.crimeType) {
						const message = ns.sleeve.setToCommitCrime(i, currentTask.crimeType)
							? `Started commiting ${currentTask.crimeType}.`
							: `Failed in ${currentTask.crimeType} crime.`;
						printLog(ns, message);
					}
					break;
				}
				case "FACTION": {
					if (ns.sleeve.getTask(i).type != currentTask.type 
						|| ns.sleeve.getTask(i).factionName != currentTask.factionName 
						|| ns.sleeve.getTask(i).factionWorkType != currentTask.factionWorkType) {
						const message = ns.sleeve.setToFactionWork(i, currentTask.factionName, currentTask.factionWorkType)
							? `Started ${currentTask.factionWorkType} work for '${currentTask.factionName}' faction.`
							: `Failed in ${currentTask.factionWorkType} work for '${currentTask.factionName}' faction.`;
						printLog(ns, message);
					}
					break;
				}
				case "COMPANY": {
					if (ns.sleeve.getTask(i).type != currentTask.type || ns.sleeve.getTask(i).companyName != currentTask.companyName) {
						const message = ns.sleeve.setToCompanyWork(i, currentTask.companyName)
							? `Started work for '${currentTask.companyName}' company.`
							: `Failed to work for '${currentTask.companyName}' company.`;
						printLog(ns, message);
					}
					break;
				}
				case "CLASS": {
					if (ns.sleeve.getTask(i).type != currentTask.type 
						|| ns.sleeve.getTask(i).location != currentTask.location 
						|| ns.sleeve.getTask(i).classType != currentTask.classType) {
						if(Object.values(ns.enums.GymType).includes(currentTask.classType))
							var message = ns.sleeve.setToGymWorkout(i, currentTask.location, currentTask.classType)
								? `Started '${currentTask.classType}' workout in '${currentTask.location}'.`
								: `Failed '${currentTask.classType}' workout in '${currentTask.location}'.`;
						else
							var message = ns.sleeve.setToUniversityCourse(i, currentTask.location, currentTask.classType)
								? `Started studying '${currentTask.classType}' in '${currentTask.location}'.`
								: `Failed to study '${currentTask.classType}' in '${currentTask.location}'.`;
						printLog(ns, message);
					}
					break;
				}
				default:
					printLog(ns, `FAILED: '${currentTask.type}' not implemented.`);
			}
		}
	}
}

/** @param {NS} ns */
function printLog(ns, message) {
	ns.printf(`[${getCurrentTimeInFormat()}] ${message}`);
}