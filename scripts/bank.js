import { formatMoney, parseFormattedMoney, tprintLines, colorMoney } from "scripts/utils/utils";
import { getMoneyReserve, saveMoneyReserve } from "scripts/storage";
import { exitOnInvalidCommand } from "scripts/utils/validations";

const COMMANDS = ["reserve", "available", "spendable"];

export function autocomplete(data, args) {
	return COMMANDS;
}

/** @param {NS} ns */
export async function main(ns) {
	const [command, value] = ns.args;

	if (command === undefined) {
		printBankReport(ns);
		return;
	}

	exitOnInvalidCommand(ns, command, COMMANDS);

	switch (command) {
		case "reserve": {
			if (value === undefined) {
				tprintLines(ns, `Reserved: ${colorMoney(formatMoney(getReservedAmount(ns)))}`.toString());
			} else if (value == 0) {
				setReservedAmount(ns, 0);
				tprintLines(ns, `Reserved amount was reset to ${colorMoney("$0")}`);
			} else {
				try {
					const reserveAddtionalAmount = parseFormattedMoney(value);
					const totalReservedAmount = getReservedAmount(ns) + reserveAddtionalAmount;
					setReservedAmount(ns, totalReservedAmount);
					tprintLines(ns, `Added to reserve: ${colorMoney(formatMoney(reserveAddtionalAmount))} (total: ${colorMoney(formatMoney(totalReservedAmount))})`);
				} catch {
					ns.tprintf("FAILED: Unable to parse number value. It can be plain number or with symbol e.g. 100, 10K, 5B, etc.");
				}
			}
			break;
		}
		case "available": {
			tprintLines(ns, `Available: ${colorMoney(formatMoney(getAvailableAmount(ns)))}`);
			break;
		}
		case "spendable": {
			tprintLines(ns, `Spendable: ${colorMoney(formatMoney(getSpendableAmount(ns)))}`);
			break;
		}
		default:
			ns.tprintf("FAILED: Command not implemented.");
	}
}

/** @param {NS} ns */
function printBankReport(ns) {
	tprintLines(ns
		, `Spendable: ${colorMoney(formatMoney(getSpendableAmount(ns)))}`
		, `Available: ${colorMoney(formatMoney(getAvailableAmount(ns)))}`
		, `Reserved:  ${colorMoney(formatMoney(getReservedAmount(ns)))}`);
}

/**
 * @param {NS} ns
 * @returns {number} amount of money in reserve.
 **/
export function getReservedAmount(ns) {
	const value = getMoneyReserve(ns);
	return isNaN(value) ? 0 : value;
}

/**
 * Sets amount of money to be reserved.
 *
 * @param {NS} ns
 **/
function setReservedAmount(ns, amount) {
	saveMoneyReserve(ns, amount);
}

/**
 * @param {NS} ns
 * @returns {number} amount of money available in total.
 **/
export function getAvailableAmount(ns) {
	return ns.getServerMoneyAvailable("home");
}

/**
 * @param {NS} ns
 * @returns {number} amount of money available minus reserve.
 **/
export function getSpendableAmount(ns) {
	return Math.max(getAvailableAmount(ns) - getReservedAmount(ns), 0);
}