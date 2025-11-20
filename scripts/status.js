import { formatMoney, formatRAM, getKeyByValue } from "scripts/utils/utils";
import { PrintTable, DefaultStyle, ColorPrint, pctColor } from "scripts/utils/tables";
import { getUnlockedServers, getAvailableServers, getPurchasedServers } from "scripts/storage";
import { exitOnInvalidCommand } from "scripts/utils/validations";
import { NONE } from "scripts/utils/constants";

const MINING_REMOTE_SCRIPTS = {
	MINE: "scripts/remote/miner.js",
	HACK: "scripts/remote/hack.js",
	GROW: "scripts/remote/grow.js",
	WEAKEN: "scripts/remote/weaken.js",
};

const COMMANDS = {
	servers: ["all", "purchased"],
	targets: ["all"],
};

export function autocomplete(data, args) {
	return [...Object.keys(COMMANDS), ...COMMANDS.servers];
}

/** @param {NS} ns */
export async function main(ns) {
	const [command, argument] = ns.args;

	exitOnInvalidCommand(ns, command, Object.keys(COMMANDS));

	switch (command) {
		case "servers": printServersReport(ns, argument); break;
		case "targets": printTargetsReport(ns, argument); break;
		default:
			ns.tprintf("FAILED: Not implemented.");
	}
}

//========================================================
//	PRINTING REPORTS
//========================================================

/** @param {NS} ns */
function printServersReport(ns, serversGroup) {
	if (!COMMANDS.servers.includes(serversGroup)) {
		serversGroup = undefined;
		// TODO: print warning.
	}

	const hostnames = serversGroup == "purchased" ? getPurchasedServers(ns) : getAvailableServers(ns);
	const servers = hostnames
		.map((s) => getServerInfo(ns, s))
		.filter((s) => (serversGroup == "all" ? true : s.maxRam != 0))
		.sort((a, b) => b.maxRam - a.maxRam);
	const columns = [
		{ header: "Server", width: 18 },
		{ header: "Root access", width: 11, pad: 0 },
		{ header: "Ram", width: 7, pad: 1 },
		{ header: "Usage", width: 7, pad: 1 },
		{ header: "Targets", width: Math.max(18, Math.max(...servers.map(s => s.miningTargets?.length || 0))), pad: 0 },
		{ header: "Scripts", width: Math.max(18, Math.max(...servers.map(s => s.miningScripts?.length || 0))), pad: 0 },
	];
	PrintTable(
		ns,
		servers.map((i) => {
			const usage = !i.maxRam ? 0 : i.ramUsage / i.maxRam;
			return [
				i.hostname,
				i.rootAccess,
				formatRAM(i.maxRam),
				{ color: pctColor(usage), text: ns.formatPercent(usage, 0) },
				i.miningTargets,
				i.miningScripts,
			];
		}),
		columns,
		DefaultStyle(),
		ColorPrint
	);
}

/** @param {NS} ns */
function printTargetsReport(ns, serversGroup) {
	if (!COMMANDS.servers.includes(serversGroup)) {
		serversGroup = undefined;
		// TODO: print warning.
	}

	const myHackingLevel = ns.getHackingLevel();
	const targetServers = getUnlockedServers(ns)
		.map((h) => getTargetInfo(ns, h))
		.filter((s) => s.maxMoney > 0 && (serversGroup === "all" || s.requiredHackingLevel < myHackingLevel))
		.sort((a, b) => b.maxMoney - a.maxMoney);
	const columns = [
		{ header: "Server", width: 18 },
		{ header: "Max money", width: 11, pad: 0 },
		{ header: "Current money", width: 15, pad: 0 },
		{ header: "Min security", width: 14, pad: 0 },
		{ header: "Current security", width: 18, pad: 0 },
		{ header: `Required hacking level(${myHackingLevel})`, width: (24 + myHackingLevel.toString().length), pad: 0 },
		{ header: "Tasks", width: 15, pad: 0 },
		{ header: "Threads", width: 15, pad: 0 },
	];
	PrintTable(
		ns,
		targetServers.map((s) => [
			s.hostname,
			formatMoney(s.maxMoney),
			{ color: pctColor(s.currentMoney / s.maxMoney), text: formatMoney(s.currentMoney) },
			s.minSecurity,
			{ color: pctColor(1 - s.currentSecurity / 100), text: ns.formatNumber(s.currentSecurity, 0) },
			{
				color: pctColor(s.requiredHackingLevel > myHackingLevel ? 0 : myHackingLevel / 2 / s.requiredHackingLevel),
				text: s.requiredHackingLevel,
			},
			s.task,
			s.threads,
		]),
		columns,
		DefaultStyle(),
		ColorPrint
	);
}

//========================================================
//	INFO
//========================================================

/** @param {NS} ns */
function getServerInfo(ns, hostname) {
	return {
		hostname: hostname,
		rootAccess: ns.hasRootAccess(hostname),
		maxRam: ns.getServerMaxRam(hostname),
		ramUsage: ns.getServerUsedRam(hostname),
		miningTargets: [...new Set(ns
			.ps(hostname)
			.filter((p) => Object.values(MINING_REMOTE_SCRIPTS).includes(p.filename))
			.map((p) => p.args[0]))].join() || NONE,
		miningScripts: [...new Set(ns
			.ps(hostname)
			.filter((p) => Object.values(MINING_REMOTE_SCRIPTS).includes(p.filename))
			.map((p) => getKeyByValue(MINING_REMOTE_SCRIPTS, p.filename)))].join() || NONE,
	};
}

/** @param {NS} ns */
export function getTargetInfo(ns, hostname) {
	const targetProcesses = [];
	for (const deployableServerHostname of getUnlockedServers(ns)) {
		let miningProcesses = ns
			.ps(deployableServerHostname)
			.filter((p) => Object.values(MINING_REMOTE_SCRIPTS).includes(p.filename));
		if (!miningProcesses.length) continue;

		let mappedData = miningProcesses.map((p) => ({
			targetHostname: p.args[0],
			threads: p.threads,
			task: getKeyByValue(MINING_REMOTE_SCRIPTS, p.filename),
		}));
		targetProcesses.push(...mappedData.filter((p) => p.targetHostname === hostname));
	}

	return {
		hostname: hostname,
		maxMoney: ns.getServerMaxMoney(hostname),
		currentMoney: ns.getServerMoneyAvailable(hostname),
		minSecurity: ns.getServerMinSecurityLevel(hostname),
		currentSecurity: ns.getServerSecurityLevel(hostname),
		requiredHackingLevel: ns.getServerRequiredHackingLevel(hostname),
		task: [...new Set(targetProcesses.map((p) => p.task))].join() || NONE,
		threads: targetProcesses.map((p) => p.threads).reduce((a, b) => a + b, 0) || NONE,
	};
}