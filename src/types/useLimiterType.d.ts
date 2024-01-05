export interface useLimiterType {
  limit: number;
  date: string | number;
  maxLimit: boolean;
  decreaseLimit: () => void;
  auto: () => void;
}
