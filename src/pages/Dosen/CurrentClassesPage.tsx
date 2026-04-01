import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Search } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { getMyClass } from '../../api/classes';
import { useAuth } from '../../contexts/AuthContext';
import { type ClassDetail } from '../../types/api';
import { getHariName } from '../../utils/helper';

const CurrentClassesPage = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<ClassDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        const dosenId = user?.npm_atau_nip;
        if (!dosenId) return;
        try {
            setLoading(true);
            const data = await getMyClass(dosenId);
            setClasses(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gagal mengambil daftar kelas');
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter(c =>
        c.namaKelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.namaMatkul.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans">
            {/* Header */}
            <Header
                subtitle="Katalog Mata Kuliah"
                rightContent={
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-[11px] font-bold uppercase bg-gray-700 hover:bg-gray-600 px-3 py-1 border border-gray-800 transition-all text-white"
                    >
                        <ArrowLeft size={14} className="mr-2" /> Dashboard
                    </button>
                }
            />

            <div className="max-w-[1200px] mx-auto p-4 md:p-8">
                <div className="bg-white border border-gray-300 shadow-sm">
                    {/* Toolbar */}
                    <div className="bg-[#f8f8f8] border-b border-gray-300 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                                Daftar Kelas
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari Nama Kelas / Matkul"
                                    className="pl-9 pr-3 py-1.5 border border-gray-300 focus:border-blue-500 outline-none text-[12px] w-full md:w-64 uppercase"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 overflow-x-auto">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] font-mono">
                                <strong>STATUS:</strong> {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                                <Loader2 className="animate-spin" size={32} />
                                <p className="font-mono text-[11px] uppercase tracking-widest">Sinkronisasi Data...</p>
                            </div>
                        ) : (
                            <table className="w-full border-collapse border border-gray-200 text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-[11px] uppercase font-bold text-gray-600 tracking-wider">
                                        <th className="border border-gray-300 p-3 w-12">Nama Mata Kuliah</th>
                                        <th className="border border-gray-300 p-3 w-40">Jadwal</th>
                                        <th className="border border-gray-300 p-3 w-12 text-center">SKS</th>
                                        <th className="border border-gray-300 p-3 w-12 text-center">Terisi</th>
                                        <th className="border border-gray-300 p-3 w-12 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-800">
                                    {filteredClasses.length > 0 ? (
                                        filteredClasses.map((cls) => (
                                            <tr key={cls.id} className="hover:bg-blue-50 transition-colors border-b border-gray-200">
                                                <td className="border border-gray-300 p-3 font-mono text-md font-bold text-blue-800 uppercase">{cls.namaMatkul} {cls.namaKelas}</td>

                                                <td className="border border-gray-300 p-3 text-[10px] uppercase">
                                                    {cls.schedules && Array.isArray(cls.schedules) && cls.schedules.length > 0 ? (
                                                        <ul className="space-y-1">
                                                            {cls.schedules.map((sched: any, idx: number) => (
                                                                <li key={idx} className="flex items-start gap-1">
                                                                    <span className="text-blue-600 font-black mr-1">•</span>
                                                                    {typeof sched === 'object' && sched !== null ? (
                                                                        <span>
                                                                            <strong className="text-gray-800">{getHariName(sched.hari)}</strong>, {sched.jamMulai} - {sched.jamSelesai} ({sched.ruangan})
                                                                        </span>
                                                                    ) : (
                                                                        <span>{sched}</span> // Fallback
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span className="text-gray-400 italic">BELUM DIATUR</span>
                                                    )}
                                                </td>

                                                <td className="border border-gray-300 p-3 text-center font-bold">{cls.sks}</td>
                                                <td className="border border-gray-300 p-3 text-center font-bold">{cls.terisi}/{cls.kapasitas}</td>
                                                <td className="border border-gray-300 p-3 text-center">
                                                    <button className="text-[10px] uppercase font-bold text-gray-500 hover:text-blue-700 underline decoration-dotted transition-colors" onClick={() => navigate(`/class/${cls.id}`)}>
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-gray-400 italic font-mono text-[12px]">
                                                --- Tidak ada data kelas ditemukan ---
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 border-t border-gray-300 p-3 flex justify-between items-center text-[10px] text-gray-500">
                        <div>Menampilkan {filteredClasses.length} entitas kelas</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentClassesPage;