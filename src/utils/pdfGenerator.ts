import { HistoricalBook } from '../types/library';

/**
 * Generates a valid multi-page PDF 1.4 document in pure TypeScript without external runtime dependencies.
 * Strips non-WinAnsi characters safely so the PDF renders cleanly in any PDF reader (Preview, Chrome, Adobe).
 */
function sanitizePdfText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = sanitizePdfText(text).split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!word) continue;
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface PdfLine {
  text: string;
  size: number;
  bold?: boolean;
  spacingAfter?: number;
}

export function downloadBookPdf(book: HistoricalBook): void {
  const lines: PdfLine[] = [];

  lines.push({ text: `KATARSIS - EDISI FAKSIMILI DIGITAL`, size: 9, bold: true, spacingAfter: 6 });
  lines.push({ text: `${book.accessionNumber}  |  ${book.era.toUpperCase()}`, size: 9, spacingAfter: 18 });

  for (const titleLine of wrapText(book.title, 48)) {
    lines.push({ text: titleLine, size: 18, bold: true, spacingAfter: 4 });
  }
  lines.push({ text: '', size: 8, spacingAfter: 4 });

  for (const subLine of wrapText(book.subtitle, 72)) {
    lines.push({ text: subLine, size: 11, spacingAfter: 3 });
  }
  lines.push({ text: '', size: 8, spacingAfter: 12 });

  lines.push({ text: `Penulis / Penyusun : ${book.author} (${book.authorYears})`, size: 10, bold: true, spacingAfter: 4 });
  lines.push({ text: `Tahun / Edisi      : ${book.yearLabel}`, size: 10, spacingAfter: 4 });
  lines.push({ text: `Penerbit           : ${book.publisher}`, size: 10, spacingAfter: 4 });
  lines.push({ text: `Bahasa Sumber      : ${book.language}`, size: 10, spacingAfter: 4 });
  lines.push({ text: `Provenans          : ${book.provenance}`, size: 10, spacingAfter: 14 });

  lines.push({ text: `RINGKASAN KURATORIAL`, size: 11, bold: true, spacingAfter: 6 });
  for (const synLine of wrapText(book.synopsis, 78)) {
    lines.push({ text: synLine, size: 10, spacingAfter: 4 });
  }
  lines.push({ text: '', size: 8, spacingAfter: 8 });

  lines.push({ text: `"${sanitizePdfText(book.pullQuote)}"`, size: 10, bold: true, spacingAfter: 4 });
  lines.push({ text: `-- ${book.pullQuoteSource}`, size: 9, spacingAfter: 16 });

  for (const chapter of book.chapters) {
    lines.push({ text: `${chapter.number} - ${chapter.title}`, size: 13, bold: true, spacingAfter: 6 });
    for (const para of chapter.paragraphs) {
      for (const pLine of wrapText(para, 78)) {
        lines.push({ text: pLine, size: 10, spacingAfter: 4 });
      }
      lines.push({ text: '', size: 6, spacingAfter: 6 });
    }
    for (const fnLine of wrapText(chapter.footnote, 84)) {
      lines.push({ text: fnLine, size: 8, spacingAfter: 3 });
    }
    lines.push({ text: '', size: 10, spacingAfter: 14 });
  }

  // Paginate lines into PDF pages (Letter/A4-like 595 x 842 pt)
  const pageHeight = 842;
  const topY = 780;
  const bottomY = 64;
  const pages: string[] = [];
  let currentCommands: string[] = [];
  let y = topY;

  const flushPage = (pageNum: number) => {
    currentCommands.push('BT');
    currentCommands.push('/F1 8 Tf');
    currentCommands.push('56 36 Td');
    currentCommands.push(`(Katarsis | ${sanitizePdfText(book.accessionNumber)} | Halaman ${pageNum}) Tj`);
    currentCommands.push('ET');
    pages.push(currentCommands.join('\n'));
    currentCommands = [];
    y = topY;
  };

  for (const line of lines) {
    const lineHeight = line.size + (line.spacingAfter ?? 4);
    if (y - lineHeight < bottomY) {
      flushPage(pages.length + 1);
    }
    if (line.text) {
      const font = line.bold ? '/F2' : '/F1';
      currentCommands.push('BT');
      currentCommands.push(`${font} ${line.size} Tf`);
      currentCommands.push(`56 ${y} Td`);
      currentCommands.push(`(${sanitizePdfText(line.text)}) Tj`);
      currentCommands.push('ET');
    }
    y -= lineHeight;
  }

  if (currentCommands.length > 0 || pages.length === 0) {
    flushPage(pages.length + 1);
  }

  // Assemble PDF objects
  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const catalogObjId = addObject(''); // 1
  const pagesObjId = addObject(''); // 2
  const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); // 3
  const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'); // 4

  const pageIds: number[] = [];
  for (const contentStream of pages) {
    const contentId = addObject(
      `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`
    );
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[catalogObjId - 1] = `<< /Type /Catalog /Pages ${pagesObjId} 0 R >>`;
  objects[pagesObjId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${book.slug}-katarsis.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
