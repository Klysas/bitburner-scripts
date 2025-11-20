import { formatMoney, killCurrentScript, openExistingIfAlreadyRunning, tprintLines } from "scripts/utils/utils";
import { exitOnInvalidArgument, exitOnInvalidCommand } from "scripts/utils/validations";

const COMMANDS = {
	start: ["location", "scripts", "karma", "kills", "gang"],
	stop: [],
};

export function autocomplete(data, args) {
	return [...Object.keys(COMMANDS), ...new Set(Object.values(COMMANDS).flat())];
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	const [command] = ns.args;
	const args = ns.args.slice(1);

	exitOnInvalidCommand(ns, command, Object.keys(COMMANDS));
	// FIX: Following allows to pass command without arguments, when arguments are required.
	for (const argument of args) {
		exitOnInvalidArgument(ns, argument, COMMANDS[command]);
	}
	if (command != "stop") openExistingIfAlreadyRunning(ns);

	switch (command) {
		case "start": {
			tprintLines(ns, "Started HUD background service.");
			await runDrawOnHud(ns, args.length ? args : COMMANDS.start);
			break;
		}
		case "stop": {
			try {
				killCurrentScript(ns);
				tprintLines(ns, "Stopped HUD background service.");
			} catch {
				tprintLines(ns, "HUD background service is not running.");
			}
			clearHud(ns);
			break;
		}
		default:
			ns.tprintf(`FAILED: Command not implemented.`);
			return;
	}
}

/**
 * Runs cycle that redraws HUD every second.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string[]} dataTypes List of types to be displayed on HUD.
 */
