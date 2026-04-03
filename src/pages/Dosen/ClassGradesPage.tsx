import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { getClassDetail, getStudentsInClass } from '../../api/classes';
import {
  createGradeComponents,
  deleteGradeComponent,
  getGradeComponents,
  getStudentGradesByClass,
  gradeStudent,
  setClassGradePublishStatus,
  updateGradeComponent,
} from '../../api/grades';
import type {
  ClassDetail,
  CreateGradeDto,
  GradeComponent,
  Student,
  StudentGradeItem,
} from '../../types';
import { toFixedScore, toGradePoint, toLetterGrade } from '../../utils/grade';
import { normalizeNumericId } from '../../utils/auth';

const ClassGradesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const classId = Number(id);

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [components, setComponents] = useState<GradeComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentWeight, setNewComponentWeight] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [updatingComponentId, setUpdatingComponentId] = useState<number | null>(null);
  const [componentDrafts, setComponentDrafts] = useState<Record<number, { componentName: string; weight: string }>>({});

  const [savingStudentId, setSavingStudentId] = useState<number | null>(null);
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});

  const totalWeight = useMemo(
    () => components.reduce((sum, component) => sum + component.weight, 0),
    [components],
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!id || Number.isNaN(classId)) {
        navigate('/404', { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [detail, studentList, componentList] = await Promise.all([
          getClassDetail(classId),
          getStudentsInClass(classId),
          getGradeComponents(classId),
        ]);

        setClassData(detail);
        setStudents(studentList);
        setComponents(componentList);

        const studentsWithId = studentList.filter((student) => normalizeNumericId(student.id) !== null);
        const gradeResponses = await Promise.all(
          studentsWithId.map((student) => getStudentGradesByClass(classId, normalizeNumericId(student.id) as number)),
        );

        const nextDrafts: Record<string, string> = {};
        gradeResponses.forEach((studentGrades, index) => {
          const studentId = normalizeNumericId(studentsWithId[index].id) as number;
          studentGrades.forEach((item: StudentGradeItem) => {
            nextDrafts[`${studentId}-${item.componentId}`] = item.value ?? '';
          });
        });

        setGradeDrafts(nextDrafts);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data nilai kelas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, classId, navigate]);

  useEffect(() => {
    const nextDrafts: Record<number, { componentName: string; weight: string }> = {};
    components.forEach((component) => {
      if (typeof component.id === 'number') {
        nextDrafts[component.id] = {
          componentName: component.componentName,
          weight: String(component.weight),
        };
      }
    });
    setComponentDrafts(nextDrafts);
  }, [components]);

  const refreshComponents = async () => {
    const latest = await getGradeComponents(classId);
    setComponents(latest);
  };

  const handleAddComponent = async () => {
    const componentName = newComponentName.trim();
    const weight = Number(newComponentWeight);

    if (!componentName) {
      setError('Nama komponen wajib diisi');
      return;
    }

    if (Number.isNaN(weight)) {
      setError('Bobot komponen harus berupa angka');
      return;
    }

    try {
      setError('');
      await createGradeComponents({
        classId,
        components: [{ componentName, weight }],
      });

      setNewComponentName('');
      setNewComponentWeight('');
      setActionMessage('Komponen nilai berhasil ditambahkan');
      await refreshComponents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menambah komponen nilai');
    }
  };

  const handleDeleteComponent = async (componentId?: number) => {
    if (!componentId) return;

    try {
      setError('');
      await deleteGradeComponent(componentId);
      setActionMessage('Komponen nilai berhasil dihapus');
      await refreshComponents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus komponen nilai');
    }
  };

  const handleUpdateComponent = async (componentId?: number) => {
    if (!componentId) return;

    const draft = componentDrafts[componentId];
    if (!draft) return;

    const componentName = draft.componentName.trim();
    const weight = Number(draft.weight);

    if (!componentName) {
      setError('Nama komponen wajib diisi');
      return;
    }

    if (Number.isNaN(weight)) {
      setError('Bobot komponen harus berupa angka');
      return;
    }

    try {
      setError('');
      setUpdatingComponentId(componentId);
      await updateGradeComponent(componentId, {
        classId,
        components: [{ componentName, weight }],
      });
      setActionMessage('Komponen nilai berhasil diperbarui');
      await refreshComponents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui komponen nilai');
    } finally {
      setUpdatingComponentId(null);
    }
  };

  const handleGradeChange = (studentId: number, componentId: number, value: string) => {
    if (value !== '' && !/^\d{1,3}(\.\d{0,2})?$/.test(value)) {
      return;
    }

    setGradeDrafts((prev) => ({
      ...prev,
      [`${studentId}-${componentId}`]: value,
    }));
  };

  const getStudentFinalScore = (studentId: number) => {
    const finalScore = components
      .filter((component) => typeof component.id === 'number')
      .reduce((sum, component) => {
        const componentId = component.id as number;
        const key = `${studentId}-${componentId}`;
        const scoreValue = Number(gradeDrafts[key] ?? 0);
        const normalizedScore = Number.isFinite(scoreValue) ? scoreValue : 0;
        return sum + normalizedScore * (component.weight / 100);
      }, 0);

    const numeric = toFixedScore(finalScore);
    const letter = toLetterGrade(numeric);
    const point = toGradePoint(letter);

    return { numeric, letter, point };
  };

  const handleSaveStudentGrades = async (studentId?: number) => {
    if (!studentId) {
      setError('ID mahasiswa tidak ditemukan untuk menyimpan nilai');
      return;
    }

    if (components.length === 0) {
      setError('Tambahkan minimal satu komponen nilai terlebih dahulu');
      return;
    }

    const payload: CreateGradeDto[] = components
      .filter((component) => typeof component.id === 'number')
      .map((component) => {
        const key = `${studentId}-${component.id as number}`;
        const rawValue = gradeDrafts[key];

        return {
          componentId: component.id as number,
          value: rawValue === '' || rawValue === undefined ? 0 : Number(rawValue),
        };
      });

    try {
      setError('');
      setSavingStudentId(studentId);
      await gradeStudent(studentId, payload);
      setActionMessage('Nilai mahasiswa berhasil disimpan');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan nilai mahasiswa');
    } finally {
      setSavingStudentId(null);
    }
  };

  const handlePublish = async (isPublished: boolean) => {
    try {
      setError('');
      setPublishing(true);
      await setClassGradePublishStatus(classId, isPublished);
      setActionMessage(isPublished ? 'Nilai berhasil dipublish' : 'Publish nilai dibatalkan');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status publish nilai');
    } finally {
      setPublishing(false);
    }
  };

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
        subtitle="Input dan Komponen Penilaian Kelas"
        rightContent={
          <button
            onClick={() => navigate('/my-classes')}
            className="flex items-center text-[11px] font-bold uppercase bg-gray-700 hover:bg-gray-600 px-3 py-1.5 border border-gray-800 transition-all text-white shadow-sm"
          >
            <ArrowLeft size={14} className="mr-2" /> Kembali
          </button>
        }
      />

      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-5">
        <div className="bg-white border border-gray-300 p-4 md:p-5 shadow-sm">
          <h1 className="text-sm md:text-base font-black uppercase text-gray-800 tracking-wide">
            Nilai Kelas {classData?.namaKelas} - {classData?.namaMatkul}
          </h1>
          <p className="text-[11px] text-gray-500 mt-1">Total bobot komponen saat ini: {totalWeight}%</p>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] font-mono">
              {error}
            </div>
          )}

          {actionMessage && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-700 text-[12px] font-mono">
              {actionMessage}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-300 shadow-sm p-4 md:p-5 space-y-4">
          <h2 className="text-[12px] md:text-sm font-bold uppercase text-gray-700">Komponen Penilaian</h2>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3">
            <input
              type="text"
              placeholder="Nama komponen (contoh: UTS)"
              value={newComponentName}
              onChange={(e) => setNewComponentName(e.target.value)}
              className="px-3 py-2 border border-gray-300 text-[12px] focus:border-blue-500 outline-none"
            />
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Bobot (%)"
              value={newComponentWeight}
              onChange={(e) => setNewComponentWeight(e.target.value)}
              className="px-3 py-2 border border-gray-300 text-[12px] focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleAddComponent}
              className="px-4 py-2 bg-blue-700 text-white text-[11px] uppercase font-bold flex items-center justify-center gap-2 hover:bg-blue-800"
            >
              <Plus size={14} /> Tambah
            </button>
          </div>

          {components.length > 0 ? (
            <div className="border border-gray-200">
              <div className="grid grid-cols-[1fr_6rem_8rem_5rem] bg-gray-100 border-b text-[10px] uppercase font-bold text-gray-600">
                <div className="p-3 border-r border-gray-200">Komponen</div>
                <div className="p-3 border-r border-gray-200 text-center">Bobot</div>
                <div className="p-3 border-r border-gray-200 text-center">Update</div>
                <div className="p-3 text-center">Hapus</div>
              </div>

              {components.map((component) => (
                <div key={component.id ?? component.componentName} className="grid grid-cols-[1fr_6rem_8rem_5rem] border-b border-gray-100 last:border-b-0">
                  <div className="p-2 border-r border-gray-100">
                    <input
                      type="text"
                      value={component.id ? (componentDrafts[component.id]?.componentName ?? component.componentName) : component.componentName}
                      onChange={(e) => {
                        if (!component.id) return;
                        setComponentDrafts((prev) => ({
                          ...prev,
                          [component.id as number]: {
                            componentName: e.target.value,
                            weight: prev[component.id as number]?.weight ?? String(component.weight),
                          },
                        }));
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 text-[12px] focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="p-2 border-r border-gray-100">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={component.id ? (componentDrafts[component.id]?.weight ?? String(component.weight)) : String(component.weight)}
                      onChange={(e) => {
                        if (!component.id) return;
                        setComponentDrafts((prev) => ({
                          ...prev,
                          [component.id as number]: {
                            componentName: prev[component.id as number]?.componentName ?? component.componentName,
                            weight: e.target.value,
                          },
                        }));
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 text-[12px] focus:border-blue-500 outline-none text-center"
                    />
                  </div>
                  <div className="p-2 border-r border-gray-100 flex items-center justify-center">
                    <button
                      onClick={() => handleUpdateComponent(component.id)}
                      disabled={updatingComponentId === component.id}
                      className="px-2 py-1 bg-blue-700 text-white text-[10px] uppercase font-bold disabled:opacity-50"
                    >
                      {updatingComponentId === component.id ? '...' : 'Simpan'}
                    </button>
                  </div>
                  <div className="p-2 flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteComponent(component.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Hapus komponen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12px] text-gray-400 italic">Belum ada komponen penilaian.</div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePublish(true)}
              disabled={publishing || components.length === 0}
              className="px-4 py-2 bg-green-700 text-white text-[11px] uppercase font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Publish Nilai
            </button>
            <button
              onClick={() => handlePublish(false)}
              disabled={publishing || components.length === 0}
              className="px-4 py-2 bg-gray-700 text-white text-[11px] uppercase font-bold disabled:opacity-50"
            >
              Batalkan Publish
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-300 shadow-sm overflow-x-auto">
          <div className="min-w-[900px]">
            <div
              className="grid bg-gray-100 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-600"
              style={{ gridTemplateColumns: `14rem repeat(${components.length}, minmax(7rem, 1fr)) 10rem 7rem` }}
            >
              <div className="p-3 border-r border-gray-200">Mahasiswa</div>
              {components.map((component) => (
                <div key={component.id ?? component.componentName} className="p-3 border-r border-gray-200 text-center">
                  {component.componentName}
                </div>
              ))}
              <div className="p-3 border-r border-gray-200 text-center">Nilai Akhir</div>
              <div className="p-3 text-center">Simpan</div>
            </div>

            {students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.id ?? student.npm}
                  className="grid border-b border-gray-100 last:border-b-0"
                  style={{ gridTemplateColumns: `14rem repeat(${components.length}, minmax(7rem, 1fr)) 10rem 7rem` }}
                >
                  <div className="p-3 border-r border-gray-100 text-[12px]">
                    <p className="font-bold text-gray-800 uppercase">{student.nama}</p>
                    <p className="text-gray-500 text-[10px] font-mono">{student.npm}</p>
                  </div>

                  {components.map((component) => {
                    const componentId = component.id as number;
                    const studentId = normalizeNumericId(student.id);
                    if (studentId === null || typeof componentId !== 'number') {
                      return (
                        <div key={`${student.npm}-${component.componentName}`} className="p-2 border-r border-gray-100">
                          <input
                            type="number"
                            disabled
                            className="w-full px-2 py-1.5 border border-gray-200 text-[12px] bg-gray-50"
                          />
                        </div>
                      );
                    }

                    const key = `${studentId}-${componentId}`;

                    return (
                      <div key={key} className="p-2 border-r border-gray-100">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={gradeDrafts[key] ?? ''}
                          onChange={(e) => handleGradeChange(studentId, componentId, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 text-[12px] focus:border-blue-500 outline-none text-center"
                        />
                      </div>
                    );
                  })}

                  <div className="p-2 border-r border-gray-100 flex flex-col justify-center items-center text-center bg-gray-50">
                    {(() => {
                      const studentId = normalizeNumericId(student.id);
                      if (studentId === null) {
                        return <span className="text-[10px] text-gray-400 italic">N/A</span>;
                      }

                      const finalResult = getStudentFinalScore(studentId);
                      return (
                        <>
                          <span className="text-[12px] font-black text-blue-700">{finalResult.numeric}</span>
                          <span className="text-[10px] font-bold text-gray-600">{finalResult.letter} ({finalResult.point.toFixed(2)})</span>
                        </>
                      );
                    })()}
                  </div>

                  <div className="p-2 flex items-center justify-center">
                    <button
                      onClick={() => handleSaveStudentGrades(normalizeNumericId(student.id) ?? undefined)}
                      disabled={savingStudentId === normalizeNumericId(student.id) || components.length === 0 || normalizeNumericId(student.id) === null}
                      className="px-2 py-1.5 bg-blue-700 text-white text-[10px] uppercase font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      {savingStudentId === normalizeNumericId(student.id) ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      Simpan
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-[12px] italic">Belum ada mahasiswa di kelas ini.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassGradesPage;
