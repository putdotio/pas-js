import { createClientFactory } from "./client";

const createPasClient = createClientFactory();

export default createPasClient;
export type { Config, PutioAnalyticsClient } from "./client";
