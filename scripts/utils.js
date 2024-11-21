import { RESET_COLOR, MONEY_COLOR, WARNING_COLOR, ERROR_COLOR } from "scripts/constants";


/**
 * Finds other process of current script and kills it.
 * 
 * NOTE: kills only FIRST found other process.
 * 
 * @param {NS} ns Netscript instance.
 * @throws Will throw error if there are no other running processes of current script.
 */
export function killCurrentScript(ns) {
	const instance = getOtherInstancesOfCurrentScript(ns)[0];
	if (!instance) throw "FAILED: running process not found.";

	ns.kill(instance.pid);
}

/**
 * Finds other process of current script and restarts it with same arguments(also kills process which called this function).
 * 
 * NOTE: restarts only FIRST found other process.
 * 
 * @param {NS} ns Netscript instance.
 * @throws Will throw error if there are no other running processes of current script.
 */
export function restartCurrentScript(ns) {
	const instance = getOtherInstancesOfCurrentScript(ns)[0];
	if (!instance) throw "FAILED: running process not found.";

	const scriptFile = instance.filename;
	const args = instance.args;
	const threadsCount = instance.threads;

	ns.kill(instance.pid);
	ns.spawn(scriptFile, { threads: threadsCount, spawnDelay: 0 }, ...args);
}

/** 
 * Retries function call specified number of times and checks its output, stops when it was successful or exceeded `attemptsCount`.
 * 
 * @param {NS} ns Netscript instance.
 * @param {number} sleepInMs Time between attempts.
 * @param {number} attemptsCount Maximum times to retry `func` call before returning FALSE.
 * @param {function} func Function to call specified number of times or until it is successful.
 * @param {any} successResult (Optional) `func` success return value. Default TRUE.
 * @returns {Promise<boolean>} TRUE - success, otherwise FALSE.
*/
export async function retry(ns, sleepInMs, attemptsCount, func, successResult = true) {
	while (attemptsCount-- > 0) {
		if (func() == successResult) return true;
		await ns.sleep(sleepInMs);
	}
	return false;
}

/**
 * @param {NS} ns Netscript instance.
 * @returns {ProcessInfo[]} Array of other running instances of current script.
 */
function getOtherInstancesOfCurrentScript(ns) {
	const currentScriptName = ns.getScriptName();
	const currentPID = ns.pid;
	return ns.ps().filter((s) => s.filename == currentScriptName && s.pid != currentPID);
}

/** 
 * Checks if there are other instances running of the same script and opens them all instead.
 * 
 * @param {NS} ns
 * @param {number=} width (Optional) Width of opened terminal window.
 * @param {number=} height (Optional) Height of opened terminal window.
 **/
export function openExistingIfAlreadyRunning(ns, width, height) {
	const otherInstancesRunning = getOtherInstancesOfCurrentScript(ns);

	if (otherInstancesRunning.length == 0) {
		return;
	}
	ns.closeTail();

	ns.tprintf(colorWarning(`Found other instances(${otherInstancesRunning.length}) already running. Openning their terminals...`));

	for (const instance of otherInstancesRunning) {
		ns.tail(instance.pid);
		if (width != undefined && height != undefined) {
			ns.resizeTail(width, height, instance.pid);
		}
	}

	ns.exit();
}

/**
 * @returns {string} Current time in format.
 **/
export function getCurrentTimeInFormat() {
	const now = new Date();
	return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
}

/**
 * @param {number} precentageFilled Precentage of loading bar that is filled.
 * @param {number=} length (Optional) Length of loading bar. Default 20.
 * @returns {string} Loading bar with spcified precentage filled.
 **/
export function getLoadingBar(precentageFilled, length = 20) {
	const filledLength = Math.round((precentageFilled / 100) * length);
	const filledPart = "█".repeat(filledLength);
	const nonFilledPart = "-".repeat(length - filledLength);
	return `|${filledPart}${nonFilledPart}|`;
}

//========================================================
//	PRINTING
//========================================================

/**
 * Prints separator to Terminal.
 *
 * @param {NS} ns
 * @param {string} symbol Symbol to be used for separation.
 * @param {number=} length (Optional) Length of separator. Default = 50.
 **/
export function tprintSeparator(ns, symbol, length = 50) {
	ns.tprintf(symbol.repeat(length));
}

/**
 * Prints everything to Terminal surounded with separators.
 *
 * @param {NS} ns Netscript instance.
 * @param {number=} length (Optional) Length of separator. Default = 50. If 0 is provided, then it will use `length` of longest `args` value.
 * @param {string[]} lines Lines to be printed.
 **/
