const LATVIAN_MAP: Record<string, string> = {
  ā: 'a', č: 'c', ē: 'e', ģ: 'g', ī: 'i',
  ķ: 'k', ļ: 'l', ņ: 'n', š: 's', ū: 'u', ž: 'z',
  Ā: 'a', Č: 'c', Ē: 'e', Ģ: 'g', Ī: 'i',
  Ķ: 'k', Ļ: 'l', Ņ: 'n', Š: 's', Ū: 'u', Ž: 'z',
}

export function slugify(text: string): string {
  return text
    .split('')
    .map((c) => LATVIAN_MAP[c] ?? c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
