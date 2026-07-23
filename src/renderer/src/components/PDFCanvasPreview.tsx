import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2 } from 'lucide-react';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Setup worker for vite secara offline & memastikan versi cocok
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFCanvasPreviewProps {
  file: File;
}

export function PDFCanvasPreview({ file }: PDFCanvasPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-100/50 rounded-md border border-slate-200">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center gap-2 p-10">
            <Loader2 className="animate-spin text-teal-600 w-8 h-8" />
            <span className="text-xs text-slate-500">Memuat Preview...</span>
          </div>
        }
        error={
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded">
            Gagal merender preview.
          </div>
        }
        className="shadow-sm border border-slate-200 rounded overflow-hidden bg-white"
      >
        <Page 
          pageNumber={1} 
          width={280} 
          renderTextLayer={false} 
          renderAnnotationLayer={false} 
        />
      </Document>
      {numPages && (
        <p className="text-xs text-slate-500 mt-3 font-semibold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          Total Dokumen: {numPages} Halaman
        </p>
      )}
    </div>
  );
}
