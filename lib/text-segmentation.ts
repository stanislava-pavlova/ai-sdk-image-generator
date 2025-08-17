// Bulgarian text segmentation utilities

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

// Common Bulgarian abbreviations that should not trigger sentence splits
const BULGARIAN_ABBREVIATIONS = new Set([
  "т.н.",
  "т.е.",
  "напр.",
  "пр.",
  "др.",
  "проф.",
  "ул.",
  "бул.",
  "пл.",
  "кв.",
  "ет.",
  "стр.",
  "сп.",
  "вж.",
  "срв.",
  "относ.",
  "съотв.",
  "понаст.",
  "извед.",
  "изд.",
  "том.",
  "кн.",
  "г.",
  "в.",
  "м.",
  "км.",
  "см.",
  "мм.",
  "кг.",
  "гр.",
  "мг.",
  "л.",
  "мл.",
  "ч.",
  "мин.",
  "сек.",
]);

const isLowercaseLetter = (ch: string): boolean => /[a-zа-я]/.test(ch);

// Build a list of abbreviation endings that actually end with a dot
const dotAbbreviations = Array.from(BULGARIAN_ABBREVIATIONS)
  .filter((abbr) => abbr.endsWith("."))
  .sort((a, b) => b.length - a.length) // match longer first (e.g., "т.е." before "г.")
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
 * Parses Bulgarian text into sentences, handling abbreviations and context around dots
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
        // - If next is a lowercase letter (e.g., continuation like "пр. залез"), don't end
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
 * Creates sliding windows of specified size with specified step
 */
export function createSlidingWindows(
  words: string[],
  windowSize: number = 25,
  step: number = 25
): string[][] {
  if (words.length === 0) {
    return [];
  }

  const windows: string[][] = [];

  for (let i = 0; i < words.length; i += step) {
    const window = words.slice(i, i + windowSize);
    if (window.length > 0) {
      windows.push(window);
    }
  }

  return windows;
}

/**
 * Calculates word overlap between a sentence and a window
 */
function calculateWordOverlap(sentence: string, windowWords: string[]): number {
  const sentenceWords = tokenizeText(sentence.toLowerCase());
  const windowWordsLower = windowWords.map((w) => w.toLowerCase());

  let overlap = 0;
  for (const word of sentenceWords) {
    if (windowWordsLower.includes(word)) {
      overlap++;
    }
  }

  return overlap;
}

/**
 * Creates a meaningful text segment from a window of words
 */
function createSegmentFromWindow(
  windowWords: string[],
  sentences: string[],
  sentenceWordRanges: { index: number; start: number; end: number }[],
  windowStart: number,
  windowEnd: number
): string {
  if (windowWords.length === 0) {
    return "";
  }

  // Find sentences that intersect with this window
  const relevantSentences: {
    sentence: string;
    overlap: number;
    index: number;
    intersectionWords: number;
  }[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const range = sentenceWordRanges[i];
    const sentenceStart = range.start;
    const sentenceEnd = range.end + 1; // end is inclusive in range, +1 for half-open interval

    // Check if sentence intersects with window
    const intersectionStart = Math.max(sentenceStart, windowStart);
    const intersectionEnd = Math.min(sentenceEnd, windowEnd + 1);
    const intersectionWords = Math.max(0, intersectionEnd - intersectionStart);

    if (intersectionWords > 0) {
      const overlap = calculateWordOverlap(sentence, windowWords);
      relevantSentences.push({
        sentence,
        overlap,
        index: i,
        intersectionWords,
      });
    }
  }

  if (relevantSentences.length === 0) {
    // No intersecting sentences, create a segment from the window words
    return windowWords.join(" ") + ".";
  }

  // Sort by intersection words (descending) to prioritize sentences that contribute most to the window
  relevantSentences.sort((a, b) => b.intersectionWords - a.intersectionWords);

  // Strategy 1: If one sentence covers most of the window (>70%), use it
  const primarySentence = relevantSentences[0];
  if (primarySentence.intersectionWords >= windowWords.length * 0.7) {
    return primarySentence.sentence;
  }

  // Strategy 2: Combine sentences that together cover the window well
  const selected: { index: number; sentence: string; intersectionWords: number }[] = [];
  let coveredWords = 0;

  for (const { index, sentence, intersectionWords } of relevantSentences) {
    selected.push({ index, sentence, intersectionWords });
    coveredWords += intersectionWords;

    // Stop if we have good coverage or too many sentences
    if (coveredWords >= windowWords.length * 0.8 || selected.length >= 3) {
      break;
    }
  }

  if (selected.length > 0) {
    // Preserve original order
    return selected
      .sort((a, b) => a.index - b.index)
      .map((s) => s.sentence)
      .join(" ");
  }

  // Fallback: use the sentence with the most intersection
  return primarySentence.sentence;
}

/**
 * Main function to segment Bulgarian text into windows and create representative text segments
 */
export function segmentBulgarianText(
  text: string,
  windowSize: number = 25,
  step: number = 25
): WindowSelection[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Parse text into sentences
  const sentences = parseTextIntoSentences(text);

  if (sentences.length === 0) {
    return [];
  }

  // Tokenize entire text
  const allWords = tokenizeText(text);

  if (allWords.length === 0) {
    return [];
  }

  // Create sliding windows
  const windows = createSlidingWindows(allWords, windowSize, step);

  // Create meaningful segments for each window
  const selections: WindowSelection[] = [];

  // Pre-compute sentence word ranges (start/end indices in the tokenized allWords array)
  const sentenceWordRanges: { index: number; start: number; end: number }[] = [];
  let cursor = 0;
  for (let i = 0; i < sentences.length; i++) {
    const count = tokenizeText(sentences[i]).length;
    const start = cursor;
    const end = Math.max(start + count - 1, start);
    sentenceWordRanges.push({ index: i, start, end });
    cursor += count;
  }

  for (let i = 0; i < windows.length; i++) {
    const windowWords = windows[i];
    const windowStart = i * step;
    const windowEnd = windowStart + windowWords.length - 1;
    const segmentText = createSegmentFromWindow(
      windowWords,
      sentences,
      sentenceWordRanges,
      windowStart,
      windowEnd
    );

    if (segmentText) {
      selections.push({
        selectedSentence: segmentText,
        windowWords: windowWords,
        windowIndex: i,
        sentenceIndex: -1, // Not applicable for combined segments
        overlap: windowWords.length, // Full window coverage
        distanceFromCenter: 0, // Not applicable
      });
    }
  }

  return selections;
}
