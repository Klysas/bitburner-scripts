import { SERVICE_COMMANDS } from "scripts/utils/constants";
import { colorWarning } from "scripts/utils/formatting";
import { tprintLines } from "scripts/utils/printing";
import { exitOnInvalidCommand } from "scripts/utils/validations";

/**
 * @param {object} object 
 * @param {any} value 
 * @returns
 */
export function getKeyByValue(object, value) {
	return Object.keys(object).find((key) => object[key] === value);
}

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
	ns.ui.closeTail();

	ns.tprintf(colorWarning(`Found other instances(${otherInstancesRunning.length}) already running. Openning their terminals...`));

	for (const instance of otherInstancesRunning) {
		ns.ui.openTail(instance.pid);
		if (width != undefined && height != undefined) {
			ns.ui.resizeTail(width, height, instance.pid);
		}
	}

	ns.exit();
}

/** 
 * Depending on given command will start or stop the background service.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} serviceName Name of the service that will be used in output messages.
 * @param {string} command One of {@link SERVICE_COMMANDS} commands.
 * @param {function} runFunction Function that will run in background.
 **/
export async function controlService(ns, serviceName, command, runFunction) {
	exitOnInvalidCommand(ns, command, SERVICE_COMMANDS);

	switch (command) {
		case "start": {
			if (getOtherInstancesOfCurrentScript(ns).length > 0) {
				tprintLines(ns, `${serviceName} service is already running.`);
				return;
			}

			tprintLines(ns, `Started ${serviceName} service.`);
			await runFunction();
			break;
		}
		case "stop": {
			try {
				killCurrentScript(ns);
				tprintLines(ns, `Stopped ${serviceName} service.`);
			} catch {
				tprintLines(ns, `${serviceName} service is not running.`);
			}
			break;
		}
		case "log": {
			const otherInstances = getOtherInstancesOfCurrentScript(ns);
			if (otherInstances.length > 0) {
				ns.ui.openTail(otherInstances[0].pid);
			} else tprintLines(ns, `${serviceName} service is not running.`);
			break;
		}
		default:
			ns.tprintf(`FAILED: Command not implemented.`);
			return;
	}
}

 /** 
  * Injects command to terminal as it were typed.
  * 
  * @param {string} command Command to be injected into terminal.
  **/
export function injectCommand(command) {
	const terminalInput = document.getElementById("terminal-input");
	terminalInput.value = command;
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({ target: terminalInput });
	terminalInput[handler].onKeyDown({ key: "Enter", preventDefault: () => null });
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