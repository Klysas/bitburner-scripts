import { RESET_COLOR, MONEY_COLOR, WARNING_COLOR, ERROR_COLOR } from "scripts/utils/constants";

//========================================================
//	COLOR
//========================================================

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

//========================================================
//	MONEY
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
		{ value: 1e9, symbol: "B" }, // Billions
		{ value: 1e6, symbol: "M" }, // Millions
		{ value: 1e3, symbol: "K" }, // Thousands
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
		K: 1e3, // Thousands
		M: 1e6, // Millions
		B: 1e9, // Billions
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

//========================================================
//	RAM
//========================================================

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
		{ value: 1, symbol: "GB" }, // Gigabytes
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
		"PB": 1024 ** 2, // 1 Petabyte = 1024^2 Gigabytes (1,048,576 GB)
		"TB": 1024, // 1 Terabyte = 1024 Gigabytes
		"GB": 1 // 1 Gigabyte = 1 Gigabyte
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