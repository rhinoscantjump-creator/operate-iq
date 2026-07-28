import { MemoryStore } from "../db/memory-store.js";
import { seedHub01Evals } from "../evals/hub01-runner.js";
import { HUB01_DATASET_ID } from "../evals/golden-hub01.js";

const store = new MemoryStore();
const count = seedHub01Evals(store);
console.log(`Seeded ${count} cases into dataset ${HUB01_DATASET_ID}`);
