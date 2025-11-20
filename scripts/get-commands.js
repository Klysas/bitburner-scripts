import { tprintLines, colorWarning } from "scripts/utils/utils";
import { findPathToHome } from "scripts/find-path-to-server";
import { PORT_OPENING_PROGRAMS } from "scripts/utils/constants";

const GROUPS = ["backdoor"];

export function autocomplete(data, args) {
	return [...GROUPS];
}

/** @param {NS} ns */
export async function main(ns) {
	const [group] = ns.args;

	if (!group) {
		ns.tprintf("FAILED: Group is required. Groups: " + GROUPS);
		return;
	}

	let commands = [];

	switch (group) {
		case "backdoor": commands = getBackdoorCommands(ns); break;
		default:
			ns.tprintf("FAILED: Group not implemented.");
			return;
	}

	tprintLines(ns, 200, ...commands);
}

/** @param {NS} ns */
function getBackdoorCommands(ns) {
	return ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "w0r1d_d43m0n"].map((target) => {
		if (!ns.serverExists(target)) return `[${target}]: NOT FOUND.`;
		const connectCommands = findPathToHome(ns, target).reverse().filter((s) => s != "home").map((s) => `connect ${s};`).join("");
		const portOpeningCommands = PORT_OPENING_PROGRAMS.slice(0, ns.getServerNumPortsRequired(target)).map((p) => `run ${p};`).join("");
		const backdoorInstalled = ns.getServer(target).backdoorInstalled;
		const hasSufficientHackingLevel = ns.getServerRequiredHackingLevel(target) <= ns.getPlayer().skills.hacking;
		let output = `[${target}]${backdoorInstalled ? "(DONE)" : (!hasSufficientHackingLevel ? "(NOT YET)" : "")}: connect home;${connectCommands}${portOpeningCommands}run NUKE.exe;backdoor;`;
		return !backdoorInstalled && hasSufficientHackingLevel ? colorWarning(output) : output;
	});
}