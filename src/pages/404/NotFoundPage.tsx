import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans">
            {/* Header Utama  */}
            <Header
                subtitle="Sistem Informasi Akademik"
                rightContent={
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-1 border border-gray-800 active:translate-y-px transition-all text-white text-[11px] font-bold uppercase"
                    >
                        Dashboard
                    </button>
                }
            />

            <div className="max-w-[1400px] mx-auto p-4 mt-10 flex justify-center">
                <div className="w-full max-w-2xl bg-white border border-gray-300">
                    <h3 className="bg-[#f8f8f8] p-3 text-xs font-bold border-b border-gray-300 uppercase tracking-wide">
                        Peringatan Sistem: 404 Not Found
                    </h3>

                    <div className="p-10 flex flex-col items-center text-center space-y-4">
                        <h1 className="text-6xl font-black text-gray-800 tracking-tighter">404</h1>
                        <h2 className="text-sm font-bold uppercase text-gray-600">Halaman Tidak Ditemukan</h2>

                        <p className="font-mono text-[12px] text-gray-700 bg-gray-50 border border-gray-200 p-4 w-full">
                            Maaf, URL atau rute yang Anda tuju tidak valid atau tidak terdaftar di dalam sistem akademik ini.
                        </p>

                        <div className="pt-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-blue-700 hover:bg-blue-800 text-white font-bold uppercase text-[11px] px-6 py-2 border border-blue-900 transition-all active:translate-y-px"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;