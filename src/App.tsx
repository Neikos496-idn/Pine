import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Download,
  FileText,
  Headphones,
  Library,
  Play,
  Search,
} from 'lucide-react';
import {
  CATALOG_BOOKS,
  HERO_ARCHIVE_IMAGE,
  HISTORICAL_ERAS,
  READING_ROOMS,
} from './data/catalog';
import {
  FormatFilter,
  HistoricalBook,
  LibraryAccessPass,
  PrintLoanRecord,
} from './types/library';
import { downloadBookPdf } from './utils/pdfGenerator';
import { TopBar } from './components/TopBar';
import { BookCoverArt } from './components/BookCoverArt';
import { BookDetailModal } from './components/BookDetailModal';
import { PdfReaderModal } from './components/PdfReaderModal';
import { AudiobookPlayerBar } from './components/AudiobookPlayerBar';
import { PrintLoanModal } from './components/PrintLoanModal';
import { MyShelfDrawer } from './components/MyShelfDrawer';
import { GithubGuideModal } from './components/GithubGuideModal';
import { LibraryAccessModal } from './components/LibraryAccessModal';
import { PhainonSunLogo } from './components/PhainonSunLogo';

const STORAGE_SAVED_KEY = 'katarsis_saved_ids_v1';
const STORAGE_LOANS_KEY = 'katarsis_print_loans_v1';
const STORAGE_ACCESS_KEY = 'katarsis_access_pass_v1';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState<string>('Semua Era');
  const [selectedFormat, setSelectedFormat] = useState<FormatFilter>('semua');

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [printLoans, setPrintLoans] = useState<PrintLoanRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_LOANS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [accessPass, setAccessPass] = useState<LibraryAccessPass | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ACCESS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [detailBook, setDetailBook] = useState<HistoricalBook | null>(null);
  const [readerState, setReaderState] = useState<{
    book: HistoricalBook;
    chapterIndex: number;
  } | null>(null);
  const [loanBook, setLoanBook] = useState<HistoricalBook | null>(null);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);

  const [audioState, setAudioState] = useState<{
    book: HistoricalBook;
    chapterIndex: number;
    isPlaying: boolean;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LOANS_KEY, JSON.stringify(printLoans));
    } catch {
      // Ignore storage quota errors
    }
  }, [printLoans]);

  useEffect(() => {
    try {
      if (accessPass) {
        localStorage.setItem(STORAGE_ACCESS_KEY, JSON.stringify(accessPass));
      } else {
        localStorage.removeItem(STORAGE_ACCESS_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [accessPass]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  const getEffectivePrintCopies = (book: HistoricalBook) => {
    const activeCount = printLoans.filter((l) => l.bookId === book.id).length;
    return Math.max(0, book.print.copiesAvailable - activeCount);
  };

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return CATALOG_BOOKS.filter((book) => {
      const matchesEra = selectedEra === 'Semua Era' || book.era === selectedEra;

      const matchesFormat =
        selectedFormat === 'semua' ||
        (selectedFormat === 'cetak' && book.print.available) ||
        (selectedFormat === 'pdf' && book.pdf.available) ||
        (selectedFormat === 'audiobook' && book.audiobook.available);

      const matchesQuery =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.subtitle.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.accessionNumber.toLowerCase().includes(query) ||
        book.era.toLowerCase().includes(query);

      return matchesEra && matchesFormat && matchesQuery;
    });
  }, [searchQuery, selectedEra, selectedFormat]);

  const chronologicalBooks = useMemo(
    () => [...CATALOG_BOOKS].sort((a, b) => a.timelineYear - b.timelineYear),
    []
  );

  const audiobookBooks = useMemo(
    () => CATALOG_BOOKS.filter((b) => b.audiobook.available),
    []
  );

  const savedBooks = useMemo(
    () => CATALOG_BOOKS.filter((b) => savedIds.includes(b.id)),
    [savedIds]
  );

  const totalAvailablePrintCopies = useMemo(
    () =>
      CATALOG_BOOKS.reduce(
        (sum, book) => sum + (book.print.available ? getEffectivePrintCopies(book) : 0),
        0
      ),
    [printLoans]
  );

  const handleToggleSave = (bookId: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(bookId);
      const next = exists ? prev.filter((id) => id !== bookId) : [...prev, bookId];
      showToast(exists ? 'Dihapus dari Rak Saya' : 'Disimpan ke Rak Saya');
      return next;
    });
  };

  const handleDownloadPdf = (book: HistoricalBook) => {
    downloadBookPdf(book);
    showToast(`Mengunduh ${book.slug}-katarsis.pdf`);
  };

  const handleOpenReader = (book: HistoricalBook, chapterIndex = 0) => {
    setDetailBook(null);
    setShelfOpen(false);
    setReaderState({ book, chapterIndex });
  };

  const handlePlayAudio = (book: HistoricalBook, chapterIndex = 0) => {
    if (!book.audiobook.available) return;
    setDetailBook(null);
    setShelfOpen(false);
    setAudioState({ book, chapterIndex, isPlaying: true });
  };

  const handleConfirmLoan = (loan: PrintLoanRecord) => {
    setPrintLoans((prev) => [loan, ...prev]);
    showToast(`Reservasi cetak ${loan.reservationCode} berhasil dicatat`);
  };

  const handleCancelLoan = (loanId: string) => {
    setPrintLoans((prev) => prev.filter((l) => l.id !== loanId));
    showToast('Catatan peminjaman diperbarui');
  };

  return (
    <div className={`min-h-screen bg-[#FBF9F5] text-[#1C1917] ${audioState ? 'pb-20' : ''}`}>
      <TopBar
        savedCount={savedIds.length}
        activeLoanCount={printLoans.length}
        onOpenShelf={() => setShelfOpen(true)}
        onOpenGithubModal={() => setGithubModalOpen(true)}
      />

      <main>
        {/* 1. Institutional Hero & Operational Utility Strip */}
        <section id="beranda" className="border-b border-[#DED6C8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left editorial intro */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#9A6E1C] font-medium">
                    <PhainonSunLogo withHalo={false} className="w-4 h-4 text-[#B8862D] shrink-0" />
                    <span>Katarsis · Perpustakaan Digital Sejarah</span>
                  </div>
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-semibold text-[#1C1917] leading-[1.08] tracking-tight text-balance">
                    Pustaka Sejarah Nusantara dalam Tiga Format
                  </h1>
                  <p className="text-base text-[#57534E] leading-relaxed max-w-xl">
                    Menghimpun kronik maritim, prasasti tanah Jawa, pers pergerakan, dan arsip
                    diplomasi kemerdekaan di gerbang Katarsis. Setiap judul tersedia dengan status
                    eksemplar buku cetak, naskah PDF terindeks, serta rekaman audiobook bernarasi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#katalog"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-[#1D3557] text-[#FBF9F5] rounded-md hover:bg-[#152843] transition-colors whitespace-nowrap"
                  >
                    <span>Jelajahi Katalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setAccessModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border border-[#C89B3C] bg-[#F2EDE4] text-[#1C1917] rounded-md hover:bg-[#EBE5DA] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <PhainonSunLogo withHalo={false} className="w-4 h-4 text-[#B8862D]" />
                    <span>{accessPass ? `Kartu Surya (${accessPass.solarCode})` : 'Akses Segel Surya'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGithubModalOpen(true)}
                    className="text-sm font-medium text-[#1C1917] hover:text-[#1D3557] underline underline-offset-4 decoration-[#C9BFA9] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Panduan GitHub
                  </button>
                </div>
              </div>

              {/* Right architectural archive photograph */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="flex-1 min-h-[280px] sm:min-h-[360px] bg-[#EBE5DA] border border-[#DED6C8] overflow-hidden">
                  <img
                    src={HERO_ARCHIVE_IMAGE}
                    alt="Ruang baca utama perpustakaan sejarah dengan rak buku kayu jati dan lampu baca kuningan"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2.5 text-xs font-serif italic text-[#57534E]">
                  Ruang Baca Utama Katarsis — Koleksi monograf sejarah, naskah faksimili, dan arsip suara.
                </p>
              </div>
            </div>

            {/* 4-column Operational Utility & Format Inventory Strip */}
            <div className="mt-10 pt-6 border-t border-[#DED6C8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-[#78716C]">Gerbang Akses Pembaca</p>
                <button
                  type="button"
                  onClick={() => setAccessModalOpen(true)}
                  className="text-left text-sm font-medium text-[#1C1917] hover:text-[#1D3557] mt-1 inline-flex items-center gap-1.5 underline underline-offset-4 decoration-[#C89B3C] cursor-pointer"
                >
                  <PhainonSunLogo withHalo={false} className="w-3.5 h-3.5 text-[#B8862D] shrink-0" />
                  <span className="font-mono tabular-nums">
                    {accessPass ? `${accessPass.solarCode} · ${accessPass.memberName}` : 'Terbuka · Aktivasi Kartu Surya'}
                  </span>
                </button>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Ketersediaan Buku Cetak</p>
                <p className="text-sm font-medium text-[#1C1917] mt-1 font-mono tabular-nums">
                  {totalAvailablePrintCopies} Eksemplar Siap Pinjam
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Naskah Digital PDF</p>
                <p className="text-sm font-medium text-[#1C1917] mt-1 font-mono tabular-nums">
                  {CATALOG_BOOKS.filter((b) => b.pdf.available).length} Judul Terindeks OCR
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Koleksi Audiobook</p>
                <p className="text-sm font-medium text-[#1C1917] mt-1 font-mono tabular-nums">
                  {audiobookBooks.length} Judul Narasi Sejarah
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Katalog Pustaka Sejarah */}
        <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#DED6C8]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#7C4A1E] font-medium">
                01. Indeks Koleksi Utama
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-1.5">
                Katalog Pustaka Sejarah
              </h2>
            </div>

            {/* Search & Format Segmented Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, penulis, atau no. arsip..."
                  aria-label="Cari katalog buku sejarah"
                  className="w-full sm:w-72 pl-9 pr-3 py-2 text-sm bg-white border border-[#D6CEBE] rounded-md text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#1D3557]"
                />
              </div>

              <div
                role="group"
                aria-label="Saring berdasarkan format"
                className="inline-flex items-center p-1 bg-[#F2EDE4] border border-[#DED6C8] rounded-md overflow-x-auto"
              >
                {(
                  [
                    { id: 'semua', label: 'Semua' },
                    { id: 'cetak', label: 'Buku Cetak' },
                    { id: 'pdf', label: 'PDF' },
                    { id: 'audiobook', label: 'Audiobook' },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedFormat === fmt.id
                        ? 'bg-[#1D3557] text-[#FBF9F5]'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Era Filter Tabs */}
          <div className="py-5 flex items-center gap-2 overflow-x-auto border-b border-[#DED6C8]">
            <span className="text-xs text-[#78716C] mr-2 whitespace-nowrap shrink-0">
              Periode Sejarah:
            </span>
            {HISTORICAL_ERAS.map((era) => {
              const active = selectedEra === era;
              return (
                <button
                  key={era}
                  type="button"
                  onClick={() => setSelectedEra(era)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#EBE5DA] text-[#1C1917] border border-[#C9BFA9]'
                      : 'text-[#57534E] hover:text-[#1C1917] border border-transparent'
                  }`}
                >
                  {era}
                </button>
              );
            })}
          </div>

          {/* Catalog Grid */}
          {filteredBooks.length === 0 ? (
            <div className="my-12 border border-dashed border-[#D6CEBE] bg-[#F2EDE4]/50 p-10 text-center">
              <p className="font-serif text-2xl text-[#1C1917]">
                Tidak ada naskah yang sesuai dengan penyaringan Anda
              </p>
              <p className="text-sm text-[#57534E] mt-2">
                Coba ubah kata kunci pencarian atau pilih periode serta format yang lebih luas.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedEra('Semua Era');
                  setSelectedFormat('semua');
                }}
                className="mt-5 px-4 py-2 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] cursor-pointer"
              >
                Atur Ulang Penyaring
              </button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredBooks.map((book) => {
                const copiesLeft = getEffectivePrintCopies(book);
                return (
                  <article
                    key={book.id}
                    className="group flex flex-col justify-between border-b border-[#DED6C8] pb-8"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => setDetailBook(book)}
                        className="block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D3557]"
                      >
                        <div className="bg-[#F2EDE4] p-4 border border-[#DED6C8]">
                          <BookCoverArt book={book} className="aspect-[3/4] w-full" />
                        </div>

                        {/* Unboxed clean metadata with typographic separators */}
                        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57534E]">
                          <span className="font-mono text-[#7C4A1E]">{book.accessionNumber}</span>
                          <span aria-hidden="true">·</span>
                          <span>{book.era}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{book.timelineYear}</span>
                        </div>

                        <h3 className="mt-2 font-serif text-2xl font-semibold text-[#1C1917] leading-snug group-hover:text-[#1D3557] transition-colors">
                          {book.title}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-[#57534E]">{book.author}</p>
                        <p className="mt-3 text-sm text-[#44403C] leading-relaxed line-clamp-2">
                          {book.synopsis}
                        </p>
                      </button>

                      {/* 3-Format Availability Matrix (clean unboxed hairline rows) */}
                      <div className="mt-5 pt-4 border-t border-[#DED6C8] space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[#57534E]">
                            <Library className="w-3.5 h-3.5 text-[#7C4A1E]" />
                            Buku Cetak
                          </span>
                          <span className="font-mono tabular-nums text-[#1C1917]">
                            {book.print.available
                              ? `${copiesLeft} eks · Rak ${book.print.shelfCode}`
                              : 'Restorasi'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[#57534E]">
                            <FileText className="w-3.5 h-3.5 text-[#1D3557]" />
                            Naskah PDF
                          </span>
                          <span className="font-mono tabular-nums text-[#1C1917]">
                            {book.pdf.pages} hlm · {book.pdf.fileSizeMb.toFixed(1)} MB
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[#57534E]">
                            <Headphones className="w-3.5 h-3.5 text-[#7C4A1E]" />
                            Audiobook
                          </span>
                          <span className="font-mono tabular-nums text-[#1C1917]">
                            {book.audiobook.available
                              ? book.audiobook.totalDurationLabel
                              : 'Dalam Produksi'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct action row */}
                    <div className="mt-5 pt-4 border-t border-[#DED6C8] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenReader(book, 0)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Baca PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(book)}
                          aria-label={`Unduh PDF ${book.title}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#D6CEBE] bg-[#F2EDE4] text-[#1C1917] rounded hover:bg-[#EBE5DA] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </button>
                      </div>

                      {book.audiobook.available ? (
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(book, 0)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#7C4A1E] hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Dengar</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDetailBook(book)}
                          className="text-xs font-medium text-[#57534E] hover:text-[#1C1917] underline underline-offset-4 whitespace-nowrap cursor-pointer"
                        >
                          Detail Rak
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. Lini Masa Historiografi */}
        <section
          id="lini-masa"
          className="bg-[#F2EDE4] border-y border-[#DED6C8] py-14 lg:py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl pb-8">
              <p className="text-xs uppercase tracking-[0.18em] text-[#7C4A1E] font-medium">
                02. Kronologi Naskah
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-1.5">
                Lini Masa Pustaka Sejarah
              </h2>
              <p className="text-sm text-[#57534E] mt-2 leading-relaxed">
                Telusuri naskah berdasarkan urutan kurun waktu peristiwa, mulai dari prasasti abad
                ke-14 hingga rekaman siaran diplomasi kemerdekaan.
              </p>
            </div>

            <div className="divide-y divide-[#D6CEBE] border-y border-[#D6CEBE]">
              {chronologicalBooks.map((book) => (
                <div
                  key={book.id}
                  className="py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  <div className="md:col-span-2">
                    <span className="font-mono text-xl sm:text-2xl font-medium tabular-nums text-[#7C4A1E]">
                      {book.timelineYear}
                    </span>
                    <p className="text-xs text-[#57534E] mt-0.5">{book.era}</p>
                  </div>

                  <div className="md:col-span-6">
                    <button
                      type="button"
                      onClick={() => setDetailBook(book)}
                      className="text-left group cursor-pointer"
                    >
                      <h3 className="font-serif text-xl font-semibold text-[#1C1917] group-hover:text-[#1D3557] group-hover:underline underline-offset-4">
                        {book.title}
                      </h3>
                    </button>
                    <p className="text-xs text-[#57534E] mt-1">
                      {book.author} · {book.accessionNumber}
                    </p>
                  </div>

                  <div className="md:col-span-4 flex flex-wrap md:justify-end items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDetailBook(book)}
                      className="px-3 py-1.5 text-xs font-medium border border-[#C9BFA9] bg-[#FBF9F5] text-[#1C1917] rounded hover:bg-[#EBE5DA] whitespace-nowrap cursor-pointer"
                    >
                      Detail & Pinjam Cetak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReader(book, 0)}
                      className="px-3 py-1.5 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] whitespace-nowrap cursor-pointer"
                    >
                      Buka Naskah PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Ruang Dengar Sejarah (Audiobook Spotlight) */}
        <section
          id="ruang-dengar"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#7C4A1E] font-medium">
                03. Ruang Dengar Sejarah
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] leading-tight text-balance">
                Rekaman Narasi & Sejarah Lisan
              </h2>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Setiap edisi audiobook dibacakan lengkap per bab dengan kendali kecepatan narasi
                dan daftar isi interaktif, memudahkan peneliti menyimak sumber sejarah di mana saja.
              </p>

              <div className="pt-4 border-t border-[#DED6C8] space-y-2">
                <p className="text-xs uppercase tracking-widest text-[#78716C]">
                  Lokasi Layanan Ruang Baca Fisik
                </p>
                <ul className="space-y-1.5 text-xs text-[#57534E]">
                  {READING_ROOMS.map((room) => (
                    <li key={room}>{room}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-[#DED6C8] border-y border-[#DED6C8]">
              {audiobookBooks.map((book) => {
                const isCurrent = audioState?.book.id === book.id && audioState.isPlaying;
                return (
                  <div
                    key={book.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#57534E]">
                        <span className="font-mono text-[#7C4A1E]">{book.accessionNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>Narator: {book.audiobook.narrator}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {book.audiobook.totalDurationLabel}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#57534E]">
                        {book.chapters.length} bab audio siap putar
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isCurrent) {
                          setAudioState((prev) =>
                            prev ? { ...prev, isPlaying: false } : null
                          );
                        } else {
                          handlePlayAudio(book, 0);
                        }
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1D3557] text-[#FBF9F5] border-[#1D3557]'
                          : 'bg-[#F2EDE4] text-[#1C1917] border-[#D6CEBE] hover:bg-[#EBE5DA]'
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{isCurrent ? 'Sedang Diputar' : 'Putar Bab I'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-[#DED6C8] bg-[#F2EDE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#57534E]">
          <div className="flex items-start gap-3">
            <PhainonSunLogo className="w-6 h-6 text-[#B8862D] shrink-0 mt-0.5" />
            <div>
              <p className="font-serif text-base font-semibold text-[#1C1917]">Katarsis</p>
              <p className="mt-1">
                Perpustakaan Digital Sejarah · Katalog Terbuka untuk Buku Cetak, PDF, dan Audiobook.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setAccessModalOpen(true)}
              className="hover:text-[#1C1917] underline-offset-4 hover:underline cursor-pointer"
            >
              Akses Segel Surya
            </button>
            <a href="#katalog" className="hover:text-[#1C1917] underline-offset-4 hover:underline">
              Katalog
            </a>
            <a href="#lini-masa" className="hover:text-[#1C1917] underline-offset-4 hover:underline">
              Lini Masa
            </a>
            <button
              type="button"
              onClick={() => setGithubModalOpen(true)}
              className="hover:text-[#1C1917] underline-offset-4 hover:underline cursor-pointer"
            >
              Unggah GitHub & Ekspor Data
            </button>
          </div>
        </div>
      </footer>

      {/* Toast notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed right-4 sm:right-6 z-50 bg-[#1C1917] text-[#FBF9F5] px-4 py-2.5 text-xs font-medium border border-[#44403C] shadow-lg ${
            audioState ? 'bottom-20' : 'bottom-6'
          }`}
        >
          {toastMessage}
        </div>
      )}

      {/* Modals & Drawers */}
      <BookDetailModal
        book={detailBook}
        isSaved={detailBook ? savedIds.includes(detailBook.id) : false}
        effectivePrintCopies={detailBook ? getEffectivePrintCopies(detailBook) : 0}
        onClose={() => setDetailBook(null)}
        onToggleSave={handleToggleSave}
        onOpenReader={handleOpenReader}
        onDownloadPdf={handleDownloadPdf}
        onPlayAudiobook={handlePlayAudio}
        onOpenLoanModal={(b) => setLoanBook(b)}
      />

      <PdfReaderModal
        book={readerState?.book ?? null}
        initialChapterIndex={readerState?.chapterIndex ?? 0}
        onClose={() => setReaderState(null)}
        onDownloadPdf={handleDownloadPdf}
        onPlayChapterAudio={(book, chIdx) => {
          setReaderState(null);
          handlePlayAudio(book, chIdx);
        }}
      />

      <PrintLoanModal
        book={loanBook}
        accessPass={accessPass}
        onClose={() => setLoanBook(null)}
        onConfirmLoan={handleConfirmLoan}
      />

      <MyShelfDrawer
        open={shelfOpen}
        accessPass={accessPass}
        savedBooks={savedBooks}
        loans={printLoans}
        onClose={() => setShelfOpen(false)}
        onOpenAccessModal={() => setAccessModalOpen(true)}
        onRemoveSaved={(id) => handleToggleSave(id)}
        onCancelLoan={handleCancelLoan}
        onOpenBookDetail={(b) => {
          setShelfOpen(false);
          setDetailBook(b);
        }}
        onOpenReader={(b) => handleOpenReader(b, 0)}
        onDownloadPdf={handleDownloadPdf}
        onPlayAudio={(b) => handlePlayAudio(b, 0)}
      />

      <LibraryAccessModal
        open={accessModalOpen}
        accessPass={accessPass}
        onClose={() => setAccessModalOpen(false)}
        onActivatePass={(pass) => {
          setAccessPass(pass);
          showToast(`Segel Surya aktif untuk ${pass.memberName} (${pass.solarCode})`);
        }}
        onRevokePass={() => {
          setAccessPass(null);
          showToast('Kartu Akses Surya dinonaktifkan');
        }}
      />

      <GithubGuideModal
        open={githubModalOpen}
        books={CATALOG_BOOKS}
        onClose={() => setGithubModalOpen(false)}
      />

      <AudiobookPlayerBar
        book={audioState?.book ?? null}
        chapterIndex={audioState?.chapterIndex ?? 0}
        isPlaying={audioState?.isPlaying ?? false}
        onTogglePlay={() =>
          setAudioState((prev) => (prev ? { ...prev, isPlaying: !prev.isPlaying } : null))
        }
        onChangeChapter={(idx) =>
          setAudioState((prev) => (prev ? { ...prev, chapterIndex: idx, isPlaying: true } : null))
        }
        onClose={() => setAudioState(null)}
      />
    </div>
  );
}
