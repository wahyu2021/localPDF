import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../utils/cn';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Setup worker for vite secara offline & memastikan versi cocok
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFCanvasPreviewProps {
  file: File;
  requestedPage?: number;
  onLoadSuccess?: (numPages: number) => void;
}

export function PDFCanvasPreview({ file, requestedPage, onLoadSuccess }: PDFCanvasPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  React.useEffect(() => {
    if (requestedPage && numPages && requestedPage >= 1 && requestedPage <= numPages) {
      setPageNumber(requestedPage);
    }
  }, [requestedPage, numPages]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    if (onLoadSuccess) {
      onLoadSuccess(numPages);
    }
  }

  const prevPage = () => {
    setPageNumber(prev => (prev > 1 ? prev - 1 : prev));
  };

  const nextPage = () => {
    if (numPages) {
      setPageNumber(prev => (prev < numPages ? prev + 1 : prev));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner min-h-[550px]">
      <div className="relative group min-h-[460px] min-w-[320px] flex items-center justify-center">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center gap-2 w-[280px] h-[360px] bg-white border border-slate-200 rounded-xl shadow-sm">
              <Loader2 className="animate-spin text-teal-600 w-8 h-8" />
              <span className="text-xs text-slate-500 font-medium">Memuat Halaman...</span>
            </div>
          }
          error={
            <div className="flex items-center justify-center w-[280px] h-[360px] bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              Gagal merender preview.
            </div>
          }
          className="shadow-md border border-slate-200 rounded-xl overflow-hidden bg-white transition-all group-hover:shadow-lg"
        >
          <Page 
            pageNumber={pageNumber} 
            width={320} 
            renderTextLayer={false} 
            renderAnnotationLayer={false} 
            loading={
              <div className="flex flex-col items-center justify-center gap-2 w-[320px] h-[452px] bg-slate-50">
                <Loader2 className="animate-spin text-teal-500 w-6 h-6" />
                <span className="text-xs text-slate-400">Memuat halaman...</span>
              </div>
            }
            className="transition-opacity duration-300 min-h-[452px] w-[320px] flex items-center justify-center"
          />
        </Document>

        {/* Floating Navigation Arrows (only visible on hover if multiple pages) */}
        {numPages && numPages > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute -left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all",
                pageNumber <= 1 ? "hidden" : "flex"
              )}
              onClick={prevPage}
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute -right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all",
                pageNumber >= numPages ? "hidden" : "flex"
              )}
              onClick={nextPage}
            >
              <ChevronRight size={20} />
            </Button>
          </>
        )}
      </div>

      {/* Page Indicator */}
      {numPages && (
        <div className="flex items-center mt-6">
          <span className="text-sm font-bold text-slate-700 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
            Halaman {pageNumber} <span className="text-slate-400 font-normal mx-1">dari</span> {numPages}
          </span>
        </div>
      )}
    </div>
  );
}
