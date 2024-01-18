export interface useDeleteTypes {
  limit: number;
  date: string | number;
  maxLimit: boolean;
  decreaseLimit: () => void;
  check: () => void;
}
