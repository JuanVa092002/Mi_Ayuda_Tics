/** Loading/error UI must not replace a screen that already has cached data. */
export function shouldShowQueryLoading(isLoading: boolean, hasData: boolean): boolean {
  return isLoading && !hasData;
}

export function shouldShowQueryError(isError: boolean, hasData: boolean): boolean {
  return isError && !hasData;
}
