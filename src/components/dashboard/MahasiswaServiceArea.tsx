import { useNavigate } from "react-router-dom";

export const MahasiswaServiceArea = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div onClick={() => navigate('/course-plan/summary')} className="bg-white border border-gray-300 p-4 hover:border-blue-400 cursor-pointer group">
        <h4 className="font-bold text-blue-800 group-hover:underline uppercase text-xs">Lihat IRS</h4>
        <p className="text-[11px] text-gray-500 mt-1">Lihat Rencana Studi Anda.</p>
      </div>
      <div onClick={() => navigate('/course-plan/edit')} className="bg-white border border-gray-300 p-4 hover:border-blue-400 cursor-pointer group">
        <h4 className="font-bold text-blue-800 group-hover:underline uppercase text-xs">Isi/Ubah IRS</h4>
        <p className="text-[11px] text-gray-500 mt-1">Lakukan pengisian Rencana Studi.</p>
      </div>
      <div className="bg-white border border-gray-300 p-4 hover:border-blue-400 cursor-pointer group">
        <h4 className="font-bold text-blue-800 group-hover:underline uppercase text-xs">Riwayat Akademik</h4>
        <p className="text-[11px] text-gray-500 mt-1">Melihat transkrip nilai, IPK, dan riwayat studi Anda.</p>
      </div>
      <div onClick={() => navigate('/class')} className="bg-white border border-gray-300 p-4 hover:border-blue-400 cursor-pointer group">
        <h4 className="font-bold text-blue-800 group-hover:underline uppercase text-xs">Jadwal Kuliah</h4>
        <p className="text-[11px] text-gray-500 mt-1"><button>
        </button>Melihat jadwal kuliah keseluruhan</p>
      </div>
      <div onClick={() => navigate('/courses')} className="bg-white border border-gray-300 p-4 hover:border-blue-400 cursor-pointer group">
        <h4 className="font-bold text-blue-800 group-hover:underline uppercase text-xs">Lihat Mata Kuliah</h4>
        <p className="text-[11px] text-gray-500 mt-1"><button>
        </button>Melihat daftar mata kuliah</p>
      </div>

    </div>
  )
};