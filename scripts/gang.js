const COMMANDS = ["buy", "ascend"];

export function autocomplete(data, args) {
	return COMMANDS;
}

/** @param {NS} ns */
export async function main(ns) {
	const [command, argument] = ns.args;

	if (!command) {
		ns.tprintf(`FAILED: Command is required. Commands: ${COMMANDS}`);
		return;
	}

	if (command && !COMMANDS.includes(command)) {
		ns.tprintf(`FAILED: Command is not supported. Commands: ${COMMANDS}`);
		return;
	}

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
					ns.tprintf(`Successfully purchased '${argument}' for ${member}`);
				else 
					ns.tprintf(`Failed to purchase '${argument}' for ${member}`);
			}
			break;
		}
		case "ascend": {
			for (const member of ns.gang.getMemberNames()) {
				if (ns.gang.ascendMember(member)) 
					ns.tprintf(`Successfully ascended ${member}.`);
				else 
					ns.tprintf(`Failed to ascend ${member}.`);
			}
			break;
		}
		default:
			ns.tprintf(`FAILED: Command not implemented.`);
	}
}