import { graphemes } from '@/lib/graphemes';
import { isEssay } from './kind';
import type { Post } from './types';

/** Longest URL segment, in UTF-8 bytes. Malayalam letters take 3 bytes each, and file names are limited to 255 bytes. */
const MAX_SLUG_BYTES = 180;
const byteLength = (text: string) => new TextEncoder().encode(text).length;

/**
 * Turns a (Malayalam or English) title into a URL segment, keeping Unicode letters and marks.
 * Long titles are shortened at a word boundary, so very long titles still produce a valid address.
 */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[​-‍﻿]/g, '') // zero-width joiners used in Malayalam chillu forms
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  if (byteLength(slug) <= MAX_SLUG_BYTES) return slug;

  // Keep whole words while they fit.
  const words = slug.split('-');
  let result = '';
  for (const word of words) {
    const next = result ? `${result}-${word}` : word;
    if (byteLength(next) > MAX_SLUG_BYTES) break;
    result = next;
  }
  if (result) return result;

  // A single enormous word: cut it between grapheme clusters, never inside one.
  result = '';
  for (const { segment } of graphemes.segment(slug)) {
    if (byteLength(result + segment) > MAX_SLUG_BYTES) break;
    result += segment;
  }
  return result;
}

/** The URL segment of a post: an essay's `slug` (or one made from its title), a scribble's file name. */
export function postSlug(post: Post): string {
  return isEssay(post) ? (post.data.slug ?? slugify(post.data.title!)) : post.id;
}
