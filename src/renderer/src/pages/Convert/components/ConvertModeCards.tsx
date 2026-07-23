import { FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { useConvertStore } from '../../../store/convertStore';

export function ConvertModeCards() {
  const { setMode } = useConvertStore();

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-6 animate-in fade-in duration-300">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Pilih Alat Konversi</h1>
        <p className="text-slate-500 mt-3 text-lg max-w-xl mx-auto">
          Apa yang ingin Anda lakukan hari ini? Pilih salah satu mode di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-6">
        {/* Office to PDF */}
        <Card 
          className="group cursor-pointer hover:border-teal-400 hover:shadow-md transition-colors duration-200 bg-white border-slate-200"
          onClick={() => setMode('office-to-pdf')}
        >
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="bg-teal-50 p-4 rounded-2xl group-hover:bg-teal-100 transition-colors mb-6">
              <FileSpreadsheet size={48} className="text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Office ke PDF</h3>
            <p className="text-slate-500 text-sm">
              Ubah dokumen Word, Excel, dan PowerPoint Anda menjadi PDF murni dengan akurasi tinggi.
            </p>
          </CardContent>
        </Card>

        {/* Image to PDF */}
        <Card 
          className="group cursor-pointer hover:border-blue-400 hover:shadow-md transition-colors duration-200 bg-white border-slate-200"
          onClick={() => setMode('image-to-pdf')}
        >
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-100 transition-colors mb-6">
              <ImageIcon size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gambar ke PDF</h3>
            <p className="text-slate-500 text-sm">
              Gabungkan kumpulan gambar JPG dan PNG menjadi satu atau beberapa file PDF.
            </p>
          </CardContent>
        </Card>

        {/* PDF to Image */}
        <Card 
          className="group cursor-pointer hover:border-orange-400 hover:shadow-md transition-colors duration-200 bg-white border-slate-200"
          onClick={() => setMode('pdf-to-image')}
        >
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-orange-100 transition-colors mb-6">
              <FileText size={48} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">PDF ke Gambar</h3>
            <p className="text-slate-500 text-sm">
              Ekstrak setiap halaman dari dokumen PDF Anda menjadi file gambar JPG berkualitas tinggi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
