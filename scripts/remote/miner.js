/** @param {NS} ns */
export async function main(ns) {
	const [target] = ns.args;

	if (!target) {
		ns.tprintf("FAILED: Target is required.");
		return;
	}

	const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
	const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

	// @ignore-infinite
	while (true) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await ns.grow(target);
		} else {
			await ns.hack(target);
		}
	}
}