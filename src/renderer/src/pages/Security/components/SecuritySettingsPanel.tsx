import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useSecurityStore } from '../../../store/securityStore';

export function SecuritySettingsPanel() {
  const { 
    mode, 
    userPassword, setUserPassword, 
    ownerPassword, setOwnerPassword,
    restrictions, setRestrictions
  } = useSecurityStore();
  
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm">Pengaturan Keamanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {mode === 'lock' && (
          <div className="space-y-2">
            <Label>User Password (Untuk membuka file)</Label>
            <div className="relative">
              <Input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password" 
                value={userPassword} 
                onChange={(e) => setUserPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {mode === 'unlock' && (
          <div className="space-y-2">
            <Label>Password File</Label>
            <div className="relative">
              <Input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password asli file" 
                value={userPassword} 
                onChange={(e) => setUserPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500">Password ini akan dihapus permanen dari file hasil konversi.</p>
          </div>
        )}

        {mode === 'restrict' && (
          <>
            <div className="space-y-2">
              <Label>Owner / Master Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password untuk memodifikasi batasan" 
                  value={ownerPassword} 
                  onChange={(e) => setOwnerPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label>Hak Akses Mencetak (Print)</Label>
              <select 
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                value={restrictions.print} 
                onChange={(e) => setRestrictions({ print: e.target.value as any })}
              >
                <option value="none">Tidak Diizinkan (None)</option>
                <option value="low">Kualitas Rendah (Low)</option>
                <option value="full">Kualitas Penuh (Full)</option>
              </select>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label>Hak Akses Edit (Modify)</Label>
              <select 
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                value={restrictions.modify} 
                onChange={(e) => setRestrictions({ modify: e.target.value as any })}
              >
                <option value="none">Tidak Diizinkan (None)</option>
                <option value="annotate">Hanya Anotasi</option>
                <option value="form">Hanya Isi Form</option>
                <option value="all">Semua Diizinkan</option>
              </select>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Izinkan Copy (Extract)</Label>
              <select 
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                value={restrictions.extract} 
                onChange={(e) => setRestrictions({ extract: e.target.value as any })}
              >
                <option value="n">Tidak Diizinkan (No)</option>
                <option value="y">Diizinkan (Yes)</option>
              </select>
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}
