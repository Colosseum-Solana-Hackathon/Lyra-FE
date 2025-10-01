import { createJupiterApiClient } from "@jup-ag/api";

export const jupiterApi = createJupiterApiClient({
  basePath: "https://api.jup.ag/v6", 
});
