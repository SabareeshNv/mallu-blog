/**
 * Splits text into user-perceived characters. A Malayalam conjunct is several code points; cutting text
 * between them would break the letter, so anything that shortens text works on these units.
 */
export const graphemes = new Intl.Segmenter('ml', { granularity: 'grapheme' });
