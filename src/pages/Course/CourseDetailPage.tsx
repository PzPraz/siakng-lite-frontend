import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { getCourseDetail, deleteCourse, type Course } from '../../api/course';
import { useAuth } from '../../contexts/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchDetail(Number(id));
  }, [id]);

  const fetchDetail = async (courseId: number) => {
    try {
      setLoading(true);
      const data = await getCourseDetail(courseId);
      setCourse(data);
    } catch (err: unknown) {
      navigate('/404')
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await deleteCourse(Number(id));
      navigate('/courses');
    } catch (err: unknown) {
      setIsDeleteModalOpen(false);
      navigate('/404')
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
    <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans relative">

      {/* MODAL POPUP KONFIRMASI DELETE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-2 border-red-600 w-full max-w-md shadow-2xl">
            <div className="bg-red-600 text-white p-3 flex items-center gap-2 font-bold uppercase text-[11px]">
              <AlertTriangle size={16} /> Konfirmasi Penghapusan Data
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-1">Apakah Anda yakin ingin menghapus mata kuliah:</p>
              <p className="font-black text-red-600 uppercase mb-4 tracking-tight">
                [{course?.kode}] {course?.nama}
              </p>
              <p className="text-[10px] text-gray-500 italic bg-gray-50 p-2 border border-gray-200">
                Tindakan ini tidak dapat dibatalkan. Seluruh data kelas yang terhubung dengan mata kuliah ini juga akan terhapus.
              </p>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-[11px] font-bold uppercase border border-gray-300 hover:bg-gray-100 transition-all"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-[11px] font-bold uppercase bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Utama */}
      <Header
        subtitle="Informasi Detail Kurikulum"
        rightContent={
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-[11px] font-bold uppercase bg-gray-700 hover:bg-gray-600 px-3 py-1 border border-gray-800 transition-all"
          >
            <ArrowLeft size={14} className="mr-2" /> Kembali ke Daftar
          </button>
        }
      />

      <div className="max-w-[1000px] mx-auto p-4 md:p-8 space-y-6">
        {course && (
          <>
            {/* Kartu Informasi Utama */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="bg-[#f8f8f8] border-b border-gray-300 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Info size={18} className="text-blue-700" />
                  <h1 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                    Identitas Mata Kuliah
                  </h1>
                </div>

                {/* EDIT & DELETE */}
                {user?.role === 'DOSEN' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/courses/edit/${id}`)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 text-[10px] font-bold uppercase hover:bg-blue-50 text-blue-700 transition-all shadow-sm"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white border border-red-200 text-[10px] font-bold uppercase hover:bg-red-50 text-red-600 transition-all shadow-sm"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <section>
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Kode Matkul</label>
                  <p className="text-xl font-mono font-black text-blue-900">{course.kode}</p>
                </section>
                <section className="md:col-span-2">
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Nama Mata Kuliah</label>
                  <p className="text-xl font-bold uppercase text-gray-800">{course.nama}</p>
                </section>
                <section>
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Bobot Kredit</label>
                  <p className="text-lg font-bold text-gray-700">{course.sks} SKS</p>
                </section>
              </div>
            </div>


            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="bg-[#f8f8f8] border-b border-gray-300 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                    Daftar Kelas yang Dibuka
                  </h2>
                </div>
                {user?.role === 'DOSEN' && (
                  <button onClick={() => navigate(`add-class`)} className="text-[11px] font-bold uppercase text-blue-700 hover:underline">
                    + Buka Kelas Baru
                  </button>
                )}
              </div>
              <div className="p-6">
                {/* Tabel Kelas */}
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                      <th className="border border-gray-200 p-2 text-center">Kelas</th>
                      <th className="border border-gray-200 p-2">Jadwal Perkuliahan</th>
                      <th className="border border-gray-200 p-2 text-center">Kapasitas</th>
                      <th className="border border-gray-200 p-2 text-center">Dosen</th>
                      <th className="border border-gray-200 p-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.classes && course.classes.length > 0 ? (
                      course.classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-blue-50 transition-colors border-b border-gray-200 text-[12px]">
                          <td className="border border-gray-300 p-3 text-center font-black text-blue-800 uppercase">
                            {cls.namaKelas}
                          </td>
                          <td className="border border-gray-300 p-3 font-mono uppercase text-gray-600">
                            {cls.schedules && cls.schedules.length > 0 ? (
                              <ul className="list-disc pl-4">
                                {cls.schedules.map((sched, index) => {
                                  if (typeof sched === 'object' && sched !== null) {
                                    const getHariName = (hariNum: number) => {
                                      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                                      return days[hariNum] || 'Unknown';
                                    };
                                    return (
                                      <li key={index}>
                                        {getHariName(sched.hari)}, {sched.jamMulai} - {sched.jamSelesai} ({sched.ruangan})
                                      </li>
                                    );
                                  }
                                  else if (typeof sched === 'string') {
                                    return <li key={index}>{sched}</li>;
                                  }
                                  return null;
                                })}
                              </ul>
                            ) : (
                              'BELUM DIATUR'
                            )}
                          </td>

                          <td className="border border-gray-300 p-3 text-center font-bold">
                            {cls.kapasitas}
                          </td>

                          <td className="border border-gray-300 p-3 text-center font-bold">
                            {cls.namaDosen || 'BELUM DIATUR'}
                          </td>

                          <td className="border border-gray-300 p-3 text-center">
                            <button onClick={() => navigate(`/class/${cls.id}`)} className="text-[10px] uppercase font-bold text-gray-500 hover:text-blue-700 underline decoration-dotted">
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400 italic text-[11px]">
                          --- Belum ada kelas yang dibuat untuk periode ini ---
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;