import { describe, expect, it } from "vitest";
import { groupCaptionWords, planSocialEmojis } from "./social-captions";

describe("social captions", () => {
  it("groups real word timestamps without inventing new timing", () => {
    const cues = groupCaptionWords(
      [
        { text: "La", startTime: 1, endTime: 1.2 },
        { text: "confirmation", startTime: 1.2, endTime: 1.7 },
        { text: "est", startTime: 1.7, endTime: 1.9 },
        { text: "là", startTime: 1.9, endTime: 2.1 },
      ],
      2,
    );

    expect(cues).toEqual([
      expect.objectContaining({
        text: "La confirmation",
        startTime: 1,
        endTime: 1.7,
      }),
      expect.objectContaining({
        text: "est là",
        startTime: 1.7,
        endTime: 2.1,
      }),
    ]);
  });

  it("adds only spaced emphasis emojis for matched words", () => {
    const emojis = planSocialEmojis([
      { text: "Confirmation validée", startTime: 0, endTime: 0.6, words: [] },
      { text: "C'est énorme", startTime: 1, endTime: 1.5, words: [] },
      { text: "Il y a un risque", startTime: 4, endTime: 4.7, words: [] },
      { text: "Encore du cash", startTime: 8, endTime: 8.7, words: [] },
    ]);

    expect(emojis).toEqual([
      expect.objectContaining({ emoji: "✅", startTime: 0 }),
      expect.objectContaining({ emoji: "⚠️", startTime: 4 }),
      expect.objectContaining({ emoji: "💸", startTime: 8 }),
    ]);
  });
});
