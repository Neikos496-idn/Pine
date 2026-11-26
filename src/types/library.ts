export type HistoricalEra =
  | 'Kerajaan Nusantara'
  | 'Jalur Rempah & Maritim'
  | 'Pergerakan Nasional'
  | 'Revolusi & Diplomasi';

export type FormatFilter = 'semua' | 'cetak' | 'pdf' | 'audiobook';

export interface BookChapter {
  id: string;
  number: string;
  title: string;
  summary: string;
  durationSeconds: number;
  paragraphs: string[];
  footnote: string;
}

export interface PrintEditionInfo {
  available: boolean;
  statusLabel: 'Tersedia di Rak' | 'Baca di Tempat' | 'Sedang Restorasi';
  copiesAvailable: number;
  totalCopies: number;
  shelfCode: string;
  readingRoom: string;
  bindingSpec: string;
  dimensions: string;
}

export interface PdfEditionInfo {
  available: boolean;
  fileSizeMb: number;
  pages: number;
  scanResolution: string;
  ocrIndexed: boolean;
  editionNote: string;
}

export interface AudiobookInfo {
  available: boolean;
  totalDurationLabel: string;
  totalMinutes: number;
  narrator: string;
  recordingStudio: string;
  bitRate: string;
}

export interface HistoricalBook {
  id: string;
  slug: string;
  accessionNumber: string;
  title: string;
  subtitle: string;
  author: string;
  authorYears: string;
  era: HistoricalEra;
  yearLabel: string;
  timelineYear: number;
  publisher: string;
  language: string;
  provenance: string;
  coverImage?: string;
  coverAlt: string;
  plateNumber: string;
  synopsis: string;
  pullQuote: string;
  pullQuoteSource: string;
  print: PrintEditionInfo;
  pdf: PdfEditionInfo;
  audiobook: AudiobookInfo;
  chapters: BookChapter[];
}

export interface PrintLoanRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  accessionNumber: string;
  shelfCode: string;
  readingRoom: string;
  borrowerName: string;
  borrowerEmail: string;
  pickupDate: string;
  dueDate: string;
  loanType: 'Pinjam Bawa Pulang' | 'Reservasi Ruang Baca';
  reservationCode: string;
  createdAt: string;
}

export type AccessTier = 'Pembaca Arsip Terbuka' | 'Peneliti Ruang Naskah Langka';

export interface LibraryAccessPass {
  memberName: string;
  memberEmail: string;
  affiliation: string;
  tier: AccessTier;
  solarCode: string;
  activatedAt: string;
}
