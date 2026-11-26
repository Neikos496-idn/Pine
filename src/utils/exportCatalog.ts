import { HistoricalBook } from '../types/library';

export function downloadCatalogJson(books: HistoricalBook[]): void {
  const payload = {
    library: 'Katarsis — Perpustakaan Digital Sejarah',
    exportedAt: new Date().toISOString(),
    totalVolumes: books.length,
    catalog: books.map((b) => ({
      accessionNumber: b.accessionNumber,
      title: b.title,
      subtitle: b.subtitle,
      author: b.author,
      era: b.era,
      yearLabel: b.yearLabel,
      publisher: b.publisher,
      language: b.language,
      formats: {
        print: {
          available: b.print.available,
          copiesAvailable: b.print.copiesAvailable,
          shelfCode: b.print.shelfCode,
          readingRoom: b.print.readingRoom,
        },
        pdf: {
          available: b.pdf.available,
          pages: b.pdf.pages,
          fileSizeMb: b.pdf.fileSizeMb,
        },
        audiobook: {
          available: b.audiobook.available,
          duration: b.audiobook.totalDurationLabel,
          narrator: b.audiobook.narrator,
        },
      },
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'katalog-katarsis.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCatalogBibtex(books: HistoricalBook[]): void {
  const entries = books
    .map((b) => {
      const key = b.slug.replace(/-/g, '_');
      return `@book{${key},
  title     = {${b.title}: ${b.subtitle}},
  author    = {${b.author}},
  year      = {${b.timelineYear}},
  publisher = {${b.publisher}},
  note      = {${b.accessionNumber} | Format: ${[
        b.print.available ? 'Cetak' : null,
        b.pdf.available ? 'PDF' : null,
        b.audiobook.available ? 'Audiobook' : null,
      ]
        .filter(Boolean)
        .join(', ')}}
}`;
    })
    .join('\n\n');

  const blob = new Blob([entries], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitasi-katarsis.bib';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
