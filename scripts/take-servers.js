import { saveUnlockedServers } from "scripts/storage";

// rename to find-servers.js with arguments [all, purchased, unlocked, locked, targets, refresh]
// all - all found servers(including "home")
// purchased - purchased servers
// unlocked - all with root access(scripts can be deployed). Previously "available". <-----
// locked - all without root access.
// targets - potential mining targets (has or can have money and can be hacked)
// refresh - updates all lists.
// without arguments should output how many servers there are in each categorry.(refresh should print out that too).


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");

	let foundServers = getConnectedServers(ns, "home").filter(v => v !== "home");
	ns.printf("Found servers: %d", foundServers.length);

	let unlockedServers = [];
	let lockedServers = [];
	for (let fs of foundServers) {
		if (unlock(ns, fs)) {
			unlockedServers.push(fs);
		} else {
			lockedServers.push(fs);
		}
	}
	ns.printf("Unlocked servers: %d/%d", unlockedServers.length, foundServers.length);

	saveUnlockedServers(ns, unlockedServers);
}

/** 
 * @param {NS} ns
 * @param {string} hostname
 * @param {string[]} knownServers
 * @returns {string[]}
 */
export function getConnectedServers(ns, hostname, knownServers = []) {
	for (let connectedHostname of ns.scan(hostname)) {
		if (knownServers.includes(connectedHostname)) {
			continue;
		} else {
			knownServers.push(connectedHostname);
			getConnectedServers(ns, connectedHostname, knownServers);
		}
	}

	return knownServers;
}

/** 
 * @param {NS} ns
 * @param {string} hostname
 * @returns {boolean} TRUE - has root access, FALSE otherwise.
 */
export function unlock(ns, hostname) {
	if (ns.hasRootAccess(hostname)) {
		return true;
	}

	const portsRequired = ns.getServerNumPortsRequired(hostname);
	switch (portsRequired) {
		case 5:
			if (ns.fileExists("SQLInject.exe")) {
				ns.sqlinject(hostname);
			} else {
				return false;
			}
		case 4:
			if (ns.fileExists("HTTPWorm.exe")) {
				ns.httpworm(hostname);
			} else {
				return false;
			}
		case 3:
			if (ns.fileExists("relaySMTP.exe")) {
				ns.relaysmtp(hostname);
			} else {
				return false;
			}
		case 2:
			if (ns.fileExists("FTPCrack.exe")) {
				ns.ftpcrack(hostname);
			} else {
				return false;
			}
		case 1:
			if (ns.fileExists("BruteSSH.exe")) {
				ns.brutessh(hostname);
			} else {
				return false;
			}
		case 0:
			ns.nuke(hostname);
			return true;
		default:
			ns.printf("FAILED: Ports requirement is too high(%d) for [%s].", portsRequired, hostname);
			return false;
	}
}