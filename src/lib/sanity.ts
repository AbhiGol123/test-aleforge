import { createClient } from "@sanity/client";

export const sanity = createClient({
  projectId: "dmz5aq0r",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});
