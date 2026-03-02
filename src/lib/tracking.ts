const RESERVED_KEYS = new Set(['sub1', 'sub2', 'sub3', 'sub4']);

export function getIncomingParams(search: string = window.location.search): URLSearchParams {
  return new URLSearchParams(search);
}

export function buildFinalRedirectUrl(args: {
  base: string;
  incoming: URLSearchParams;
  tgId?: number;
}): string {
  const { base, incoming, tgId } = args;
  const url = new URL(base);

  const sub1 = incoming.get('sub1') ?? '';
  const sub2 = incoming.get('sub2') ?? '';
  const sub3 = incoming.get('clickid') ?? '';
  const sub4 = tgId ? String(tgId) : '';

  url.searchParams.set('sub1', sub1);
  url.searchParams.set('sub2', sub2);
  url.searchParams.set('sub3', sub3);
  url.searchParams.set('sub4', sub4);

  for (const [key, value] of incoming.entries()) {
    if (RESERVED_KEYS.has(key)) continue;
    url.searchParams.append(key, value);
  }

  return url.toString();
}
