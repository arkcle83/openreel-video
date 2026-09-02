import type { SubtitleWord } from "@openreel/core";

export interface SocialCaptionCue {
  readonly text: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly words: SubtitleWord[];
}

export interface SocialEmojiCue {
  readonly emoji: string;
  readonly startTime: number;
  readonly duration: number;
}

const EMPHASIS_EMOJIS: ReadonlyArray<{ readonly match: RegExp; readonly emoji: string }> = [
  { match: /\b(confirm|confirmation|confirme|valide|validation)\b/i, emoji: "✅" },
  { match: /\b(argent|euro|euros|prix|cash|gagne|gagner)\b/i, emoji: "💸" },
  { match: /\b(attention|danger|risque|alerte)\b/i, emoji: "⚠️" },
  { match: /\b(feu|incroyable|dingue|enorme|énorme)\b/i, emoji: "🔥" },
  { match: /\b(amour|aime|coeur|cœur)\b/i, emoji: "❤️" },
];

export function groupCaptionWords(
  words: readonly SubtitleWord[],
  maxWordsPerCue: number,
): SocialCaptionCue[] {
  const size = Math.max(1, Math.floor(maxWordsPerCue));
  const usableWords = words.filter(
    (word) => word.text.trim().length > 0 && word.endTime > word.startTime,
  );
  const cues: SocialCaptionCue[] = [];

  for (let index = 0; index < usableWords.length; index += size) {
    const cueWords = usableWords.slice(index, index + size);
    cues.push({
      text: cueWords.map((word) => word.text.trim()).join(" "),
      startTime: cueWords[0].startTime,
      endTime: cueWords[cueWords.length - 1].endTime,
      words: cueWords,
    });
  }

  return cues;
}

export function planSocialEmojis(
  cues: readonly SocialCaptionCue[],
  maxEmojis = 4,
  minimumGapSeconds = 3,
): SocialEmojiCue[] {
  const planned: SocialEmojiCue[] = [];
  for (const cue of cues) {
    if (planned.length >= maxEmojis) break;
    if (planned.length > 0 && cue.startTime - planned[planned.length - 1].startTime < minimumGapSeconds) {
      continue;
    }
    const match = EMPHASIS_EMOJIS.find((rule) => rule.match.test(cue.text));
    if (!match) continue;
    planned.push({
      emoji: match.emoji,
      startTime: cue.startTime,
      duration: Math.min(0.8, Math.max(0.45, cue.endTime - cue.startTime)),
    });
  }
  return planned;
}
