import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Header } from '../components/layout/Header';
import { DosenServiceArea } from '../components/dashboard/DosenServiceArea';
import { MahasiswaServiceArea } from '../components/dashboard/MahasiswaServiceArea';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) return <div className="p-10 font-mono">Memuat data sistem...</div>;

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans">
      {/* Header Utama */}
      <Header
        subtitle="Sistem Informasi Akademik"
        rightContent={
          <>
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </>
        }
      />

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row p-4 gap-4">

        {/* SIDEBAR PROFIL */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-300 p-4">
            <h3 className="bg-gray-100 p-2 text-[11px] font-bold border-b border-gray-300 mb-4 uppercase">Data Pengguna</h3>

            <div className="space-y-4">
              <section>
                <label className="text-[10px] text-gray-500 uppercase font-bold">Nama Lengkap</label>
                <p className="font-bold text-gray-800 break-words uppercase">{user.nama}</p>
              </section>

              <section>
                <label className="text-[10px] text-gray-500 uppercase font-bold">Kode Identitas ({user.role === 'DOSEN' ? 'NIP' : 'NPM'})</label>
                <p className="font-mono text-gray-800">{user.npm_atau_nip}</p>
              </section>

              <section>
                <label className="text-[10px] text-gray-500 uppercase font-bold">Status/Peran</label>
                <p className="text-blue-700 font-bold uppercase">{user.role}</p>
              </section>

              <button
                onClick={handleLogout}
                className="hover:bg-gray-300 px-3 py-1 border border-grey-800 active:translate-y-px transition-all"
              >
                Logout
              </button>

              <div className="h-px bg-gray-200 my-4"></div>

            </div>
          </div>
        </aside>

        {/* KONTEN UTAMA */}
        <main className="flex-1 space-y-4">
          <h2 className="text-xl font-bold border-b-2 border-gray-100 pb-2 mb-4">Selamat Datang</h2>
          {user.role === 'DOSEN' ? (
            <DosenServiceArea />
          ) : (
            <MahasiswaServiceArea />
          )}

          {/* PENGUMUMAN */}
          <div className="bg-white border border-gray-300">
            <h3 className="bg-[#f8f8f8] p-3 text-xs font-bold border-b border-gray-300 uppercase tracking-wide">
              Berita / Pengumuman Akademik
            </h3>
            <div className="p-6 font-mono text-[12px] text-gray-700 whitespace-pre-line leading-6">
              {`13 - 24 Januari 2026 -------- Pengisian IRS
30 Januari 2026 ----------- Batas Akhir Pengajuan Cuti
02 - 06 Februari 2026 ------ Masa Add / Drop IRS
16 - 27 Maret 2026 -------- Perkuliahan Online (Tengah Semester)`}
              <div className="mt-4 text-[10px] text-right text-gray-400">Dipublikasikan pada: 29 Jan 2026</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;