/** @param {NS} ns */
export async function main(ns) {
	const scripts = [
		{ file: "/scripts/find-servers.js", args: ["refresh"] },
		{ file: "/scripts/unlocker.js", args: ["locked"] },
		{ file: "/scripts/find-best-target.js", args: [] },
		{ file: "/scripts/simple-mining-manager.js", args: [] },
		{ file: "/scripts/hw/purchase-servers.js", args: [8] },
	];

	for (const script of scripts) {
		ns.run(script.file, 1, ...script.args);
	}
}