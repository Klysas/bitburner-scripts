import { getSpendableAmount } from "scripts/bank";
import { formatMoney } from "scripts/utils/formatting";
import { tprintLines } from "scripts/utils/printing";
import { exitOnInvalidCommand } from "scripts/utils/validations";

const COMMANDS = ["buy", "ascend", "recruit"];
const EQUIPMENT_TYPES = ["Weapon", "Armor", "Vehicle", "Rootkit", "Augmentation"];

export function autocomplete(data, args) {
	return [...COMMANDS, ...EQUIPMENT_TYPES];
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
				ns.tprintf(`FAILED: Equipment name or type is required.`);
				return;
			}

			var listOfEquipment;
			if (EQUIPMENT_TYPES.includes(argument)) {
				listOfEquipment = ns.gang.getEquipmentNames()
					.map((name) => ({
						name,
						type: ns.gang.getEquipmentType(name),
						cost: ns.gang.getEquipmentCost(name),
					}))
					.filter((eq) => eq.type === argument)
					.sort((a, b) => a.cost - b.cost)
					.map((eq) => eq.name);
			} else if (ns.gang.getEquipmentNames().includes(argument)) {
				listOfEquipment = [argument];
			} else {
				ns.tprintf(`FAILED: Equipment name or type not found.`);
				return;
			}

			for(const equipment of listOfEquipment){
				if(ns.gang.getEquipmentCost(equipment) > getSpendableAmount(ns)){
					outputLines.push(`Not enough money for '${equipment}'(${formatMoney(ns.gang.getEquipmentCost(equipment))}).`);
					break;
				}

				for (const member of ns.gang.getMemberNames()) {
					const memberInfo = ns.gang.getMemberInformation(member);
					if(memberInfo.upgrades.includes(equipment) || memberInfo.augmentations.includes(equipment)){
						outputLines.push(`${member} already owns '${equipment}'`);
						continue;
					}

					if (ns.gang.purchaseEquipment(member, equipment))
						outputLines.push(`Successfully purchased '${equipment}' for ${member}`);
					else 
						outputLines.push(`Failed to purchase '${equipment}' for ${member}`);
				}
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