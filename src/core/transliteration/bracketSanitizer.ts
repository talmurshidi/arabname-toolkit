export interface BracketFix {
  type: 'stray-open' | 'stray-close' | 'well-formed-stripped' | 'well-formed-content-removed';
  bracketChar: string;
  contentPreview: string;
}

export interface BracketFixOptions {
  enabled: boolean;
  /**
   * What to do with well-formed, balanced brackets. Default 'preserve':
   * leave delimiters and content untouched, transliterate content
   * normally. Only 'strip-brackets-keep-content' or
   * 'remove-content-and-brackets' if the person explicitly asks for one.
   */
  wellFormedBrackets: 'preserve' | 'strip-brackets-keep-content' | 'remove-content-and-brackets';
}

export const DEFAULT_BRACKET_FIX_OPTIONS: BracketFixOptions = {
  enabled: true,
  wellFormedBrackets: 'preserve'
};

interface BracketDef {
  open: string;
  close: string;
}

const BRACKET_DEFS: BracketDef[] = [
  { open: '[', close: ']' },
  { open: '(', close: ')' },
  { open: '{', close: '}' }
];

function truncatePreview(text: string): string {
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

/**
 * Repairs stray/unmatched brackets (`(`, `[`, `{` with no counterpart
 * anywhere in the string) by stripping the orphan character only.
 * Well-formed, balanced brackets are left completely alone by default —
 * their delimiters and content are genuine scholarly notation (variant
 * readings, editorial glosses) and must survive untouched. `enabled:
 * false` disables even the stray-bracket repair.
 */
export function sanitizeBrackets(
  input: string,
  options?: Partial<BracketFixOptions>
): { text: string; fixes: BracketFix[] } {
  const merged: BracketFixOptions = { ...DEFAULT_BRACKET_FIX_OPTIONS, ...options };

  if (!input || !merged.enabled) {
    return { text: input ?? '', fixes: [] };
  }

  const fixes: BracketFix[] = [];
  const openChars = new Set(BRACKET_DEFS.map((d) => d.open));
  const closeToDef = new Map(BRACKET_DEFS.map((d) => [d.close, d]));
  const openToDef = new Map(BRACKET_DEFS.map((d) => [d.open, d]));

  type StackEntry = { def: BracketDef; startIndex: number };
  const stack: StackEntry[] = [];
  const chars = Array.from(input);
  const output: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i] ?? '';
    if (openChars.has(ch)) {
      stack.push({ def: openToDef.get(ch)!, startIndex: output.length });
      output.push(ch);
      continue;
    }
    if (closeToDef.has(ch)) {
      const def = closeToDef.get(ch)!;
      let matchIdx = -1;
      for (let s = stack.length - 1; s >= 0; s--) {
        if (stack[s]?.def === def) {
          matchIdx = s;
          break;
        }
      }
      if (matchIdx === -1) {
        fixes.push({
          type: 'stray-close',
          bracketChar: ch,
          contentPreview: truncatePreview(output.slice(-40).join(''))
        });
        continue;
      }
      while (stack.length - 1 > matchIdx) {
        const inner = stack.pop()!;
        fixes.push({
          type: 'stray-open',
          bracketChar: inner.def.open,
          contentPreview: truncatePreview(output.slice(inner.startIndex).join(''))
        });
      }
      const entry = stack.pop()!;

      if (merged.wellFormedBrackets === 'preserve') {
        output.push(ch);
        continue;
      }

      const content = output.slice(entry.startIndex + 1).join('');
      fixes.push({
        type:
          merged.wellFormedBrackets === 'remove-content-and-brackets'
            ? 'well-formed-content-removed'
            : 'well-formed-stripped',
        bracketChar: entry.def.open + entry.def.close,
        contentPreview: truncatePreview(content)
      });
      if (merged.wellFormedBrackets === 'remove-content-and-brackets') {
        output.length = entry.startIndex;
      } else {
        output.splice(entry.startIndex, 1);
      }
      continue;
    }
    output.push(ch);
  }

  while (stack.length > 0) {
    const entry = stack.pop()!;
    fixes.push({
      type: 'stray-open',
      bracketChar: entry.def.open,
      contentPreview: truncatePreview(output.slice(entry.startIndex).join(''))
    });
    output.splice(entry.startIndex, 1);
  }

  let text = output.join('');
  text = text.replace(/ {2,}/g, ' ').trim();

  return { text, fixes };
}
