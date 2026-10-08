/**
 * Equal-width segment labels (iOS UISegmentedControl / Material TabRow).
 * `minWidth: 0` is the RN equivalent of CSS flex min-width: 0 — without it,
 * long labels blow the row on small phones instead of shrinking.
 */
export function segmentLabelSize(windowWidth: number, optionCount: number): number {
  if (optionCount >= 4 && windowWidth < 340) return 11;
  if (optionCount >= 4 && windowWidth < 390) return 12;
  return 13;
}
