import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../contexts/useAuth';
import { getMyIrs } from '../../api/irs';
import { getAllClasses } from '../../api/classes';
import { getStudentGradesByClass } from '../../api/grades';
import type { ClassDetail, GradePerClassSummary } from '../../types';
import { normalizeNumericId } from '../../utils/auth';
import {
  computeIpk,
  computeWeightedNumericScore,
  toFixedScore,
  toGradePoint,
  toLetterGrade,
} from '../../utils/grade';

const MyGradesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<GradePerClassSummary[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const studentId = normalizeNumericId(user?.id);
      if (!studentId) {
        setError('ID mahasiswa tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      try {
        setError('');
        setLoading(true);

        const [irsResponse, classes] = await Promise.all([getMyIrs(), getAllClasses()]);
        const classMap = new Map<number, ClassDetail>();
        classes.forEach((item) => classMap.set(item.id, item));

        const classItems = irsResponse.filter((item) => typeof item.classId === 'number');
        const gradeResults = await Promise.all(
          classItems.map(async (item) => {
            const classId = item.classId as number;
            const grades = await getStudentGradesByClass(classId, studentId);

            // For mahasiswa, backend hides unpublished components.
            if (!grades || grades.length === 0) return null;

            const fallbackClass = classMap.get(classId);
            const sks = item.sks ?? fallbackClass?.sks ?? 0;
            const nilaiDariIrs =
              item.nilaiAkhir !== null && item.nilaiAkhir !== undefined
                ? Number(item.nilaiAkhir)
                : NaN;
            const numeric = Number.isFinite(nilaiDariIrs) ? toFixedScore(nilaiDariIrs) : computeWeightedNumericScore(grades);
            const letter = toLetterGrade(numeric);
            const point = toGradePoint(letter);

            return {
              classId,
              kodeMatkul: item.kodeMatkul ?? fallbackClass?.kodeMatkul ?? '-',
              namaMatkul: item.namaMatkul ?? fallbackClass?.namaMatkul ?? 'Mata Kuliah',
              namaKelas: item.namaKelas ?? fallbackClass?.namaKelas ?? '-',
              sks,
              nilaiAkhirNumerik: numeric,
              nilaiHuruf: letter,
              bobot: point,
            } as GradePerClassSummary;
          }),
        );

        setRows(gradeResults.filter((item): item is GradePerClassSummary => item !== null));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat nilai mahasiswa');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const ipk = useMemo(() => computeIpk(rows), [rows]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <Loader2 className="animate-spin text-blue-700" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-sm font-sans pb-20">
      <Header
        subtitle="Nilai Mahasiswa"
        rightContent={
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-[11px] font-bold uppercase bg-gray-700 hover:bg-gray-600 px-3 py-1.5 border border-gray-800 transition-all text-white shadow-sm"
          >
            <ArrowLeft size={14} className="mr-2" /> Dashboard
          </button>
        }
      />

      <div className="max-w-[1100px] mx-auto p-4 md:p-8 space-y-5">
        <div className="bg-white border border-gray-300 p-4 md:p-5 shadow-sm">
          <h1 className="text-sm md:text-base font-black uppercase text-gray-800 tracking-wide">Ringkasan Nilai Per Kelas</h1>
          <p className="text-[11px] text-gray-500 mt-1">Nilai ditampilkan hanya jika komponen pada kelas sudah dipublish oleh dosen.</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2">
            <span className="text-[10px] font-bold uppercase text-blue-700">IPK Saat Ini</span>
            <span className="text-base font-black text-blue-800">{ipk.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] font-mono flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="bg-white border border-gray-300 shadow-sm overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[7rem_1fr_4rem_4rem_6rem_4rem_4rem] bg-gray-100 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-600">
              <div className="p-3 border-r border-gray-200">Kode</div>
              <div className="p-3 border-r border-gray-200">Mata Kuliah</div>
              <div className="p-3 border-r border-gray-200 text-center">Kelas</div>
              <div className="p-3 border-r border-gray-200 text-center">SKS</div>
              <div className="p-3 border-r border-gray-200 text-center">Numerik</div>
              <div className="p-3 border-r border-gray-200 text-center">Huruf</div>
              <div className="p-3 text-center">Bobot</div>
            </div>

            {rows.length > 0 ? (
              rows.map((row) => (
                <div key={row.classId} className="grid grid-cols-[7rem_1fr_4rem_4rem_6rem_4rem_4rem] border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 transition-colors">
                  <div className="p-3 border-r border-gray-100 font-mono text-[11px] text-gray-700">{row.kodeMatkul}</div>
                  <div className="p-3 border-r border-gray-100">
                    <p className="font-bold text-gray-800 uppercase text-[12px] leading-tight">{row.namaMatkul}</p>
                  </div>
                  <div className="p-3 border-r border-gray-100 text-center font-black text-blue-700">{row.namaKelas}</div>
                  <div className="p-3 border-r border-gray-100 text-center font-bold">{row.sks}</div>
                  <div className="p-3 border-r border-gray-100 text-center font-mono font-bold">{row.nilaiAkhirNumerik.toFixed(2)}</div>
                  <div className="p-3 border-r border-gray-100 text-center font-black">{row.nilaiHuruf}</div>
                  <div className="p-3 text-center font-bold">{row.bobot.toFixed(2)}</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-[12px] italic">Belum ada nilai yang dipublish untuk kelas Anda.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGradesPage;
