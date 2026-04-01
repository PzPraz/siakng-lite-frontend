import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Users, UserCheck, PlusCircle, Trash2, MapPin, CalendarDays } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { getClassDetail, updateClass } from '../../api/classes';
import type { ScheduleItem } from '../../types/api';

const EditClassPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseName, setCourseName] = useState('');

  const [formData, setFormData] = useState({
    courseId: 0,
    namaKelas: '',
    kapasitas: 40,
    schedules: [{ hari: 1, jamMulai: '', jamSelesai: '', ruangan: '' }] as ScheduleItem[],
    dosenId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await getClassDetail(Number(id));

        setFormData({
          courseId: data.courseId,
          namaKelas: data.namaKelas,
          kapasitas: data.kapasitas,
          schedules: data.schedules && data.schedules.length > 0
            ? data.schedules
            : [{ hari: 1, jamMulai: '', jamSelesai: '', ruangan: '' }],
          dosenId: data.dosenId,
        });
        setCourseName(data.namaMatkul);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data kelas');
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handleScheduleFieldChange = (index: number, field: keyof ScheduleItem, value: string | number) => {
    const newJadwal = [...formData.schedules];
    newJadwal[index] = { ...newJadwal[index], [field]: value };
    setFormData({ ...formData, schedules: newJadwal });
    if (errors.schedules) setErrors({ ...errors, jadwal: '' });
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedules: [...formData.schedules, { hari: 1, jamMulai: '', jamSelesai: '', ruangan: '' }]
    });
  };

  const removeSchedule = (index: number) => {
    const newJadwal = formData.schedules.filter((_, i) => i !== index);
    setFormData({ ...formData, schedules: newJadwal });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.namaKelas.trim()) {
      newErrors.namaKelas = "Nama kelas wajib diisi";
    } else if (formData.namaKelas.length > 10) {
      newErrors.namaKelas = "Nama kelas maksimal 10 karakter";
    }

    if (!formData.dosenId.trim()) {
      newErrors.dosenId = "NIP Dosen wajib diisi";
    } else if (!/^\d+$/.test(formData.dosenId)) {
      newErrors.dosenId = "NIP hanya boleh berisi angka";
    }

    if (formData.kapasitas < 1) {
      newErrors.kapasitas = "Kapasitas minimal 1 mahasiswa";
    }

    // Validasi Detail Jadwal
    if (formData.schedules.length === 0) {
      newErrors.schedules = "Minimal satu sesi jadwal harus ada";
    } else {
      for (let i = 0; i < formData.schedules.length; i++) {
        const j = formData.schedules[i];
        if (!j.jamMulai || !j.jamSelesai || !j.ruangan.trim()) {
          newErrors.schedules = `Semua kolom (Jam & Ruangan) pada Sesi ${i + 1} harus diisi lengkap`;
          break;
        }
        if (j.jamMulai >= j.jamSelesai) {
          newErrors.schedules = `Jam Selesai harus lebih besar dari Jam Mulai pada Sesi ${i + 1}`;
          break;
        }
      }
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
      await updateClass(Number(id), formData);
      navigate(-1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui data kelas');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
      <Loader2 className="animate-spin text-blue-700" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans pb-10">
      <Header
        subtitle="Manajemen Perubahan Informasi Kelas"
        rightContent={
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[11px] font-bold uppercase bg-gray-700 hover:bg-gray-600 px-3 py-1 border border-gray-800 transition-all text-white"
          >
            <ArrowLeft size={14} className="mr-2" /> Batal
          </button>
        }
      />

      <div className="max-w-[800px] mx-auto p-4 md:p-10">
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="bg-[#f8f8f8] border-b border-gray-300 p-4 flex items-center gap-3">
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                Edit Detail Kelas
              </h1>
              <p className="text-[10px] text-blue-600 font-mono font-bold uppercase">
                Mata Kuliah: {courseName}
              </p>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] font-mono uppercase">
                <strong>FAILURE:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Kelas */}
                <section>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                    Label Kelas (A/B/KBI)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-blue-500 outline-none font-bold uppercase text-gray-800 text-lg shadow-inner"
                    value={formData.namaKelas}
                    onChange={(e) => setFormData({ ...formData, namaKelas: e.target.value })}
                    disabled={loading}
                  />
                  {errors.namaKelas && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.namaKelas}</p>
                  )}
                </section>

                {/* Kapasitas */}
                <section>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                    Kapasitas (Mahasiswa)
                  </label>
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      min={1}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white focus:border-blue-500 outline-none font-bold text-gray-800"
                      value={formData.kapasitas}
                      onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 0 })}
                      disabled={loading}
                    />
                  </div>
                  {errors.kapasitas && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.kapasitas}</p>
                  )}
                </section>

                {/* Dosen Pengampu */}
                <section className="md:col-span-2">
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                    DOSEN PENGAMPU (ID/NIP)
                  </label>
                  <div className="relative">
                    <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white focus:border-blue-500 outline-none font-bold text-gray-800"
                      value={formData.dosenId}
                      onChange={(e) => setFormData({ ...formData, dosenId: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  {errors.dosenId && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.dosenId}</p>
                  )}
                </section>

                {/* Jadwal - Diubah menjadi Input Dinamis Multi-Kolom */}
                <section className="md:col-span-2 bg-gray-50 p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">
                      Jadwal & Sesi Perkuliahan
                    </label>
                    <button
                      type="button"
                      onClick={addSchedule}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-800 uppercase"
                    >
                      <PlusCircle size={12} /> Tambah Sesi
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.schedules.map((jdwl, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 border border-gray-300 shadow-sm relative">
                        {/* HARI */}
                        <div className="w-full md:w-1/4">
                          <div className="relative">
                            <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 bg-white focus:border-blue-500 outline-none font-bold text-gray-800 text-[11px] uppercase cursor-pointer"
                              value={jdwl.hari}
                              onChange={(e) => handleScheduleFieldChange(index, 'hari', parseInt(e.target.value))}
                              disabled={loading}
                            >
                              <option value={1}>SENIN</option>
                              <option value={2}>SELASA</option>
                              <option value={3}>RABU</option>
                              <option value={4}>KAMIS</option>
                              <option value={5}>JUMAT</option>
                              <option value={6}>SABTU</option>
                              <option value={0}>MINGGU</option>
                            </select>
                          </div>
                        </div>

                        {/* WAKTU MULAI & SELESAI */}
                        <div className="w-full md:w-auto flex items-center gap-2">
                          <input
                            type="time"
                            min="08:00"
                            max="19:00"
                            required
                            className="w-full md:w-[110px] px-2 py-2 border border-gray-300 bg-white focus:border-blue-500 outline-none font-mono text-gray-800 text-xs text-center"
                            value={jdwl.jamMulai}
                            onChange={(e) => handleScheduleFieldChange(index, 'jamMulai', e.target.value)}
                            disabled={loading}
                          />
                          <span className="text-gray-400 font-bold">-</span>
                          <input
                            type="time"
                            min="08:00"
                            max="19:00"
                            required
                            className="w-full md:w-[110px] px-2 py-2 border border-gray-300 bg-white focus:border-blue-500 outline-none font-mono text-gray-800 text-xs text-center"
                            value={jdwl.jamSelesai}
                            onChange={(e) => handleScheduleFieldChange(index, 'jamSelesai', e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        {/* RUANGAN */}
                        <div className="w-full md:flex-1 relative">
                          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            required
                            placeholder="RUANGAN (Cth: R.2.405)"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 bg-white focus:border-blue-500 outline-none font-bold uppercase text-gray-800 text-xs"
                            value={jdwl.ruangan}
                            onChange={(e) => handleScheduleFieldChange(index, 'ruangan', e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        {/* TOMBOL DELETE */}
                        {formData.schedules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSchedule(index)}
                            className="absolute top-2 right-2 md:static md:top-auto md:right-auto p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all rounded-sm"
                            title="Hapus Sesi"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.schedules && (
                    <p className="text-red-500 text-[10px] mt-2 font-bold italic">{errors.schedules}</p>
                  )}
                </section>
              </div>

              <div className="h-px bg-gray-200 my-4"></div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 border font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 ${loading
                  ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                  : 'bg-blue-700 border-blue-900 hover:bg-blue-800 active:translate-y-px'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Menyimpan Perubahan...
                  </>
                ) : (
                  <>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 border-t border-gray-300 p-3 text-[10px] text-gray-400 italic text-center">
            Perubahan informasi kelas akan langsung tercermin pada jadwal IRS mahasiswa.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditClassPage;