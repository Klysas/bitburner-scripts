import { injectCommand } from "scripts/utils/common";
import { tprintLines } from "scripts/utils/printing";
import { exitOnInvalidCommand } from "scripts/utils/validations";

const COMMANDS = ["add", "clear", "list"];
const ALIASES = [
	// CORE TOOLS
	"alias startup='run /scripts/startup.js'",
	"alias bank='run /scripts/bank.js'",
	"alias status='run /scripts/status.js --ram-override 2.5'", // --ram-override 2.5

	// SPECIAL TOOLS
	"alias solver='run /scripts/contracts-solver.js'",
	"alias gang='run /scripts/gang.js'",
	"alias augmentations='run /scripts/augmentations-manager.js'",

	// COMMON TOOLS
	"alias unlock='run /scripts/unlocker.js'",
	"alias find-path='run /scripts/find-path-to-server.js'",
	"alias find-files='run /scripts/find-files.js'",
	"alias find-best-target='run scripts/find-best-target.js'",
	"alias find-servers='run /scripts/find-servers.js'",
	"alias get-commands='run /scripts/get-commands.js'",
	"alias buy-all='buy BruteSSH.exe; buy FTPCrack.exe; buy relaySMTP.exe; buy HTTPWorm.exe; buy SQLInject.exe; buy ServerProfiler.exe; buy DeepscanV1.exe; buy DeepscanV2.exe; buy AutoLink.exe; buy Formulas.exe'",

	// SERVICES
	"alias mining-manager='run /scripts/advanced-mining-manager.js'",
	"alias hacknet-manager='run /scripts/services/hacknet-manager.js'",
	"alias sleeves-manager='run /scripts/services/sleeves-manager.js'",
	"alias purchase-servers='run /scripts/hw/purchase-servers.js'",
	"alias upgrade-servers='run /scripts/hw/upgrade-purchased-servers.js'",
];

export function autocomplete(data, args) {
	return COMMANDS;
}

/** @param {NS} ns */
export async function main(ns) {
	const [command] = ns.args;

	exitOnInvalidCommand(ns, command, COMMANDS);

	switch (command) {
		case "add": {
			for (const alias of ALIASES) {
				injectCommand(alias);
				await ns.sleep(100);
			}
			break;
		}
		case "clear": {
			injectCommand("unalias --all");
			break;
		}
		case "list": {
			tprintLines(ns, "All aliases:", ...ALIASES);
			break;
		}
		default:
			ns.tprintf(`FAILED: Command not implemented.`);
			return;
	}
}