/**
 * Finds the longest word in a given text string
 * @param text - The text to analyze
 * @returns The longest word found in the text
 */
export const getLongestWord = (text?: string): string => {
  if (!text) {
    return '';
  }
  return text.split(' ').reduce((a, b) => a.length > b.length ? a : b);
};

/**
 * Returns the appropriate CSS class for text wrapping based on the longest word length
 * @param text - The text to analyze
 * @param threshold - The character length threshold (default: 26)
 * @returns 'break-all' if longest word exceeds threshold, otherwise 'break-words'
 */
export const getWordBreakClass = (text?: string, threshold: number = 26): string => {
  const longestWord = getLongestWord(text);
  return longestWord.length > threshold ? 'break-all' : 'break-words';
};
