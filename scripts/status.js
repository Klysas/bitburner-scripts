import { formatRAM } from "scripts/utils";
import { PrintTable, DefaultStyle, ColorPrint, pctColor } from "scripts/tables";
import { findAllServers } from "scripts/find-servers";

const COMMANDS = {
	servers: ["all", "purchased"],
};

export function autocomplete(data, args) {
	return [...Object.keys(COMMANDS), ...COMMANDS.servers];
}

/** @param {NS} ns */
export async function main(ns) {
	const [command, argument] = ns.args;

	if (command === undefined) {
		ns.tprintf("FAILED: Command is required. Commands: " + Object.keys(COMMANDS));
		return;
	}

	if (!Object.keys(COMMANDS).includes(command)) {
		ns.tprintf("FAILED: Correct command is required! Commands: " + Object.keys(COMMANDS));
		return;
	}

	switch (command) {
		case "servers": printServersReport(ns, argument); break;
		default:
			ns.tprintf("FAILED: Not implemented.");
	}
}

/** @param {NS} ns */
function printServersReport(ns, serversGroup) {
	if (!COMMANDS.servers.includes(serversGroup)) {
		serversGroup = undefined;
		// TODO: print warning.
	}

	const hostnames = serversGroup == "purchased" ? ns.getPurchasedServers() : findAllServers(ns);
	const servers = hostnames
		.map((s) => getServerInfo(ns, s))
		.filter((s) => (serversGroup == "all" ? true : s.maxRam != 0))
		.sort((a, b) => b.maxRam - a.maxRam)
		.map((i) => {
			const usage = !i.maxRam ? 0 : i.ramUsage / i.maxRam;
			return [i.hostname, i.rootAccess, formatRAM(i.maxRam), { color: pctColor(usage), text: ns.formatPercent(usage, 0) }];
		});
	const columns = [
		{ header: "Server", width: Math.max(hostnames.reduce((max, h) => Math.max(max, h.length ?? 0), 0), "Server".length) },
		{ header: "Root access", width: 11 },
		{ header: "Ram", width: 7 },
		{ header: "Usage", width: 7 },
	];
	PrintTable(ns, servers, columns, DefaultStyle(), ColorPrint);
}

/** @param {NS} ns */
function getServerInfo(ns, hostname) {
	return {
		hostname: hostname,
		rootAccess: ns.hasRootAccess(hostname),
		maxRam: ns.getServerMaxRam(hostname),
		ramUsage: ns.getServerUsedRam(hostname),
	};
}