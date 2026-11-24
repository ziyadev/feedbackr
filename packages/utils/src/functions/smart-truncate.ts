/* 
    smart truncation algorithm that dynamically adjusts based on the length of the domain and the path
    it gives priority to the path and truncates the domain if it's too long
    at minimum the domain should still show 8 characters though
    the result never exceeds maxLength and never splits a surrogate pair
*/

// Slice without leaving a dangling high surrogate at the cut
const safeSlice = (str: string, length: number): string => {
  const end = Math.max(length, 0);
  const cut = str.slice(0, end);
  return /[\uD800-\uDBFF]$/.test(cut) && end < str.length
    ? cut.slice(0, -1)
    : cut;
};

const truncatePath = (path: string, maxLength: number): string => {
  if (path.length <= maxLength) return path;
  if (maxLength <= 3) return safeSlice(path, maxLength);
  return `${safeSlice(path, maxLength - 3)}...`;
};

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

  // calculate max path length (reserving the domain and the "/" separator)
  const maxPathLength = maxLength - minDomainLength - 1;

  // Truncate path
  const truncatedPath = truncatePath(path, maxPathLength);

  // Truncate domain if necessary, preserving TLD
  const truncatedDomain = truncateDomain(
    domain,
    maxLength - truncatedPath.length - 1
  );

  return safeSlice(`${truncatedDomain}/${truncatedPath}`, maxLength);
};
