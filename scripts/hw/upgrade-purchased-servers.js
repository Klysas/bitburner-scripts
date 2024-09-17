import { getLoadingBar, getCurrentTimeInFormat, colorMoney, colorError, openExistingIfAlreadyRunning, formatMoney, formatRAM, parseFormattedRAM } from "scripts/utils";
import { getSpendableAmount } from "scripts/bank";
import { notifyServerAddedOrModified } from "scripts/simple-mining-manager";

const T_WIDTH = 460;
const T_HEIGHT = 185;

let upgradedServers;
let purchasedServers;
let targetRamAmount;

/** @param {NS} ns */
export async function main(ns) {
	openExistingIfAlreadyRunning(ns, T_WIDTH, T_HEIGHT);
	ns.disableLog("ALL");
	const [ram] = ns.args;

	let runInfinitely = false;
	if (ram === undefined) {
		targetRamAmount = Math.min(...ns.getPurchasedServers().map((h) => Number(ns.getServerMaxRam(h)))) * 2;
		runInfinitely = true;
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

	ns.tail();
	ns.resizeTail(T_WIDTH, T_HEIGHT);

	do {
		let status = "N/A";
		let sleepTime = 2000;
		upgradedServers = 0;
		purchasedServers = ns.getPurchasedServers();

		for (let i = 0; i < purchasedServers.length; i++) {
			const upgrableHostname = purchasedServers[i];

			printReport(ns, status);
			await ns.sleep(sleepTime);
			sleepTime = 2000;

			if (ns.getServerMaxRam(upgrableHostname) >= targetRamAmount) {
				upgradedServers++;
				status = `[${upgrableHostname}] already upgraded.`;
				continue;
			}

			const upgradeCost = ns.getPurchasedServerUpgradeCost(upgrableHostname, targetRamAmount);
			const spendableAmount = getSpendableAmount(ns);
			if (upgradeCost > spendableAmount) {
				i--;
				sleepTime = 60000;
				status = `Missing ${colorMoney(formatMoney(upgradeCost - spendableAmount))} (unit cost: ${colorMoney(formatMoney(upgradeCost))}).`;
				continue;
			}

			if (!upgradeServer(ns, upgrableHostname, targetRamAmount)) {
				i--;
				status = `[${upgrableHostname}] upgrade failed.`;
				ns.toast(status, "error");
				status = colorError(status);
				continue;
			}

			upgradedServers++;
			status = `[${upgrableHostname}] successfully upgraded.`;
			notifyServerAddedOrModified(ns, upgrableHostname); // TODO: handle when fails to notify.
		}

		printReport(ns, `Completed upgrade.`);
		await ns.sleep(2000);
		targetRamAmount *= 2;
	} while (runInfinitely);
}

/** @param {NS} ns */
function upgradeServer(ns, hostname, ram) {
	return ns.upgradePurchasedServer(hostname, ram);
}

/** @param {NS} ns */
function printReport(ns, status) {
	ns.clearLog();
	ns.printf("=".repeat(45));
	ns.printf(`UPGRADING SERVERS to <${formatRAM(targetRamAmount)}>`);
	ns.printf(`Done: ${getLoadingBar((100 * upgradedServers) / purchasedServers.length)} ${upgradedServers}/${purchasedServers.length}`);
	ns.printf("-".repeat(45));
	ns.printf(`[${getCurrentTimeInFormat()}] ${status}`);
	ns.printf("=".repeat(45));
}

function isPowerOfTwo(n) {
	return n > 0 && (n & (n - 1)) === 0;
}