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
          <div className="bg-[#f8f8f8] border-b p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-start sm:items-center gap-3 text-blue-700">
              <UserCheck size={20} className="shrink-0 mt-0.5 sm:mt-0" />
              <h1 className="font-black uppercase tracking-tight text-gray-800 text-base md:text-lg leading-tight">
                Kelas {classData?.namaKelas} - {classData?.namaMatkul}
              </h1>
            </div>

            {user?.role === 'DOSEN' && (
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button onClick={() => navigate(`edit`)} className="p-2 border border-gray-300 hover:bg-blue-50 text-blue-700 transition-all bg-white flex-1 sm:flex-none flex justify-center items-center">
                  <Edit size={16} />
                </button>
                <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 border border-red-200 hover:bg-red-50 text-red-600 transition-all bg-white flex-1 sm:flex-none flex justify-center items-center">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
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
                                <MapPin size={10} className="shrink-0" /> <span className="truncate">{sched.ruangan}</span>
                              </span>
                            </>
                          )
                          : sched
                        }
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="flex items-center gap-2 text-xs"><Calendar size={14} className="text-gray-400" /> TBA</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Kapasitas</label>
              <p className="font-bold text-gray-700 flex items-center gap-2 text-xs md:text-sm">
                <Users size={14} className="text-gray-400 shrink-0" /> {classData?.kapasitas} Mahasiswa
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Dosen Pengampu</label>
              <p className="font-bold text-blue-800 uppercase italic text-xs md:text-sm leading-tight">
                {classData?.namaDosen || 'Staf Pengajar'}
              </p>
            </div>
          </div>
        </div>

        {/* DAFTAR MAHASISWA  */}
        {user?.role === 'DOSEN' && (
          <div className="bg-white border border-gray-300 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#2d3e50] text-white p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <GraduationCap size={20} className="text-yellow-500 shrink-0" />
                <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest">Daftar Mahasiswa Terdaftar</h2>
              </div>
              <span className="bg-yellow-500 text-[#2d3e50] px-2.5 py-1 text-[10px] font-black rounded-full whitespace-nowrap">
                {students.length} Orang
              </span>
            </div>

            {/* TABEL MAHASISWA */}
            <div className="w-full flex flex-col border-b border-gray-200">
              {/* Grid Header */}
              <div className="grid grid-cols-[1fr_5rem] md:grid-cols-[4rem_10rem_1fr_8rem] bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                <div className="hidden md:flex p-3 md:p-4 border-r border-gray-100 justify-center items-center italic">#</div>
                <div className="hidden md:flex p-3 md:p-4 border-r border-gray-100 justify-center items-center text-center">NPM Mahasiswa</div>
                <div className="p-3 md:p-4 border-r border-gray-100 flex items-center">Nama Lengkap</div>
                <div className="p-3 md:p-4 flex items-center justify-center text-center">Status IRS</div>
              </div>

              {/* Grid Body */}
              <div className="flex flex-col text-xs md:text-sm text-gray-800">
                {students.length > 0 ? (
                  students.map((std, idx) => (
                    <div key={std.id} className="grid grid-cols-[1fr_5rem] md:grid-cols-[4rem_10rem_1fr_8rem] border-b border-gray-100 hover:bg-blue-50/50 transition-colors last:border-b-0">

                      {/* Nomor (Desktop) */}
                      <div className="hidden md:flex p-3 md:p-4 font-mono text-gray-400 justify-center items-center border-r border-gray-100">
                        {idx + 1}
                      </div>

                      {/* NPM (Desktop) */}
                      <div className="hidden md:flex p-3 md:p-4 font-bold font-mono text-gray-700 justify-center items-center border-r border-gray-100 text-center">
                        {std.npm}
                      </div>

                      {/* Nama & NPM (Mobile) */}
                      <div className="p-3 md:p-4 border-r border-gray-100 flex flex-col justify-center">
                        <span className="uppercase text-gray-800 font-medium leading-tight">{std.nama}</span>
                        <span className="md:hidden font-mono text-[10px] font-bold text-gray-500 mt-1">
                          {std.npm}
                        </span>
                      </div>

                      {/* Status IRS */}
                      <div className="p-3 md:p-4 flex items-center justify-center text-center">
                        <span className={`px-2 py-1 rounded-sm text-[9px] font-black uppercase border ${std.statusIrs === 'SETUJU'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}>
                          {std.statusIrs}
                        </span>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-400 italic font-mono text-xs">
                    --- Belum ada mahasiswa yang mengambil kelas ini ---
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetailPage;