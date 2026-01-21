/**
 * Preprocesses markdown content to ensure better rendering compatibility.
 * Specifically targets common AI output issues like missing newlines before tables and merged rows.
 */
export function preprocessMarkdown(content: string): string {
  if (!content) return '';

  let processed = content;

  // 1. Ensure a blank line before a table header (row starting with |)
  // Look for a newline, followed by a pipe, but NOT preceded by a newline (i.e., single newline)
  processed = processed.replace(/([^\n])\n(\|.*\|.*\|)/g, '\n\n$2');

  // 2. Fix Header -> Separator newline
  // Pattern: | Header | |---|
  processed = processed.replace(/(\|\s*)\s+(\|[:\-])/g, '\n$2');

  // 3. Fix Separator -> Body newline
  // Pattern: |---| | Body |
  // Look for separator chars followed by pipe, then space, then pipe
  processed = processed.replace(/([-:]\s*\|)\s+(\|)/g, '\n$2');

  // 4. Aggressively split body rows that are merged on one line
  // Pattern: | text | | text | (where | | implies new row)
  // We use a lookbehind-ish approach: | followed by space followed by |
  // This might break empty cells like | | but it's a necessary tradeoff if AI outputs broken tables.
  // To be safer, we only do this if the preceding char is NOT a pipe (so | | | | is safe-ish)
  // Actually, standard empty cell is | |. Broken row is | content | | content |.
  // So: Pipe + Space + Pipe.
  // We replace " | | " with " |\n| "
  // Warning: This breaks empty cells containing a single space.
  // But given the user's issue, this is the most likely fix for the "minified" table.
  
  // Refined regex: Replace `| |` with `|\n|` ONLY IF it's likely a row separator.
  // In the user's example: `...忌辞职。 | | 庚寅...`
  // We can look for a pipe that has content before it, then space, then pipe.
  processed = processed.replace(/([^|])\s*(\|\s*\|)\s*([^|])/g, '\n$2$3');
  
  // Also handle the specific case of `| |` exactly
  processed = processed.replace(/\|\s+\|\s*\|/g, (match) => {
      // If we see 3 pipes `| | |`, it might be `| empty_cell |`.
      // If we see `| |`, it might be end of row + start of row.
      // Let's rely on the prompt fix primarily, but this helper adds newlines for | | patterns
      // that look suspicious.
      return match; 
  });
  
  // Final aggressive fix for the specific user artifact `| |`
  // Replace `| |` with `|\n|`
  processed = processed.replace(/\|\s+\|\s*(?=[^|\n])/g, '|\n|');

  return processed;
}
