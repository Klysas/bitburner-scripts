import { getSpendableAmount } from "scripts/bank";
import { tprintLines } from "scripts/utils";
import { exitOnInvalidArgument, exitOnInvalidCommand } from "scripts/utils/validations";

const COMMANDS = {
	buy: ["fill"],
};

export function autocomplete(data, args) {
	return [...Object.keys(COMMANDS), ...new Set(Object.values(COMMANDS).flat()), ...AUGMENTATIONS];
}

const FILL_AUGMENTATION = "NeuroFlux Governor";
const AUGMENTATIONS = ["Augmented Targeting I","Augmented Targeting II","Augmented Targeting III","Synthetic Heart",
	"Synfibril Muscle","Combat Rib I","Combat Rib II","Combat Rib III","Nanofiber Weave","NEMEAN Subdermal Weave","Wired Reflexes",
	"Graphene Bone Lacings","Bionic Spine","Graphene Bionic Spine Upgrade","Bionic Legs","Graphene Bionic Legs Upgrade","Speech Processor Implant",
	"TITN-41 Gene-Modification Injection","Enhanced Social Interaction Implant","BitWire","Artificial Bio-neural Network Implant",
	"Artificial Synaptic Potentiation","Enhanced Myelin Sheathing","Synaptic Enhancement Implant","Neural-Retention Enhancement","DataJack",
	"Embedded Netburner Module","Embedded Netburner Module Core Implant","Embedded Netburner Module Core V2 Upgrade",
	"Embedded Netburner Module Core V3 Upgrade","Embedded Netburner Module Analyze Engine","Embedded Netburner Module Direct Memory Access Upgrade",
	"Neuralstimulator","Neural Accelerator","Cranial Signal Processors - Gen I","Cranial Signal Processors - Gen II","Cranial Signal Processors - Gen III",
	"Cranial Signal Processors - Gen IV","Cranial Signal Processors - Gen V","Neuronal Densification","Neuroreceptor Management Implant",
	"Nuoptimal Nootropic Injector Implant","Speech Enhancement","FocusWire","PC Direct-Neural Interface","PC Direct-Neural Interface Optimization Submodule",
	"PC Direct-Neural Interface NeuroNet Injector","PCMatrix","ADR-V1 Pheromone Gene","ADR-V2 Pheromone Gene","The Shadow's Simulacrum",
	"Hacknet Node CPU Architecture Neural-Upload","Hacknet Node Cache Architecture Neural-Upload","Hacknet Node NIC Architecture Neural-Upload",
	"Hacknet Node Kernel Direct-Neural Interface","Hacknet Node Core Direct-Neural Interface","Neurotrainer I","Neurotrainer II","Neurotrainer III",
	"HyperSight Corneal Implant","LuminCloaking-V1 Skin Implant","LuminCloaking-V2 Skin Implant","HemoRecirculator","SmartSonar Implant","Power Recirculation Core",
	"QLink","The Red Pill","SPTN-97 Gene Modification","ECorp HVMind Implant","CordiARC Fusion Reactor","SmartJaw","Neotra","Xanipher","nextSENS Gene Modification",
	"OmniTek InfoLoad","Photosynthetic Cells","BitRunners Neurolink","The Black Hand","Unstable Circadian Modulator","CRTX42-AA Gene Modification",
	"Neuregen Gene Modification","CashRoot Starter Kit","NutriGen Implant","INFRARET Enhancement","DermaForce Particle Barrier","Graphene BrachiBlades Upgrade",
	"Graphene Bionic Arms Upgrade","BrachiBlades","Bionic Arms","Social Negotiation Assistant (S.N.A)","violet Congruity Implant","Hydroflame Left Arm",
	"BigD's Big ... Brain","Z.O.Ë.","EsperTech Bladeburner Eyewear","EMS-4 Recombination","ORION-MKIV Shoulder","Hyperion Plasma Cannon V1",
	"Hyperion Plasma Cannon V2","GOLEM Serum","Vangelis Virus","Vangelis Virus 3.0","I.N.T.E.R.L.I.N.K.E.D","Blade's Runners","BLADE-51b Tesla Armor",
	"BLADE-51b Tesla Armor: Power Cells Upgrade","BLADE-51b Tesla Armor: Energy Shielding Upgrade","BLADE-51b Tesla Armor: Unibeam Upgrade",
	"BLADE-51b Tesla Armor: Omnibeam Upgrade","BLADE-51b Tesla Armor: IPU Upgrade","The Blade's Simulacrum","Stanek's Gift - Genesis",
	"Stanek's Gift - Awakening","Stanek's Gift - Serenity"];

/** @param {NS} ns */
export async function main(ns) {
	const [command, argument] = ns.args;

	exitOnInvalidCommand(ns, command, Object.keys(COMMANDS));

	let outputLines = [];

	switch (command) {
		case "buy": {
			exitOnInvalidArgument(ns, argument, [...COMMANDS.buy, ...AUGMENTATIONS]);

			if (argument === "fill")
				outputLines.push(`Purchased ${purchaseFillAugmentationWithAllMoney(ns)} x '${FILL_AUGMENTATION}'.`);
			else
				outputLines.push(purchaseAugmentation(ns, argument) ? `'${argument}' purchased.` : `Failed to purchase '${argument}'.`);

			break;
		}
		default:
			ns.tprintf("FAILED: Not implemented.");
			return;
	}

	tprintLines(ns, ...outputLines);
}

/**
 * Purchases `FILL_AUGMENTATION` with all spendable money.
 * 
 * @param {NS} ns Netscript instance.
 * @returns {number} Amount of augmentations purchased.
 */
function purchaseFillAugmentationWithAllMoney(ns) {
	let purchasedCount = 0;
	while (purchaseAugmentation(ns, FILL_AUGMENTATION)) {
		purchasedCount++;
	}
	return purchasedCount;
}

/**
 * Attempts to purchase specified augmentation with spendable money.
 * 
 * @param {NS} ns Netscript instance.
 * @param {string} augmentation Augmentation's name to purchase.
 * @returns TRUE if success, otherwise FALSE.
 */
function purchaseAugmentation(ns, augmentation) {
	const faction = ns.singularity.getAugmentationFactions(augmentation)
					.filter((f) => ns.singularity.getAugmentationRepReq(augmentation) <= ns.singularity.getFactionRep(f))[0];
	if (!faction) return false;
	return getSpendableAmount(ns) > ns.singularity.getAugmentationPrice(augmentation) && ns.singularity.purchaseAugmentation(faction, augmentation);
}