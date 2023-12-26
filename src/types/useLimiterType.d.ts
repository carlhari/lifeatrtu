export interface useLimiterType {
  limit: number;
  maxAge: number;
  maxLimit: boolean;
  decreaseLimit: () => void;
  auto: () => void;
}