export function tprintLines(ns, ...args) {
	if (typeof args[0] === 'number') {
		var length = args[0] || Math.max(...args.map(a => a?.length || 0));
		var lines = args.slice(1);
	} else {
		length = 50; // Default
		lines = args;
	}

	tprintSeparator(ns, '=', length);
	for (let line of lines) {
		ns.tprintf(line);
	}
	tprintSeparator(ns, '=', length);
}

//========================================================
//	FORMATING
//========================================================

/**
 * @param {number} amount Amount of money.
 * @param {boolean=} displayPrefix (Optional) TRUE to return with money symbol. Default TRUE.
 * @returns {string} Formatted money value with symbol e.g. $10.05K.
 **/
export function formatMoney(amount, displayPrefix = true) {
	let output = amount.toFixed(2).toString();
	const units = [
		{ value: 1e15, symbol: "Q" }, // Quadrillions
		{ value: 1e12, symbol: "T" }, // Trillions
		{ value: 1e9, symbol: "B" },  // Billions
		{ value: 1e6, symbol: "M" },  // Millions
		{ value: 1e3, symbol: "K" },  // Thousands
	]; // TODO: export and single array.

	for (let i = 0; i < units.length; i++) {
		if (amount >= units[i].value) {
			output = (amount / units[i].value).toFixed(2) + units[i].symbol;
			break;
		}
	}

	if (displayPrefix) {
		output = `$${output}`;
	}

	return output;
}

/**
 * @param {string} formattedMoney Amount of money with symbol e.g. 10M.
 * @returns {number} Amount of money without symbol e.g. 10000000.
 **/
export function parseFormattedMoney(formattedMoney) {
	const units = {
		K: 1e3,  // Thousands
		M: 1e6,  // Millions
		B: 1e9,  // Billions
		T: 1e12, // Trillions
		Q: 1e15, // Quadrillions
	}; // TODO: export and single array.

	const regex = "^([\\d.]+)([" + Object.keys(units).join('') + "]?)$";
	const match = formattedMoney.toString().toUpperCase().match(regex);

	if (!match) {
		throw new Error('Invalid format');
	}

	const number = parseFloat(match[1]);
	const unit = match[2];

	if (!unit) {
		return number;
	}

	return number * units[unit];
}

/**
 * @param {number} gigabytes Number of gigabytes without symbols.
 * @param {number=} numberOfFractionDigits (Optional) Default 0.
 * @returns {string} Formatted ram value with symbol e.g. 4 GB.
 **/
export function formatRAM(gigabytes, numberOfFractionDigits = 0) {
	let output = gigabytes.toString();
	const units = [
		{ value: 1e6, symbol: "PB" }, // Petabytes
		{ value: 1e3, symbol: "TB" }, // Terabytes
		{ value: 1, symbol: "GB" },   // Gigabytes
	];

	for (let i = 0; i < units.length; i++) {
		if (gigabytes >= units[i].value) {
			output = (gigabytes / units[i].value).toFixed(numberOfFractionDigits) + " " + units[i].symbol;
			break;
		}
	}

	return output;
}

/**
 * @param {string} formattedRAM RAM amount with symbol e.g 1 TB.
 * @returns {number} Amount of RAM without a symbol in gigabytes e.g. 1024.
 **/
export function parseFormattedRAM(formattedRAM) {
	const units = {
		"PB": 1024 ** 2,  // 1 Petabyte = 1024^2 Gigabytes (1,048,576 GB)
		"TB": 1024,       // 1 Terabyte = 1024 Gigabytes
		"GB": 1           // 1 Gigabyte = 1 Gigabyte
	};

	const regex = /^([\d.]+)\s?(PB|TB|GB)?$/;
	const match = formattedRAM.toString().toUpperCase().match(regex);

	if (!match) {
		throw new Error("Invalid format");
	}

	const number = parseFloat(match[1]);
	const unit = match[2] ?? "GB";

	return number * units[unit];
}

/**
 * @param {string} color Color of the text.
 * @param {string} text Text to be colored.
 * @returns {string} Colored text.
 **/
export function color(color, text) {
	return `${color}${text}${RESET_COLOR}`;
}

/**
 * @param {string} text Text to be colored.
 * @returns {string} Colored text in `MONEY_COLOR` color.
 **/
export function colorMoney(text) {
	return color(MONEY_COLOR, text);
}

/**
 * @param {string} text Text to be colored.
 * @returns {string} Colored text in `WARNING_COLOR` color.
 **/
export function colorWarning(text) {
	return color(WARNING_COLOR, text);
}

/**
 * @param {string} text Text to be colored.
 * @returns {string} Colored text in `ERROR_COLOR` color.
 **/
export function colorError(text) {
	return color(ERROR_COLOR, text);
}