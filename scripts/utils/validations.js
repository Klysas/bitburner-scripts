/**
 * Will terminate the script and print error message IF command was not provided.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} command Command to be validated.
 * @param {string[]} validCommands List of valid commands.
 */
export function exitOnNoCommand(ns, command, validCommands) {
	if (command) return;

	ns.tprintf(`FAILED: Command is required. Commands: ${validCommands}`);
	ns.exit();
}

/**
 * Will terminate the script and print error message IF command was not provided OR
 * it is not from `validCommands` list.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} command Command to be validated.
 * @param {string[]} validCommands List of valid commands.
 */
export function exitOnInvalidCommand(ns, command, validCommands) {
	exitOnNoCommand(ns, command, validCommands);

	if (validCommands.includes(command)) return;

	ns.tprintf(`FAILED: Command is not supported. Commands: ${validCommands}`);
	ns.exit();
}

/**
 * Will terminate the script and print error message IF argument was not provided.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} argument Argument to be validated.
 * @param {string[]} validArguments List of valid arguments.
 */
export function exitOnNoArgument(ns, argument, validArguments) {
	if (argument) return;

	ns.tprintf(`FAILED: Argument is required. Arguments: ${validArguments}`);
	ns.exit();
}

/**
 * Will terminate the script and print error message IF argument was not provided OR
 * it is not from `validArguments` list.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} argument Argument to be validated.
 * @param {string[]} validArguments List of valid arguments.
 */
export function exitOnInvalidArgument(ns, argument, validArguments) {
	exitOnNoArgument(ns, argument, validArguments);

	if (validArguments.includes(argument)) return;

	ns.tprintf(`FAILED: Argument is not supported. Arguments: ${validArguments}`);
	ns.exit();
}