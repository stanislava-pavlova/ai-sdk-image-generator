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

/**
 * Parses Bulgarian text into sentences, handling abbreviations correctly
 */
export function parseTextIntoSentences(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Normalize whitespace and remove excessive spacing
  const normalizedText = text.replace(/\s+/g, " ").trim();

  // Split on sentence delimiters while preserving the delimiters
  const preliminarySentences = normalizedText.split(/([.!?…]+)/);

  const sentences: string[] = [];
  let currentSentence = "";

  for (let i = 0; i < preliminarySentences.length; i++) {
    const part = preliminarySentences[i];

    if (part.match(/^[.!?…]+$/)) {
      // This is a delimiter
      currentSentence += part;

      // Check if the previous text ends with a Bulgarian abbreviation
      const textBeforePunctuation = currentSentence
        .substring(0, currentSentence.length - part.length)
        .trim();
      const isAbbreviation = isEndingWithBulgarianAbbreviation(
        textBeforePunctuation
      );

      // If it's not an abbreviation or it's an ellipsis/multiple punctuation, end the sentence
      if (
        !isAbbreviation ||
        part.length > 1 ||
        part.includes("!") ||
        part.includes("?") ||
        part.includes("…")
      ) {
        if (currentSentence.trim().length > 0) {
          sentences.push(currentSentence.trim());
          currentSentence = "";
        }
      }
    } else {
      // This is text content
      currentSentence += part;
    }
  }

  // Add any remaining content as the last sentence
  if (currentSentence.trim().length > 0) {
    sentences.push(currentSentence.trim());
  }

  return sentences.filter((s) => s.length > 0);
}

/**
 * Checks if text ends with a Bulgarian abbreviation
 */
function isEndingWithBulgarianAbbreviation(text: string): boolean {
  const trimmed = text.trim().toLowerCase();

  for (const abbr of BULGARIAN_ABBREVIATIONS) {
    if (trimmed.endsWith(abbr.toLowerCase())) {
      return true;
    }
  }

  return false;
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
  allWords: string[]
): string {
  if (windowWords.length === 0) {
    return "";
  }

  // Find the position of the window in the original text
  const windowStart = allWords.findIndex(
    (word) => word.toLowerCase() === windowWords[0].toLowerCase()
  );

  if (windowStart === -1) {
    // Fallback: just join the window words
    return windowWords.join(" ") + ".";
  }

  // Find sentences that intersect with this window
  const relevantSentences: {
    sentence: string;
    overlap: number;
    index: number;
    intersectionWords: number;
  }[] = [];
  let wordPosition = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceWords = tokenizeText(sentence);
    const sentenceStart = wordPosition;
    const sentenceEnd = wordPosition + sentenceWords.length;
    const windowEnd = windowStart + windowWords.length;

    // Check if sentence intersects with window
    const intersectionStart = Math.max(sentenceStart, windowStart);
    const intersectionEnd = Math.min(sentenceEnd, windowEnd);
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

    wordPosition += sentenceWords.length;
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
  const selectedSentences: string[] = [];
  let coveredWords = 0;

  for (const { sentence, intersectionWords } of relevantSentences) {
    selectedSentences.push(sentence);
    coveredWords += intersectionWords;

    // Stop if we have good coverage or too many sentences
    if (
      coveredWords >= windowWords.length * 0.8 ||
      selectedSentences.length >= 3
    ) {
      break;
    }
  }

  if (selectedSentences.length > 0) {
    return selectedSentences.join(" ");
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

  for (let i = 0; i < windows.length; i++) {
    const windowWords = windows[i];
    const segmentText = createSegmentFromWindow(
      windowWords,
      sentences,
      allWords
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
