//========================================================
//	TERMINAL
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