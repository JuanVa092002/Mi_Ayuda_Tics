export type ApiMessage = {
  message: string;
};

export type IdLike = string;

export type Nullable<T> = T | null | undefined;

export type PaginatedResponse<T> = {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
};
