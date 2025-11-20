import { tprintLines } from "scripts/utils/printing";

export function autocomplete(data, args) {
	return [...data.servers, "connect"];
}

/** @param {NS} ns */
export async function main(ns) {
	const [targetHostname, command] = ns.args;

	if (!ns.serverExists(targetHostname)) {
		ns.tprintf(`FAILED: [${targetHostname}] does not exist.`);
		return;
	}

	const nodes = findPathToHome(ns, targetHostname).reverse().slice(1);

	let path = "";
	let connectCommand = "";
	for (const node of nodes) {
		path += `[${node}]${node == targetHostname ? "" : " => "}`;
		connectCommand += `connect ${node};`
	}

	let connected = false;
	if (command !== undefined && command == "connect") {
		connected = nodes.every((node) => ns.singularity.connect(node));
	}

	tprintLines(ns, 0, `Path: ${path}`, "", connected ? "Connected." : connectCommand);
}

/** 
 * Recursively finds a path from the given hostname to "home".
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} hostname The starting node.
 * @param {Set} visited A set of visited nodes to avoid loops.
 * @returns {Array<string>} A list of hostnames from the starting node to "home".
 */
export function findPathToHome(ns, hostname, visited = new Set()) {
	visited.add(hostname);

	const connectedHosts = ns.scan(hostname);

	if (connectedHosts.includes("home")) {
		return [hostname, "home"];
	}

	for (let host of connectedHosts) {
		if (!visited.has(host)) {
			let path = findPathToHome(ns, host, visited);

			if (path.length > 0) {
				return [hostname, ...path];
			}
		}
	}

	return [];
}