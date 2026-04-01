import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Users, Calendar, Trash2, Edit,
  AlertTriangle, UserCheck, GraduationCap, MapPin
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { getClassDetail, deleteClass, getStudentsInClass } from '../../api/classes';
import type { Student, ClassDetail } from '../../types/api';
import { getHariName } from '../../utils/helper';

const ClassDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchAllData(Number(id));
  }, [id]);

  const fetchAllData = async (classId: number) => {
    try {
      setLoading(true);
      const data = await getClassDetail(classId);
      setClassData(data);

      if (!data) {
        navigate('/404', { replace: true });
        return;
      }

      if (user?.role === 'DOSEN') {
        const studentList = await getStudentsInClass(classId);
        setStudents(studentList);
      }
    } catch (err: unknown) {
      navigate('/404')
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteClass(Number(id));
      navigate(-1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
      <Loader2 className="animate-spin text-blue-700" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans pb-20">

      {/* MODAL DELETE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-red-600 w-full max-w-md shadow-2xl">
            <div className="bg-red-600 text-white p-3 flex items-center gap-2 font-bold uppercase text-[11px]">
              <AlertTriangle size={16} /> Bahaya: Penghapusan Kelas
            </div>
            <div className="p-6">
              <p className="text-gray-700">Apakah Anda yakin ingin menghapus kelas <span className="font-bold">{classData?.namaKelas}</span>?</p>
              <p className="text-[10px] text-gray-500 mt-2 italic bg-red-50 p-2 border border-red-100">
                Seluruh data IRS mahasiswa yang terdaftar di kelas ini akan ikut terhapus secara permanen.
              </p>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-[11px] font-bold uppercase border hover:bg-gray-100">Batal</button>
              <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-[11px] font-bold uppercase bg-red-600 text-white flex items-center gap-2 hover:bg-red-700">
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Ya, Hapus Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <Header
        subtitle="Detail Informasi Kelas"
        rightContent={
          <button onClick={() => navigate(-1)} className="flex items-center text-[11px] font-bold uppercase bg-gray-700 px-3 py-1 border border-gray-800 hover:bg-gray-600 text-white">
            <ArrowLeft size={14} className="mr-2" /> Kembali
          </button>
        }
      />

      <div className="max-w-[1000px] mx-auto p-4 md:p-8 space-y-6">

        {/* INFO UTAMA KELAS */}
        <div className="bg-white border border-gray-300 shadow-sm overflow-hidden">
          <div className="bg-[#f8f8f8] border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-blue-700">
              <UserCheck size={20} />
              <h1 className="font-black uppercase tracking-tight text-gray-800 text-lg">
                Kelas {classData?.namaKelas} - {classData?.namaMatkul}
              </h1>
            </div>
            {user?.role === 'DOSEN' && (
              <div className="flex gap-2">
                <button onClick={() => navigate(`edit`)} className="p-2 border hover:bg-blue-50 text-blue-700 transition-all bg-white"><Edit size={16} /></button>
                <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 border border-red-100 hover:bg-red-50 text-red-600 transition-all bg-white"><Trash2 size={16} /></button>
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Jadwal & Sesi Perkuliahan</label>
              <div className="font-mono text-gray-700 flex flex-col gap-2">
                {classData?.schedules && Array.isArray(classData.schedules) && classData.schedules.length > 0 ? (
                  classData.schedules.map((sched: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 bg-gray-50 p-2 border border-gray-200 text-xs">
                      <Calendar size={14} className="mt-0.5 text-gray-400 shrink-0" />
                      <span>
                        {typeof sched === 'object' && sched !== null
                          ? (
                            <>
                              <span className="font-bold text-gray-800">{getHariName(sched.hari)}</span>, {sched.jamMulai} - {sched.jamSelesai}
                              <br />
                              <span className="flex items-center gap-1 mt-1 text-gray-500 font-sans text-[10px]">
                                <MapPin size={10} /> {sched.ruangan}
                              </span>
                            </>
                          )
                          : sched /* Fallback jika data masih string */
                        }
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /> TBA</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Kapasitas</label>
              <p className="font-bold text-gray-700 flex items-center gap-2"><Users size={14} className="text-gray-400" /> {classData?.kapasitas} Mahasiswa</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Dosen Pengampu</label>
              <p className="font-bold text-blue-800 uppercase italic">
                {classData?.namaDosen || 'Staf Pengajar'}
              </p>
            </div>
          </div>
        </div>

        {/* DAFTAR MAHASISWA  */}
        {user?.role === 'DOSEN' && (
          <div className="bg-white border border-gray-300 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#2d3e50] text-white p-4 flex items-center gap-3">
              <GraduationCap size={20} className="text-yellow-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Daftar Mahasiswa Terdaftar</h2>
              <span className="ml-auto bg-yellow-500 text-[#2d3e50] px-2 py-0.5 text-[10px] font-black rounded-full">
                {students.length} Orang
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-[10px] uppercase font-bold text-gray-500">
                    <th className="p-4 text-left w-12 italic">#</th>
                    <th className="p-4 text-left">NPM Mahasiswa</th>
                    <th className="p-4 text-left">Nama Lengkap</th>
                    <th className="p-4 text-center">Status IRS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.length > 0 ? (
                    students.map((std, idx) => (
                      <tr key={std.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-4 font-mono text-gray-400">{idx + 1}</td>
                        <td className="p-4 font-bold text-gray-700">{std.npm}</td>
                        <td className="p-4 uppercase text-gray-600 font-medium">{std.nama}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-sm text-[9px] font-black uppercase ${std.statusIrs === 'SETUJU' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            }`}>
                            {std.statusIrs}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                        --- Belum ada mahasiswa yang mengambil kelas ini ---
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetailPage;