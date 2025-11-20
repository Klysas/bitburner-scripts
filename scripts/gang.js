import { tprintLines } from "scripts/utils/printing";
import { exitOnInvalidCommand } from "scripts/utils/validations";

const COMMANDS = ["buy", "ascend", "recruit"];

export function autocomplete(data, args) {
	return COMMANDS;
}

const NAMES = ["Alex", "Bill", "Charlie", "David", "Evan", "Frank", "Amber", "Bella", "Cherrie", "Dolores", "Eva", "Fiona"];

/** @param {NS} ns */
export async function main(ns) {
	const [command, argument] = ns.args;

	exitOnInvalidCommand(ns, command, COMMANDS);

	const outputLines = [];
	switch (command) {
		case "buy": {
			if (!argument) {
				ns.tprintf(`FAILED: Equipment name is required.`);
				return;
			}
			if (!ns.gang.getEquipmentNames().includes(argument)) {
				ns.tprintf(`FAILED: Equipment not found.`);
				return;
			}

			for (const member of ns.gang.getMemberNames()) {
				if (ns.gang.purchaseEquipment(member, argument))
					outputLines.push(`Successfully purchased '${argument}' for ${member}`);
				else 
					outputLines.push(`Failed to purchase '${argument}' for ${member}`);
			}
			
			if (outputLines.length === 0) outputLines.push("There are no gang members.");
			break;
		}
		case "ascend": {
			for (const member of ns.gang.getMemberNames()) {
				if (ns.gang.ascendMember(member)) 
					outputLines.push(`Successfully ascended ${member}.`);
				else 
					outputLines.push(`Failed to ascend ${member}.`);
			}

			if (outputLines.length === 0) outputLines.push("There are no gang members.");
			break;
		}
		case "recruit": {		
			for (let i = ns.gang.getMemberNames().length; i < NAMES.length; i++) {
				if (!ns.gang.canRecruitMember()) break;

				let member = NAMES[i];
				if(ns.gang.recruitMember(member))
					outputLines.push(`Successfully recruited ${member}.`);
				else
					outputLines.push(`Failed to recruit ${member}.`);
			}

			if (outputLines.length === 0) outputLines.push("Maximum limit of members is reached.");
			break;
		}
		default:
			ns.tprintf(`FAILED: Command not implemented.`);
	}

	if (outputLines.length) tprintLines(ns, ...outputLines);
}