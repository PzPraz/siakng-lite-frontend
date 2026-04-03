import { useNavigate } from "react-router-dom";

export const DosenServiceArea = () => {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-yellow-50 border border-yellow-400 p-4 hover:bg-yellow-100 cursor-pointer group">
        <h4 className="font-bold text-yellow-900 uppercase text-xs flex items-center">
          Kelola Mata Kuliah
        </h4>
        <p className="text-[11px] text-yellow-700 mt-1">Tambah, ubah, atau hapus mata kuliah di database.</p>
        <a href="/courses" className="inline-block mt-3 bg-[#2c2c2c] text-white px-4 py-1 text-[10px] font-bold uppercase">Buka Management</a>
      </div>

      <div onClick={() => navigate('/my-classes')} className="bg-white border border-gray-300 p-4 hover:border-blue-400 cursor-pointer group">
        <h4 className="font-bold text-blue-800 group-hover:underline uppercase text-xs">Lihat Kelas</h4>
        <p className="text-[11px] text-gray-500 mt-1">
          <button>
            Lihat dan kelola kelas-kelas yang Anda ampu.
          </button>
        </p>
      </div>
    </div>
  )
}
  ;