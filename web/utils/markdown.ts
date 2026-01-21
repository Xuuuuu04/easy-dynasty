/**
 * Preprocesses markdown content to ensure better rendering compatibility.
 * Specifically targets common AI output issues like missing newlines before tables.
 */
export function preprocessMarkdown(content: string): string {
  if (!content) return '';

  let processed = content;

  // 1. Ensure a blank line before a table header (row starting with |)
  // Look for a newline, followed by a pipe, but NOT preceded by a newline (i.e., single newline)
  // We use a negative lookbehind (or simulated) to check it's not already \n\n
  // simpler: replace `\n|` with `\n\n|` if it follows a non-newline char.

  // Actually, we can just strictly enforce double newline before a table block.
  
  // Regex: find a line starting with |, which is NOT inside a code block (hard to detect with simple regex)
  // But generally, for our use case, ensuring \n\n| for the header row is safe enough if we assume AI doesn't write pipe-starting lines in normal text often.
  
  // Pattern: (non-newline char) \n (pipe)
  processed = processed.replace(/([^\n])\n(\|.*\|.*\|)/g, '$1\n\n$2');

  // 2. Fix cases where AI puts the table separator on the same line (rare but possible)
  // e.g. | Header | |---| 
  // processed = processed.replace(/(\|)\s*(\|[:\-])/g, '$1\n$2');

  return processed;
}
