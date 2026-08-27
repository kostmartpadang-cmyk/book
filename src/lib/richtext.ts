// Shared helpers for rich-text chapter content (bold/italic/underline/strikethrough).
// Content is rendered with dangerouslySetInnerHTML for any reader of a published
// story, so sanitizeHtml() must run on every write path — no external sanitizer
// lib is installed, so the allowlist is kept deliberately narrow (no attributes
// at all) rather than trying to safely handle hrefs/styles/etc.

const ALLOWED_TAGS = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike']);
const VOID_TAGS = new Set(['br']);

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  let html = input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, '');

  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tagName: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    if (VOID_TAGS.has(tag)) return '<br>';
    const isClosing = match.startsWith('</');
    return isClosing ? `</${tag}>` : `<${tag}>`;
  });

  return html;
}

export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Convert stored content (legacy plain text, or sanitized HTML) into paragraph
// HTML suitable for editing/rendering.
export function contentToParagraphsHtml(content: string): string {
  if (!content || !content.trim()) return '<p><br></p>';
  if (isHtmlContent(content)) return sanitizeHtml(content);
  const blocks = content.split(/\n+/).filter((p) => p.trim().length > 0);
  if (blocks.length === 0) return '<p><br></p>';
  return blocks.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
}

// Array of per-paragraph innerHTML, for rendering and pagination.
export function extractParagraphBlocks(content: string): string[] {
  const html = contentToParagraphsHtml(content);
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html
      .split(/<p[^>]*>/i)
      .map((s) => s.replace(/<\/p>\s*$/i, '').trim())
      .filter(Boolean);
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('p'))
    .map((p) => p.innerHTML.trim())
    .filter((h) => h.length > 0 && h !== '<br>');
}

export function stripHtml(html: string): string {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function countWords(content: string): number {
  const text = stripHtml(content).trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export function isContentEmpty(content: string): boolean {
  return countWords(content) === 0;
}