async function runDrawOnHud(ns, dataTypes) {
	const doc = eval("document");
	const removeByClassName = (sel) => doc.querySelectorAll(sel).forEach((el) => el.remove());
	const colorByClassName = (sel, col) => doc.querySelectorAll(sel).forEach((el) => (el.style.color = col));
	const hook0 = doc.getElementById("overview-extra-hook-0");
	const hook1 = doc.getElementById("overview-extra-hook-1");

	while (true) {
		try {
			var theme = ns.ui.getTheme();
			removeByClassName(".HUD_el");

			// SEPARATOR
			hook0.insertAdjacentHTML("beforebegin", `<hr class="HUD_sep HUD_el">`);
			hook1.insertAdjacentHTML("beforebegin", `<hr class="HUD_sep HUD_el">`);

			for(const dataType of dataTypes) {
				if (dataType == "location") {
					// CITY
					hook0.insertAdjacentHTML("beforeend", `<element class="HUD_GN_C HUD_el" title="The name of the City you are currently in.">City</element><br class="HUD_el">`);
					colorByClassName(".HUD_GN_C", theme["cha"]);
					hook1.insertAdjacentHTML("beforeend", `<element class="HUD_GN_C HUD_el">${ns.getPlayer().city}</element><br class="HUD_el">`);
					colorByClassName(".HUD_GN_C", theme["cha"]);
				}

				if (dataType == "karma") {
					// KARMA
					hook0.insertAdjacentHTML('beforeend', `<element class="HUD_Karma_H HUD_el" title="Your karma.">Karma</element><br class="HUD_el">`)
					colorByClassName(".HUD_Karma_H", theme['hp'])
					hook1.insertAdjacentHTML('beforeend', `<element class="HUD_Karma HUD_el">${ns.formatNumber(ns.heart.break(), 0, 100000)}</element><br class="HUD_el">`)
					colorByClassName(".HUD_Karma", theme['hp'])
				}

				if (dataType == "kills") {
					// KILLS
					hook0.insertAdjacentHTML("beforeend", `<element class="HUD_Kills_H HUD_el" title="Your kill count, increases every successful homicide.">Kills</element><br class="HUD_el">`);
					colorByClassName(".HUD_Kills_H", theme["hp"]);
					removeByClassName(".HUD_Kills");
					hook1.insertAdjacentHTML("beforeend", `<element class="HUD_Kills HUD_el">${ns.getPlayer().numPeopleKilled}</element><br class="HUD_el">`);
					colorByClassName(".HUD_Kills", theme["hp"]);
				}

				if (dataType == "scripts") {
					// SCRIPT INCOME
					hook0.insertAdjacentHTML("beforeend", `<element class="HUD_ScrInc_H HUD_el" title="Money Gain from Scripts per Second.">ScrInc</element><br class="HUD_el">`);
					colorByClassName(".HUD_ScrInc_H", theme["money"]);
					hook1.insertAdjacentHTML("beforeend", `<element class="HUD_ScrInc HUD_el">${formatMoney(ns.getTotalScriptIncome()[0]) + "/sec"}</element><br class="HUD_el">`);
					colorByClassName(".HUD_ScrInc", theme["money"]);

					// SCRIPT XP
					hook0.insertAdjacentHTML("beforeend", `<element class="HUD_ScrExp_H HUD_el" title="XP Gain from Scripts per Second.">ScrExp</element><br class="HUD_el">`);
					colorByClassName(".HUD_ScrExp_H", theme["hack"]);
					hook1.insertAdjacentHTML("beforeend", `<element class="HUD_ScrExp HUD_el">${ns.formatNumber(ns.getTotalScriptExpGain(), 2) + " XP/sec"}</element><br class="HUD_el">`);
					colorByClassName(".HUD_ScrExp", theme["hack"]);
				}

				if (dataType == "gang") {
					// GANG FACTION
					hook0.insertAdjacentHTML("beforeend", `<element class="HUD_GN_F HUD_el" title="The name of your gang faction.">Faction</element><br class="HUD_el">`);
					colorByClassName(".HUD_GN_F", theme["int"]);
					hook1.insertAdjacentHTML("beforeend", `<element class="HUD_GN_F HUD_el">${ns.gang.inGang() ? ns.gang.getGangInformation().faction : "-"}</element><br class="HUD_el">`);
					colorByClassName(".HUD_GN_F", theme["int"]);

					if(!ns.gang.inGang()) continue;

					// GANG RESPECT
					hook0.insertAdjacentHTML("beforeend", `<element class="HUD_GN_R HUD_el" title="The respect of your gang.">Gang Respect</element><br class="HUD_el">`);
					colorByClassName(".HUD_GN_R", theme["int"]);
					hook1.insertAdjacentHTML("beforeend", `<element class="HUD_GN_R HUD_el">${ns.formatNumber(ns.gang.getGangInformation().respect, 5)}</element><br class="HUD_el">`);
					colorByClassName(".HUD_GN_R", theme["int"]);

					// GANG INCOME
					hook0.insertAdjacentHTML("beforeend", `<element class="HUD_GN_I HUD_el" title="The income of your gang.">Gang Income</element><br class="HUD_el">`);
					colorByClassName(".HUD_GN_I", theme["int"]);
					// A tick is every 200ms. To get the actual money/sec, multiple moneyGainRate by 5.
					hook1.insertAdjacentHTML("beforeend", `<element class="HUD_GN HUD_el">${formatMoney(ns.gang.getGangInformation().moneyGainRate * 5) + '/sec'}</element><br class="HUD_el">`);
					colorByClassName(".HUD_GN", theme["int"]);
				}
			}
		} catch(error) {
			ns.print("ERROR: HUD update failed. Exception: " + String(error));
			ns.toast("HUD update failed!", "error");
		}

		await ns.sleep(1000);
	}
}

/** 
 * Removes all added HUD elements.
 * 
 * @param {NS} ns Netscript instance.
 */
function clearHud(ns) {
	const doc = eval("document");
	const removeByClassName = (sel) => doc.querySelectorAll(sel).forEach((el) => el.remove());

	try {
		removeByClassName(".HUD_el");
	} catch(error) {
		ns.print("ERROR: Failed to clear HUD. Exception: " + String(error));
	}
}