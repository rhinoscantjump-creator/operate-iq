import type { HubId } from "../types/index.js";
import type { HubOperator, HubOperatorFactory } from "./types.js";
import { createHub01Operator } from "./hub-01/operator.js";

const stubs: HubId[] = [
  "hub-02",
  "hub-03",
  "hub-04",
  "hub-05",
  "hub-06",
  "hub-07",
  "hub-08",
  "hub-09",
  "hub-10",
  "hub-11",
  "hub-12",
  "hub-13",
];

function stubOperator(id: HubId): HubOperator {
  return {
    id,
    name: `Stub ${id}`,
    async plan() {
      throw new Error(`${id} is not implemented yet. Start with hub-01.`);
    },
    async run() {
      throw new Error(`${id} is not implemented yet. Start with hub-01.`);
    },
    async evaluate() {
      throw new Error(`${id} is not implemented yet. Start with hub-01.`);
    },
  };
}

const factories = new Map<HubId, HubOperatorFactory>([
  ["hub-01", createHub01Operator],
  ...stubs.map((id): [HubId, HubOperatorFactory] => [id, () => stubOperator(id)]),
]);

export function getHubOperator(hubId: HubId): HubOperator {
  const factory = factories.get(hubId);
  if (!factory) throw new Error(`Unknown hub: ${hubId}`);
  return factory();
}

export function listRegisteredHubs(): HubId[] {
  return [...factories.keys()];
}
