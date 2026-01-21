/**
 * Preprocesses markdown content to ensure better rendering compatibility.
 * Specifically targets common AI output issues like missing newlines before tables and merged rows.
 */
export function preprocessMarkdown(content: string): string {
  if (!content) return '';

  let processed = content;

  // 1. Ensure a blank line before a table header (row starting with |)
  processed = processed.replace(/([^\n])\n(\|.*\|.*\|)/g, '\n\n$2');

  // 2. Fix Header -> Separator newline
  processed = processed.replace(/(\|\s*)\s+(\|[:\-])/g, '\n$2');

  // 3. Fix Separator -> Body newline
  processed = processed.replace(/([-:]\s*\|)\s+(\|)/g, '\n$2');

  // 4. 修复合并的表格行：将 "| |" 替换为 "|\n|"
  // 匹配模式：内容 | | 内容（两个连续的 | 表示新行的开始）
  // 例如：| 己丑... | | 庚寅... 需要拆分成两行
  processed = processed.replace(/\|\s{2,}\|\s*/g, '|\n|');

  // 5. 修复表格末尾多余的空格和竖线
  processed = processed.replace(/\|\s{10,}\|/g, '|');

  // 6. 确保每个表格行结尾都有换行
  processed = processed.replace(/(\|[^|\n]*\|)\s*(?=[^\|])/g, '$1\n');

  // 7. 移除表格中单独一行的空竖线（AI输出错误）
  processed = processed.replace(/^\|\s*$/gm, '');

  return processed;
}
