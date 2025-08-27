// Text segmentation utilities

export interface TextSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
}

export interface WindowSelection {
  selectedSentence: string;
  windowWords: string[];
  windowIndex: number;
  sentenceIndex: number;
  overlap: number;
  distanceFromCenter: number;
}

// Common English abbreviations that should not trigger sentence splits
const ENGLISH_ABBREVIATIONS = new Set([
  // General
  "e.g.",
  "i.e.",
  "etc.",
  "vs.",
  "cf.",
  // Titles
  "mr.",
  "mrs.",
  "ms.",
  "dr.",
  "prof.",
  "sr.",
  "jr.",
  "st.",
  // Time
  "a.m.",
  "p.m.",
  // Measurements and numbering
  "no.",
  "fig.",
  "eq.",
  // Months
  "jan.",
  "feb.",
  "mar.",
  "apr.",
  "jun.",
  "jul.",
  "aug.",
  "sep.",
  "sept.",
  "oct.",
  "nov.",
  "dec.",
  // Degrees
  "ph.d.",
  "m.d.",
  "b.s.",
  "m.s.",
]);

const isLowercaseLetter = (ch: string): boolean => /[a-z]/.test(ch);

// Build a list of abbreviation endings that actually end with a dot
const dotAbbreviations = Array.from(ENGLISH_ABBREVIATIONS)
  .filter((abbr) => abbr.endsWith("."))
  .sort((a, b) => b.length - a.length) // match longer first (e.g., "ph.d." before "d.")
  .map((abbr) => abbr.toLowerCase());

const isClosingWrapper = (ch: string): boolean => {
  return (
    ch === '"' ||
    ch === "'" ||
    ch === "“" ||
    ch === "”" ||
    ch === "„" ||
    ch === ")" ||
    ch === "]" ||
    ch === "»" ||
    ch === "›"
  );
};

/**
 * Parses text into sentences, handling abbreviations and context around dots
 */
export function parseTextIntoSentences(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Normalize whitespace and remove excessive spacing
  const normalizedText = text.replace(/\s+/g, " ").trim();

  const sentences: string[] = [];
  let currentSentence = "";

  for (let i = 0; i < normalizedText.length; i++) {
    const ch = normalizedText[i];
    currentSentence += ch;

    const isTerminator = ch === "." || ch === "!" || ch === "?" || ch === "…";
    if (!isTerminator) {
      continue;
    }

    let shouldEnd = false;

    if (ch === "!" || ch === "?" || ch === "…") {
      shouldEnd = true;
    } else if (ch === ".") {
      const currentLower = currentSentence.toLowerCase();

      // Check if we end with a known abbreviation (including the dot we just appended)
      const endsWithKnownAbbreviation = dotAbbreviations.some((abbr) =>
        currentLower.endsWith(abbr)
      );

      if (endsWithKnownAbbreviation) {
        shouldEnd = false;
      } else {
        // Look ahead to the next significant character
        let j = i + 1;
        while (
          j < normalizedText.length &&
          (normalizedText[j] === " " || isClosingWrapper(normalizedText[j]))
        ) {
          j++;
        }

        const nextCh = j < normalizedText.length ? normalizedText[j] : "";

        // Heuristics:
        // - If next is a lowercase letter (e.g., continuation like "e.g. example"), don't end
        // - If next is a digit (e.g., decimals like 3.14), don't end
        // - Otherwise, end the sentence (e.g., space + uppercase or end-of-text)
        if (nextCh && (isLowercaseLetter(nextCh) || /[0-9]/.test(nextCh))) {
          shouldEnd = false;
        } else {
          shouldEnd = true;
        }
      }
    }

    if (shouldEnd) {
      const trimmed = currentSentence.trim();
      if (trimmed.length > 0) {
        sentences.push(trimmed);
      }
      currentSentence = "";
    }
  }

  const tail = currentSentence.trim();
  if (tail.length > 0) {
    sentences.push(tail);
  }

  return sentences.filter((s) => s.length > 0);
}

/**
 * Tokenizes text into words, removing punctuation and empty strings
 */
export function tokenizeText(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split on whitespace and filter out empty strings
  // Keep words with internal punctuation (like contractions)
  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

/**
 * Main function to segment text into windows while respecting sentence boundaries
 */
export function segmentText(text: string, targetWordsPerSegment: number = 25): WindowSelection[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Parse text into sentences first
  const sentences = parseTextIntoSentences(text);

  if (sentences.length === 0) {
    return [];
  }

  // Create segments by combining sentences to reach target word count
  const selections: WindowSelection[] = [];
  let currentSegmentSentences: string[] = [];
  let currentWordCount = 0;
  let segmentIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceWords = tokenizeText(sentence);
    const sentenceWordCount = sentenceWords.length;

    // Check if adding this sentence would make the segment too large
    const potentialWordCount = currentWordCount + sentenceWordCount;

    // If we have content and adding this sentence would exceed 1.4x target, finalize current segment
    if (currentSegmentSentences.length > 0 && potentialWordCount > targetWordsPerSegment * 1.4) {
      // Finalize current segment
      const segmentText = currentSegmentSentences.join(" ");
      const segmentWords = tokenizeText(segmentText);

      selections.push({
        selectedSentence: segmentText,
        windowWords: segmentWords,
        windowIndex: segmentIndex,
        sentenceIndex: -1,
        overlap: segmentWords.length,
        distanceFromCenter: 0,
      });

      segmentIndex++;
      currentSegmentSentences = [];
      currentWordCount = 0;
    }

    // Add current sentence to the segment
    currentSegmentSentences.push(sentence);
    currentWordCount += sentenceWordCount;

    // If we've reached the target size or this is the last sentence, finalize the segment
    if (currentWordCount >= targetWordsPerSegment || i === sentences.length - 1) {
      const segmentText = currentSegmentSentences.join(" ");
      const segmentWords = tokenizeText(segmentText);

      selections.push({
        selectedSentence: segmentText,
        windowWords: segmentWords,
        windowIndex: segmentIndex,
        sentenceIndex: -1,
        overlap: segmentWords.length,
        distanceFromCenter: 0,
      });

      segmentIndex++;
      currentSegmentSentences = [];
      currentWordCount = 0;
    }
  }

  return selections;
}
