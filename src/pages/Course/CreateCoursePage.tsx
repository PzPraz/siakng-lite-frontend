import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookPlus, Loader2, ArrowLeft, Hash, BookOpen } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { createCourse } from '../../api/course';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    sks: 3,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validasi Nama Mata Kuliah
    if (!formData.nama.trim()) {
      newErrors.nama = "Nama mata kuliah wajib diisi";
    } else if (formData.nama.length < 3) {
      newErrors.nama = "Nama mata kuliah terlalu pendek";
    }

    // Validasi Kode Matkul (Contoh: CS101)
    if (!formData.kode.trim()) {
      newErrors.kode = "Kode mata kuliah wajib diisi";
    } else if (!/^[A-Z0-9]+$/.test(formData.kode)) {
      newErrors.kode = "Kode hanya boleh berisi huruf kapital dan angka";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await createCourse(formData);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan mata kuliah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans">
      <Header
        subtitle="Sistem Informasi Akademik"
        rightContent={
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[11px] font-bold uppercase bg-gray-700 hover:bg-gray-600 px-3 py-1 border border-gray-800 transition-all text-white"
          >
            <ArrowLeft size={14} className="mr-2" /> Kembali
          </button>
        }
      />

      <div className="max-w-[800px] mx-auto p-4 md:p-10">
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="bg-[#f8f8f8] border-b border-gray-300 p-4 flex items-center gap-3">
            <BookPlus size={18} className="text-blue-700" />
            <h1 className="text-sm font-bold uppercase tracking-wide text-gray-800">
              Form Tambah Mata Kuliah Baru
            </h1>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] font-mono uppercase">
                <strong>FAILURE:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nama Matkul */}
              <section>
                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                  Nama Mata Kuliah
                </label>
                <div className="relative">
                  <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-3 py-2 border ${errors.nama ? 'border-red-500' : 'border-gray-300'} bg-white focus:border-blue-500 outline-none transition-all font-bold uppercase text-gray-800`}
                    placeholder="CONTOH: STRUKTUR DATA"
                    value={formData.nama}
                    onChange={(e) => {
                      setFormData({ ...formData, nama: e.target.value });
                      if (errors.nama) setErrors({ ...errors, nama: '' }); // Clear error saat mengetik
                    }}
                    disabled={loading}
                  />
                </div>
                {errors.nama && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.nama}</p>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kode Matkul */}
                <section>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                    Kode Matkul
                  </label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className={`w-full pl-10 pr-3 py-2 border ${errors.kode ? 'border-red-500' : 'border-gray-300'} bg-white focus:border-blue-500 outline-none font-mono text-gray-800 uppercase`}
                      placeholder="CS101"
                      value={formData.kode}
                      onChange={(e) => {
                        setFormData({ ...formData, kode: e.target.value });
                        if (errors.kode) setErrors({ ...errors, kode: '' });
                      }}
                      disabled={loading}
                    />
                  </div>
                  {errors.kode && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.kode}</p>
                  )}
                </section>

                {/* SKS */}
                <section>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                    Jumlah SKS
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-blue-500 outline-none font-bold text-gray-800 cursor-pointer"
                    value={formData.sks}
                    onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) })}
                    disabled={loading}
                  >
                    {[1, 2, 3, 4, 6].map(val => (
                      <option key={val} value={val}>{val} SKS</option>
                    ))}
                  </select>
                </section>
              </div>

              <div className="h-px bg-gray-200 my-4"></div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 border font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 ${loading
                  ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                  : 'bg-blue-700 border-blue-900 hover:bg-blue-800 active:translate-y-px'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Menyimpan Data...
                  </>
                ) : (
                  'Simpan ke Database'
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 border-t border-gray-300 p-3 text-[10px] text-gray-400 italic text-center">
            Pastikan kode mata kuliah unik dan belum terdaftar di sistem.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;