/* 
    smart truncation algorithm that dynamically adjusts based on the length of the domain and the path
    it gives priority to the path and truncates the domain if it's too long
    at minimum the domain should still show 8 characters (before "...tld") though
    the result never exceeds maxLength
*/

import { safeSlice, truncate } from './truncate';

// Function to truncate domain while preserving TLD
const truncateDomain = (domain: string, maxLength: number): string => {
  if (domain.length <= maxLength) return domain;

  const parts = domain.split('.');
  const tld = parts.pop() || '';
  const rest = parts.join('.');

  return `${safeSlice(rest, maxLength - 3 - tld.length)}...${tld}`;
};

export const smartTruncate = (link: string, maxLength: number): string => {
  if (link.length <= maxLength) {
    return link;
  }

  const [domain, ...pathParts] = link.split('/');
  const path = pathParts.join('/');
  const minDomainLength = 8;
  const tldLength = domain.length - domain.lastIndexOf('.') - 1;

  // reserve room for the domain (at most 8 chars + "...tld", or all of it if shorter)
  const reservedDomain = Math.min(
    domain.length,
    minDomainLength + 3 + tldLength
  );

  // calculate max path length (minus the "/" separator)
  const maxPathLength = maxLength - reservedDomain - 1;

  // Truncate path
  const truncatedPath = truncate(path, maxPathLength)!;

  // Truncate domain if necessary, preserving TLD
  const truncatedDomain = truncateDomain(
    domain,
    maxLength - truncatedPath.length - 1
  );

  return safeSlice(`${truncatedDomain}/${truncatedPath}`, maxLength);
};
