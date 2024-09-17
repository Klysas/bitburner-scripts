import { NEW_LINE } from "scripts/constants";

//========================================================
//	LOCKED SERVERS
//========================================================

const LOCKED_SERVERS_FILE = "/data/lockedServers.txt";

/** 
 * Save hostnames of servers with no access to permanent storage.
 * 
 * @param {NS} ns
 * @param {string[]} servers
 */
export function saveLockedServers(ns, servers) {
	ns.write(LOCKED_SERVERS_FILE, servers.join(NEW_LINE), "w");
}

/** 
 * Get hostnames of servers with no access from permanent storage.
 * 
 * @param {NS} ns 
 * @returns {string[]}
*/
export function getLockedServers(ns) {
	return ns.read(LOCKED_SERVERS_FILE).split(NEW_LINE);
}

//========================================================
//	UNLOCKED SERVERS
//========================================================

const UNLOCKED_SERVERS_FILE = "/data/unlockedServers.txt";

/** 
 * Save hostnames of servers with full(root) access to permanent storage.
 * 
 * @param {NS} ns
 * @param {string[]} servers
 */
export function saveUnlockedServers(ns, servers) {
	ns.write(UNLOCKED_SERVERS_FILE, servers.join(NEW_LINE), "w");
}

/** 
 * Get hostnames of servers with full(root) access from permanent storage.
 * 
 * @param {NS} ns 
 * @returns {string[]}
*/
export function getUnlockedServers(ns) {
	return ns.read(UNLOCKED_SERVERS_FILE).split(NEW_LINE);
}

//========================================================
//	AVAILABLE SERVERS (DEPRECATED)
//========================================================

// const AVAILABLE_SERVERS_FILE = "/data/availableServers.txt";

// /** 
//  * Save hostnames of servers with full access to permanent storage.
//  * 
//  * @param {NS} ns
//  * @param {string[]} servers
//  */
// export function saveAvailableServers(ns, servers) {
// 	ns.write(AVAILABLE_SERVERS_FILE, servers.join(NEW_LINE), "w");
// }

// /** 
//  * Get hostnames of servers with full access from permanent storage.
//  * 
//  * @param {NS} ns 
//  * @returns {string[]}
// */
// export function getAvailableServers(ns) {
// 	return ns.read(AVAILABLE_SERVERS_FILE).split(NEW_LINE);
// }

//========================================================
//	MONEY RESERVE
//========================================================

const MONEY_RESERVE_FILE = "/data/moneyReserve.txt";

/** 
 * Save amount of money that is reserved to permanent storage.
 * 
 * @param {NS} ns
 * @param {number} amount
 */
export function saveMoneyReserve(ns, amount) {
	ns.write(MONEY_RESERVE_FILE, amount, "w");
}

/** 
 * Get amount of money that is reserved from permanent storage.
 * 
 * @param {NS} ns 
 * @returns {number} Reserved money amount.
*/
export function getMoneyReserve(ns) {
	return parseInt(ns.read(MONEY_RESERVE_FILE));
}

//========================================================
//	MINING TARGET
//========================================================

const MINING_TARGET_FILE = "/data/miningTarget.txt";

/** 
 * Save mining target to permanent storage.
 * 
 * @param {NS} ns
 * @param {string} target
 */
export function saveMiningTarget(ns, target) {
	ns.write(MINING_TARGET_FILE, target, "w");
}

/** 
 * Get mining target from permanent storage.
 * 
 * @param {NS} ns 
 * @returns {string} Mining target.
*/
export function getMiningTarget(ns) {
	return ns.read(MINING_TARGET_FILE);
}