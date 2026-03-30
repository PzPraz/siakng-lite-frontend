export const MahasiswaServiceArea = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-white border border-gray-300 p-4 hover:border-blue-400 cursor-pointer group">
      <h4 className="font-bold text-blue-800 group-hover:underline uppercase text-xs">Isi/Ubah IRS</h4>
      <p className="text-[11px] text-gray-500 mt-1">Lakukan pengisian Rencana Studi untuk Semester Genap 2025/2026.</p>
    </div>
    <div className="bg-white border border-gray-300 p-4 hover:border-blue-400 cursor-pointer group">
      <h4 className="font-bold text-blue-800 group-hover:underline uppercase text-xs">Riwayat Akademik</h4>
      <p className="text-[11px] text-gray-500 mt-1">Melihat transkrip nilai, IPK, dan riwayat studi Anda.</p>
    </div>
  </div>
);