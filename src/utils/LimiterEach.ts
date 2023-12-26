//limit to api calls per mins

import { RateLimiter } from "limiter";

export const limiter_min = new RateLimiter({
  tokensPerInterval: 20,
  interval: "min",
  fireImmediately: true,
});
