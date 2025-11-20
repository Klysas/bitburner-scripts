import { getLoadingBar, getCurrentTimeInFormat, openExistingIfAlreadyRunning, retry, } from "scripts/utils/common";
import { colorMoney, colorError, formatMoney, formatRAM, parseFormattedRAM } from "scripts/utils/formatting";
import { getSpendableAmount } from "scripts/bank";
import { notifyServerAddedOrModified } from "scripts/simple-mining-manager";

const T_WIDTH = 460;
const T_HEIGHT = 185;

let purchasedServers;
let purchasedServersLimit;
let targetRamAmount;

/** @param {NS} ns */
export async function main(ns) {
	openExistingIfAlreadyRunning(ns, T_WIDTH, T_HEIGHT);
	ns.disableLog("ALL");
	const [ram] = ns.args;

	if (ram === undefined) {
		ns.tprintf("FAILED: RAM amount as argument is required.");
		return;
	} else {
		try {
			targetRamAmount = parseFormattedRAM(ram);

			if (targetRamAmount < 2) {
				ns.tprintf(`FAILED: Minimal value is 2.`);
				return;
			}

			const maximumRamAmount = ns.getPurchasedServerMaxRam();
			if (targetRamAmount > maximumRamAmount) {
				ns.tprintf(`FAILED: Exceeded maximum amount: ${formatRAM(maximumRamAmount)}`);
				return;
			}

			if (!isPowerOfTwo(targetRamAmount)) {
				ns.tprintf(`FAILED: RAM in gigabytes must be power of 2(2, 4, 8, 16. etc.).`);
				return;
			}
		} catch {
			ns.tprintf("FAILED: Unable to parse RAM argument.");
			return;
		}
	}

	ns.ui.openTail();
	ns.ui.resizeTail(T_WIDTH, T_HEIGHT);

	let status = "N/A";
	let sleepTime = 2000;
	purchasedServers = ns.getPurchasedServers().length;
	purchasedServersLimit = ns.getPurchasedServerLimit();

	for (let i = purchasedServers; i < purchasedServersLimit; i++) {
		printReport(ns, status);
		await ns.sleep(sleepTime);
		sleepTime = 2000;

		const purchaseCost = ns.getPurchasedServerCost(targetRamAmount);
		const spendableAmount = getSpendableAmount(ns);
		if (purchaseCost > spendableAmount) {
			sleepTime = 60000;
			status = `Missing ${colorMoney(formatMoney(purchaseCost - spendableAmount))} (unit cost: ${colorMoney(formatMoney(purchaseCost))}).`;
			i--;
			continue;
		}

		const newHostname = getAvailableHostnameForPurchasedServer(ns);
		if (!purchaseServer(ns, newHostname, targetRamAmount)) {
			status = `[${newHostname}] purchase failed.`;
			ns.toast(status, "error");
			status = colorError(status);
			i--;
			continue;
		}

		purchasedServers++;
		status = `[${newHostname}] successfully purchased.`;
		await retry(ns, 500, 6, () => notifyServerAddedOrModified(ns, newHostname));
	}

	printReport(ns, `Completed purchasing.`);


	if (
		await ns.prompt(`Do you want to start servers upgrade script ?`, { type: "boolean" })
	) {
		ns.ui.closeTail(ns.pid);
		ns.run("/scripts/hw/upgrade-purchased-servers.js", 1);
	}
}

/** @param {NS} ns */
function purchaseServer(ns, hostname, ram) {
	return ns.purchaseServer(hostname, ram);
}

/** @param {NS} ns */
function printReport(ns, status) {
	ns.clearLog();
	ns.printf("=".repeat(45));
	ns.printf(`PURCHASING SERVERS <${formatRAM(targetRamAmount)}>`);
	ns.printf(`Done: ${getLoadingBar((100 * purchasedServers) / purchasedServersLimit)} ${purchasedServers}/${purchasedServersLimit}`);
	ns.printf("-".repeat(45));
	ns.printf(`[${getCurrentTimeInFormat()}] ${status}`);
	ns.printf("=".repeat(45));
}

function isPowerOfTwo(n) {
	return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Checks all purchased servers' hostnames and returns next available.
 *
 * @param {NS} ns
 * @param {string} newHostnamePrefix (Optional) Hostname prefix, at the end available number will be added. Default "ps-".
 * @returns {string} next available hostname.
 **/
function getAvailableHostnameForPurchasedServer(ns, newHostnamePrefix = "ps-") {
	const latestHostnameWithSamePrefix = ns.getPurchasedServers()
		.filter((h) => h.startsWith(newHostnamePrefix))
		.sort((a, b) => parseInt(a.substring(newHostnamePrefix.length)) - parseInt(b.substring(newHostnamePrefix.length)))
		.pop();
	const nextIndex = latestHostnameWithSamePrefix === undefined ? 0 : parseInt(latestHostnameWithSamePrefix.substring(newHostnamePrefix.length)) + 1;
	return newHostnamePrefix + nextIndex;
}