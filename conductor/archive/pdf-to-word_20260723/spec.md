# Specification: PDF to Word (DOCX) Conversion

## 1. Overview
The goal of this track is to implement a fully offline "PDF to Word" conversion feature in the LocalPDF application. This feature allows users to select a PDF file and convert it into an editable Microsoft Word (`.docx`) document without requiring an internet connection.

## 2. Functional Requirements
- **Engine**: The system MUST utilize the pre-existing LibreOffice Portable binary (`binaries/win/LibreOfficePortable/App/libreoffice/program/soffice.exe`) in headless mode to perform the conversion.
- **Output Format**: The output file MUST be in `.docx` format.
- **UI/UX**: 
  - A new dedicated page (`/pdf-to-word`) for the conversion interface.
  - The page MUST include a drag-and-drop zone for file selection, a real-time progress bar (or loading indicator), and a success view to save the output file.
  - The feature MUST be accessible via the left sidebar navigation menu.
- **State Management**: A new Zustand store (`pdfToWordStore`) to manage the file state and conversion progress.
- **IPC**: New IPC channels (`PDF_TO_WORD`) for communication between the renderer and main process.

## 3. Non-Functional Requirements
- **Performance**: The conversion process should not block the main UI thread.
- **Offline Capability**: The feature MUST function 100% offline.

## 4. Acceptance Criteria
- [ ] Users can navigate to the "PDF to Word" page from the left sidebar.
- [ ] Users can upload a PDF file using drag-and-drop or file selection.
- [ ] Users can trigger the conversion process and see a loading indicator/progress bar.
- [ ] The conversion successfully produces a `.docx` file using LibreOffice headless.
- [ ] Users can save the generated `.docx` file to their desired location.
- [ ] The saved `.docx` file can be opened and edited in standard word processors.

## 5. Out of Scope
- Conversion to legacy formats like `.doc` or `.rtf`.
- Online conversion fallbacks.
- Optical Character Recognition (OCR) for scanned PDFs (unless inherently supported by LibreOffice's standard PDF import filter).
