import { tprintLines } from "scripts/utils";
import { findPathToHome } from "scripts/find-path-to-server";
import { PORT_OPENING_PROGRAMS } from "scripts/constants";

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

	tprintLines(ns, 0, ...commands);
}

/** @param {NS} ns */
function getBackdoorCommands(ns) {
	return ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"].map((target) => {
		const connectCommands = findPathToHome(ns, target).reverse().filter((s) => s != "home").map((s) => `connect ${s};`).join("");
		const portOpeningCommands = PORT_OPENING_PROGRAMS.slice(0, ns.getServerNumPortsRequired(target)).map((p) => `run ${p};`).join("");
		return `[${target}]: ${connectCommands}${portOpeningCommands}run NUKE.exe;backdoor;`;
	});
}