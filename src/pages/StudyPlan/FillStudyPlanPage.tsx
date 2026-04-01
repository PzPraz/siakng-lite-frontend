import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, Trash2, Info, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { getAllClasses } from '../../api/classes';
import { syncIRS, getMyIrs } from '../../api/irs';
import type { ClassDetail } from '../../types/api';
import type { IrsResponse } from '../../types/api';

const getHariName = (hariNum: number) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[hariNum] || 'Unknown';
};

const FillStudyPlanPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [classes, setClasses] = useState<ClassDetail[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<ClassDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const totalSKS = selectedClasses.reduce((sum, item) => sum + item.sks, 0);

    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                const [allClasses, myIrs] = await Promise.all([
                    getAllClasses(),
                    getMyIrs()
                ]);
                setClasses(allClasses);

                const initialSelected = allClasses.filter(c =>
                    myIrs.some((irs: IrsResponse) => irs.classId === c.id)
                );

                setSelectedClasses(initialSelected);
            } catch (err: unknown) {
                console.error(err instanceof Error ? err.message : "Gagal load data");
                setError("Gagal menyinkronkan data mata kuliah.");
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    const groupedClasses = classes.reduce((acc, curr) => {
        const key = curr.namaMatkul;
        if (!acc[key]) {
            acc[key] = {
                kode: curr.kodeMatkul,
                nama: curr.namaMatkul,
                sks: curr.sks,
                classList: []
            };
        }
        acc[key].classList.push(curr);
        return acc;
    }, {} as Record<string, { kode: string, nama: string, sks: number, classList: ClassDetail[] }>);

    const toggleClass = (cls: ClassDetail) => {
        const isSelected = selectedClasses.find((item) => item.id === cls.id);
        if (isSelected) {
            setSelectedClasses(selectedClasses.filter((item) => item.id !== cls.id));
        } else {
            if (selectedClasses.some(s => s.courseId === cls.courseId)) {
                const otherClasses = selectedClasses.filter(s => s.courseId !== cls.courseId);

                setSelectedClasses([...otherClasses, cls]);
                return;
            }

            setSelectedClasses([...selectedClasses, cls]);
        }
    };

    const handleSubmitIRS = async () => {
        setError('');
        if (totalSKS > 24) {
            setError('Batas Maksimal 24 SKS terlampaui.');
            return;
        }

        try {
            setSubmitting(true);
            const allSelectedIds = selectedClasses.map(c => c.id);

            await syncIRS({
                studentId: user?.npm_atau_nip,
                classIds: allSelectedIds
            });

            navigate('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan pada server');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
            <Loader2 className="animate-spin text-blue-700" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans pb-20">
            <Header
                subtitle="Pengisian Rencana Studi"
                rightContent={
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-[11px] font-bold uppercase bg-gray-700 hover:bg-gray-600 px-3 py-1 border border-gray-800 transition-all text-white"
                    >
                        <ArrowLeft size={14} className="mr-2" /> Batal
                    </button>
                }
            />

            <div className="max-w-[1200px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* KOLOM KIRI: Daftar Kelas per Mata Kuliah */}
                <div className="lg:col-span-3 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 p-3 text-red-700 text-xs font-mono flex items-center gap-2">
                            <AlertCircle size={14} /> {error.toUpperCase()}
                        </div>
                    )}

                    {Object.keys(groupedClasses).length === 0 ? (
                        <div className="bg-white border border-gray-300 shadow-sm p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Info size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-sm font-bold uppercase text-gray-800 tracking-wider">
                                Tidak Ada Perkuliahan Tersedia
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-2 max-w-[300px] leading-relaxed italic uppercase font-medium">
                                Saat ini belum ada jadwal kelas yang dibuka untuk periode ini. Silakan hubungi bagian administrasi akademik.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-6 px-4 py-2 border border-gray-800 text-[10px] font-bold uppercase hover:bg-gray-800 hover:text-white transition-all"
                            >
                                Kembali ke Dashboard
                            </button>
                        </div>
                    ) : (
                        Object.values(groupedClasses).map((group) => (
                            <div key={group.nama} className="bg-white border border-gray-300 shadow-sm overflow-hidden">
                                <div className="bg-[#2d3e50] text-white p-2 px-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-yellow-500 text-[#2d3e50] px-2 py-0.5 font-bold text-[10px] font-mono">{group.kode}</span>
                                        <h2 className="font-bold uppercase text-[12px] tracking-tight">{group.nama}</h2>
                                    </div>
                                    <span className="text-[10px] opacity-70 font-bold italic">{group.sks} SKS</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse table-fixed">
                                        <colgroup>
                                            <col style={{ width: '72px' }} />
                                            <col style={{ width: '25%' }} />
                                            <col style={{ width: '40%' }} />
                                            <col style={{ width: '80px' }} />
                                            <col style={{ width: '96px' }} />
                                        </colgroup>
                                        <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase text-gray-500 font-bold">
                                            <tr>
                                                <th className="p-3 text-center">Kelas</th>
                                                <th className="p-3">Dosen</th>
                                                <th className="p-3">Jadwal</th>
                                                <th className="p-3 text-center">Kuota</th>
                                                <th className="p-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {group.classList.filter((cls) => cls.schedules.length > 0).map((cls) => {
                                                const isSelected = selectedClasses.find(s => s.id === cls.id);
                                                const isFull = cls.terisi >= cls.kapasitas;
                                                return (
                                                    <tr key={cls.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                                        <td className="p-3 text-center font-black text-blue-700 text-lg">{cls.namaKelas}</td>
                                                        <td className="p-3 text-[11px] font-bold text-gray-600 uppercase italic truncate">{cls.namaDosen || 'Staf Pengajar'}</td>

                                                        <td className="p-3 text-[10px] font-mono text-gray-500 uppercase align-top">
                                                            {cls.schedules && Array.isArray(cls.schedules) && cls.schedules.length > 0 ? (
                                                                <ul className="space-y-1">
                                                                    {cls.schedules.map((sched: any, idx: number) => (
                                                                        <li key={idx} className="flex items-start gap-1">
                                                                            <span className="text-blue-400 mr-1">•</span>
                                                                            {typeof sched === 'object' && sched !== null ? (
                                                                                <span>
                                                                                    <strong className="text-gray-700">{getHariName(sched.hari)}</strong>, {sched.jamMulai}-{sched.jamSelesai} ({sched.ruangan})
                                                                                </span>
                                                                            ) : (
                                                                                <span>{sched}</span> // Fallback
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <span className="text-gray-400 italic">TBA</span>
                                                            )}
                                                        </td>

                                                        <td className="p-3 text-center text-[11px]">
                                                            <span className={`font-bold ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
                                                                {cls.terisi}/{cls.kapasitas}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => toggleClass(cls)}
                                                                disabled={isFull && !isSelected}
                                                                className={`w-full py-1.5 text-[10px] font-bold uppercase border transition-all ${isSelected
                                                                    ? 'bg-red-600 text-white border-red-700'
                                                                    : isFull
                                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                        : 'bg-white text-blue-700 border-blue-700 hover:bg-blue-700 hover:text-white'
                                                                    }`}
                                                            >
                                                                {isSelected ? 'Batal' : isFull ? 'Penuh' : 'Ambil'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )))}
                </div>

                {/* KOLOM KANAN: Sidebar Ringkasan & Submit */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-300 sticky top-6 shadow-sm">
                        <div className="bg-[#2d3e50] text-white p-3 font-bold uppercase text-[11px] flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-yellow-500" /> Ringkasan IRS
                        </div>

                        <div className="p-4">
                            {selectedClasses.length === 0 ? (
                                <div className="py-10 text-center text-gray-400 italic text-[11px]">
                                    Belum ada mata kuliah dipilih
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[450px] overflow-y-auto mb-4 pr-2 custom-scrollbar">
                                    {selectedClasses.map((cls) => (
                                        <div key={`summary-${cls.id}`} className="group border-b border-gray-100 pb-2 flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-800 text-[11px] uppercase leading-tight">{cls.namaMatkul}</p>
                                                <p className="text-[10px] text-blue-600 mt-1 font-mono font-bold">KELAS {cls.namaKelas} • {cls.sks} SKS</p>
                                            </div>
                                            <button
                                                onClick={() => toggleClass(cls)}
                                                className="text-gray-300 hover:text-red-600 transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 uppercase text-[10px] font-bold">Beban SKS</span>
                                    <span className={`text-lg font-black ${totalSKS > 24 ? 'text-red-600' : 'text-blue-700'}`}>
                                        {totalSKS} / 24
                                    </span>
                                </div>

                                <button
                                    onClick={handleSubmitIRS}
                                    disabled={submitting || totalSKS > 24}
                                    className={`w-full py-3 flex items-center justify-center gap-2 font-bold uppercase text-[11px] border transition-all ${submitting || totalSKS > 24
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'bg-green-600 text-white border-green-700 hover:bg-green-700 shadow-sm active:translate-y-px'
                                        }`}
                                >
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-3 border-t border-blue-100">
                            <div className="flex gap-2 items-start">
                                <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
                                <p className="text-[9px] text-blue-700 leading-normal italic uppercase font-medium">
                                    Klik "Simpan" untuk memperbarui IRS. Pastikan tidak ada jadwal yang bentrok.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FillStudyPlanPage;