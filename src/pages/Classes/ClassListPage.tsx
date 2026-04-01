import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Search } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { getAllClasses } from '../../api/classes';
import type { Course } from '../../api/course';
import type { ClassDetail } from '../../types/api';

const ClassListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<ClassDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllClasses();
      setClasses(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const groupedClasses = classes.reduce((acc, curr) => {
    const key = curr.namaMatkul;
    if (!acc[key]) {
      acc[key] = {
        courseInfo: { id: curr.courseId || 0, kode: curr.kodeMatkul, nama: curr.namaMatkul, sks: curr.sks },
        classList: []
      };
    }
    acc[key].classList.push(curr);
    return acc;
  }, {} as Record<string, { courseInfo: Course, classList: ClassDetail[] }>);

  const courseNames = Object.keys(groupedClasses).filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    groupedClasses[name].courseInfo.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans pb-10">
      {/* Header Utama */}
      <Header
        subtitle="Jadwal Perkuliahan Rilis"
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
        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-300 p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold uppercase tracking-wide">Daftar Kelas</h1>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari Mata Kuliah..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 focus:border-blue-500 outline-none text-[12px] uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400 font-mono text-[11px]">
            <Loader2 className="animate-spin" size={32} />
            MENYINGKRONKAN JADWAL...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-4 text-red-700 font-mono text-xs uppercase">{error}</div>
        ) : (
          <div className="space-y-8">
            {courseNames.length > 0 ? courseNames.map((courseName) => {
              const group = groupedClasses[courseName];
              return (
                <div key={courseName} className="bg-white border border-gray-300 shadow-sm overflow-hidden">
                  {/* Course Header Section */}
                  <div className="bg-[#2d3e50] text-white p-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="bg-yellow-500 text-[#2d3e50] px-2 py-0.5 font-mono font-bold text-xs">
                        {group.courseInfo.kode}
                      </span>
                      <h2 className="font-bold uppercase tracking-tight text-sm">
                        {group.courseInfo.nama}
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold uppercase opacity-80 border border-white/20 px-2 py-0.5">
                      Bobot: {group.courseInfo.sks} SKS
                    </span>
                  </div>

                  {/* Table of Classes */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left min-w-[850px] table-fixed">
                      <thead>
                        <tr className="bg-gray-100 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                          <th className="p-3 w-[80px] text-center">Kelas</th>
                          <th className="p-3 w-[250px]">Dosen Pengampu</th>
                          <th className="p-3 w-auto text-center">Jadwal</th>
                          <th className="p-3 w-[100px] text-center">Terisi</th>
                          <th className="p-3 w-[100px] text-center">Kapasitas</th>
                          <th className="p-3 w-[120px] text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.classList.map((cls) => (
                          <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-center font-black text-blue-800 text-lg border-r border-gray-50">{cls.namaKelas}</td>

                            <td className="p-3 border-r border-gray-50">
                              <div className="flex items-center gap-2">
                                <span className="font-bold uppercase text-[11px] text-gray-700 leading-tight truncate">
                                  {cls.namaDosen || 'Staf Pengajar'}
                                </span>
                              </div>
                            </td>

                            <td className="p-3 font-mono text-[11px] uppercase text-gray-600 text-center">
                              {cls.schedules && cls.schedules.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-1">
                                  {cls.schedules.map((sched, index) => {
                                    if (typeof sched === 'object' && sched !== null) {
                                      const getHariName = (hariNum: number) => {
                                        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                                        return days[hariNum] || 'Unknown';
                                      };
                                      return (
                                        <li key={index} className="leading-tight list-none">
                                          <span className="font-bold text-gray-800">{getHariName(sched.hari)}</span>, {sched.jamMulai} - {sched.jamSelesai} <span className="text-blue-600 font-bold">({sched.ruangan})</span>
                                        </li>
                                      );
                                    }
                                    else if (typeof sched === 'string') {
                                      return <li key={index} className="leading-tight">{sched}</li>;
                                    }
                                    return null;
                                  })}
                                </ul>
                              ) : (
                                <span className="text-gray-400 italic">Belum Diatur</span>
                              )}
                            </td>

                            <td className="p-3 text-center border-l border-gray-50">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-lg text-gray-800 leading-none">{cls.terisi}</span>
                                <span className="text-gray-400 text-[9px] uppercase mt-1">Kursi</span>
                              </div>
                            </td>

                            <td className="p-3 text-center border-l border-gray-50">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-lg text-gray-800 leading-none">{cls.kapasitas}</span>
                                <span className="text-gray-400 text-[9px] uppercase mt-1">Kursi</span>
                              </div>
                            </td>

                            <td className="p-3 text-center border-l border-gray-50">
                              <button
                                onClick={() => navigate(`/class/${cls.id}`)}
                                className="w-full text-[10px] font-bold uppercase text-blue-600 border border-blue-600 px-2 py-1.5 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:translate-y-px"
                              >
                                Detail Kelas
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }) : (
              <div className="p-20 text-center border-2 border-dashed border-gray-300 text-gray-400 font-mono italic uppercase">
                -- Tidak ada jadwal yang tersedia untuk kriteria pencarian ini --
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassListPage;