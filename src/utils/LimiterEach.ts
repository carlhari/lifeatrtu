import { RateLimiter } from "limiter";

export const limiter_min = new RateLimiter({
  tokensPerInterval: 15,
  interval: "min",
  fireImmediately: true,
});
