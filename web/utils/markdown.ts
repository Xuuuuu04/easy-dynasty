/**
 * Preprocesses markdown content to ensure proper rendering
 * Handles streaming AI responses and ensures tables are properly formatted
 */
export function preprocessMarkdown(content: string): string {
    if (!content) return ''

    let processed = content

    // Fix table formatting issues
    processed = fixMarkdownTables(processed)

    // Ensure proper line breaks
    processed = processed.replace(/\n{3,}/g, '\n\n')

    return processed
}

/**
 * Fixes common markdown table formatting issues from AI responses
 * Handles incomplete tables during streaming and malformed tables
 */
function fixMarkdownTables(content: string): string {
    const lines = content.split('\n')
    const result: string[] = []
    let inTable = false
    let tableBuffer: string[] = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Check if this line looks like a table row (has pipes)
        const isPotentialTableRow = line.includes('|') && line.split('|').length >= 3

        if (isPotentialTableRow) {
            if (!inTable) {
                inTable = true
                tableBuffer = []
            }
            tableBuffer.push(line)
        } else {
            // Not a table row
            if (inTable) {
                // Process the accumulated table
                result.push(...processTableBuffer(tableBuffer))
                tableBuffer = []
                inTable = false
            }
            result.push(lines[i]) // Keep original line with whitespace
        }
    }

    // Handle remaining table buffer
    if (inTable && tableBuffer.length > 0) {
        result.push(...processTableBuffer(tableBuffer))
    }

    return result.join('\n')
}

/**
 * Processes a table buffer to ensure proper markdown table format
 */
function processTableBuffer(tableLines: string[]): string[] {
    if (tableLines.length === 0) return []

    // Clean up table lines
    const cleanedLines = tableLines.map(line => {
        // Remove leading/trailing pipes if doubled
        let cleaned = line.trim()

        // Ensure the line starts and ends with single pipe
        if (!cleaned.startsWith('|')) cleaned = '|' + cleaned
        if (!cleaned.endsWith('|')) cleaned = cleaned + '|'

        // Remove double pipes
        cleaned = cleaned.replace(/\|\|+/g, '|')

        return cleaned
    })

    // Check if we need to add a separator row
    const hasSeparator = cleanedLines.some(line =>
        /^\|[\s\-:|]+\|$/.test(line) && line.includes('-')
    )

    if (cleanedLines.length === 1 && !hasSeparator) {
        // Single line, likely a header without separator
        const headerCols = cleanedLines[0].split('|').filter(c => c.trim()).length
        const separator = '|' + Array(headerCols).fill('---').join('|') + '|'
        return [cleanedLines[0], separator]
    }

    if (cleanedLines.length >= 2 && !hasSeparator) {
        // Multiple lines but no separator - assume first line is header
        const headerCols = cleanedLines[0].split('|').filter(c => c.trim()).length
        const separator = '|' + Array(headerCols).fill('---').join('|') + '|'
        return [cleanedLines[0], separator, ...cleanedLines.slice(1)]
    }

    // Ensure consistent column count
    const allRows = cleanedLines
    const maxCols = Math.max(...allRows.map(row =>
        row.split('|').filter(c => c.trim()).length
    ))

    const normalizedRows = allRows.map((row, idx) => {
        const cells = row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1)

        // Check if this is a separator row
        const isSeparator = /^[\s\-:|]+$/.test(cells.join(''))

        if (isSeparator) {
            // Ensure separator has correct number of columns
            const sepCells = Array(maxCols).fill('---')
            return '|' + sepCells.join('|') + '|'
        }

        // Pad cells to match max columns
        while (cells.length < maxCols) {
            cells.push('')
        }

        // Trim extra columns
        const trimmedCells = cells.slice(0, maxCols)

        return '|' + trimmedCells.map(c => ` ${c.trim()} `).join('|') + '|'
    })

    return ['', ...normalizedRows, ''] // Add blank lines before and after table
}
