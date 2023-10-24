export type JwtPayload = {
  id: string;
  username: string;
  role: string;
};

export interface HttpSuccessResponse<T> {
  readonly data: T;
}

export interface FailResponse {
  readonly message: string;
  readonly code: number;
}

export interface HttpFailResponse {
  readonly error: FailResponse;
}

export type AddPropertyToObject<T, K extends string, V> = Pick<
  T,
  Exclude<keyof T, K>
> &
  Record<K, V>;
