//limit to api calls per mins

import { RateLimiter } from "limiter";

export const limiter_delete = new RateLimiter({
  tokensPerInterval: 50,
  interval: "min",
  fireImmediately: true,
});
