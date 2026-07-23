import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../utils/cn';

interface SuccessCardProps {
  /** Ikon Lucide atau komponen ikon lainnya yang akan ditampilkan di dalam lingkaran. */
  icon: React.ElementType;
  /**
   * Kelas utilitas tambahan untuk mewarnai kontainer ikon bulat.
   * Formatnya biasanya: "bg-[warna]-100 text-[warna]-600"
   * @default "bg-emerald-100 text-emerald-600"
   */
  iconColorClass?: string;
  /** Judul utama untuk kartu sukses (misal: "Kompresi Berhasil!"). */
  title: string;
  /** Deskripsi panjang (bisa ReactNode untuk styling ekstra). */
  description: React.ReactNode;
  /**
   * Konten opsional yang disisipkan di antara deskripsi dan tombol aksi.
   * Berguna untuk statistik (seperti komparasi ukuran awal/akhir).
   */
  children?: React.ReactNode;
  /** Grup tombol aksi yang akan dirender di bagian bawah kartu. */
  actions: React.ReactNode;
}

/**
 * Komponen reusable untuk menampilkan layar sukses setelah proses (konversi, kompres, dll) selesai.
 */
export function SuccessCard({
  icon: Icon,
  iconColorClass = 'bg-emerald-100 text-emerald-600',
  title,
  description,
  children,
  actions
}: SuccessCardProps) {
  return (
    <div className="animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-12">
      <Card className="border-slate-200 shadow-sm text-center pt-8">
        <CardContent>
          {/* Ikon Bulat */}
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6", iconColorClass)}>
            <Icon size={40} />
          </div>
          
          {/* Judul & Deskripsi */}
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3">{title}</h2>
          <p className="text-slate-500 mb-10 text-lg">{description}</p>
          
          {/* Slot Konten Kustom Opsional */}
          {children && <div className="mb-10">{children}</div>}
          
          {/* Slot Aksi */}
          <div className="flex justify-center gap-4">
            {actions}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
