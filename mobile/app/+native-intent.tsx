import { extractResetTokenFromUrl } from '@/shared/linking/parse-reset-link';

type RedirectSystemPathOptions = {
  path: string;
  initial: boolean;
};

/**
 * Rewrites OS deep links (App Links + custom scheme) to the canonical reset route.
 */
export function redirectSystemPath({ path }: RedirectSystemPathOptions): string {
  const token = extractResetTokenFromUrl(path);
  if (token) {
    return `/(auth)/reset-password/${token}`;
  }
  return path;
}
