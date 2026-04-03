import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Search } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { getMyClass } from '../../api/classes';
import { useAuth } from '../../contexts/useAuth';
import { type ClassDetail, type ScheduleItem } from '../../types';
import { getHariName } from '../../utils/helper';

const CurrentClassesPage = () => {
	const navigate = useNavigate();
	const [classes, setClasses] = useState<ClassDetail[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const { user } = useAuth();

	useEffect(() => {
		const fetchClasses = async () => {
			const dosenId = user?.npm_atau_nip;
			if (!dosenId) return;
			try {
				setLoading(true);
				const data = await getMyClass(dosenId);
				setClasses(data);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Gagal mengambil daftar kelas');
			} finally {
				setLoading(false);
			}
		};

		fetchClasses();
	}, [user?.npm_atau_nip]);

	const filteredClasses = classes.filter(c =>
		c.namaKelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
		c.namaMatkul.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-[#f3f3f3] text-sm font-sans pb-20">
			{/* Header */}
			<Header
				subtitle="Katalog Mata Kuliah"
				rightContent={
					<button
						onClick={() => navigate('/dashboard')}
						className="flex items-center text-[11px] font-bold uppercase bg-gray-700 hover:bg-gray-600 px-3 py-1.5 border border-gray-800 transition-all text-white shadow-sm"
					>
						<ArrowLeft size={14} className="mr-2" /> Dashboard
					</button>
				}
			/>

			<div className="max-w-[1200px] mx-auto p-4 md:p-8">
				<div className="bg-white border border-gray-300 shadow-sm flex flex-col">
					{/* Toolbar */}
					<div className="bg-[#f8f8f8] border-b border-gray-300 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<h1 className="text-sm font-bold uppercase tracking-wide text-gray-800">
								Daftar Kelas
							</h1>
						</div>

						<div className="flex items-center gap-3">
							{/* Search Bar */}
							<div className="relative w-full md:w-auto">
								<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									type="text"
									placeholder="Cari Nama Kelas / Matkul"
									className="pl-9 pr-3 py-1.5 border border-gray-300 focus:border-blue-500 outline-none text-[12px] w-full md:w-64 uppercase"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="p-4">
						{error && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] font-mono">
								<strong>STATUS:</strong> {error}
							</div>
						)}

						{loading ? (
							<div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
								<Loader2 className="animate-spin" size={32} />
								<p className="font-mono text-[11px] uppercase tracking-widest">Sinkronisasi Data...</p>
							</div>
						) : (
							<div className="w-full border border-gray-200 flex flex-col">
								{/* Grid Header */}
								<div className="grid grid-cols-[1fr_2fr_5rem] md:grid-cols-[1.5fr_2fr_4rem_5rem_6rem] bg-gray-100 text-[11px] uppercase font-bold text-gray-600 tracking-wider border-b border-gray-200">
									<div className="p-3 border-r border-gray-200 flex items-center">Nama Mata Kuliah</div>
									<div className="p-3 border-r border-gray-200 flex items-center">Jadwal</div>
									<div className="hidden md:flex p-3 border-r border-gray-200 items-center justify-center text-center">SKS</div>
									<div className="hidden md:flex p-3 border-r border-gray-200 items-center justify-center text-center">Terisi</div>
									<div className="p-3 flex items-center justify-center text-center">Aksi</div>
								</div>

								{/* Grid Body */}
								<div className="text-gray-800 flex flex-col">
									{filteredClasses.length > 0 ? (
										filteredClasses.map((cls) => (
											<div key={cls.id} className="grid grid-cols-[1fr_2fr_5rem] md:grid-cols-[1.5fr_2fr_4rem_5rem_6rem] hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0">

												{/* Nama Matkul & Kelas */}
												<div className="p-3 border-r border-gray-200 flex flex-col justify-center">
													<span className="font-mono text-[12px] md:text-sm font-bold text-blue-800 uppercase leading-tight">
														{cls.namaMatkul}
													</span>
													<span className="font-bold text-[10px] md:text-[11px] text-gray-500 uppercase mt-1">
														KELAS {cls.namaKelas}
													</span>
												</div>

												{/* Jadwal */}
												<div className="p-3 border-r border-gray-200 text-[9px] md:text-[10px] uppercase font-mono text-gray-600 flex items-center">
													{cls.schedules && Array.isArray(cls.schedules) && cls.schedules.length > 0 ? (
														<ul className="space-y-1 w-full pl-2 md:pl-4">
															{cls.schedules.map((sched: ScheduleItem, idx: number) => (
																<li key={idx} className="flex items-start gap-1 leading-tight list-none md:list-item -ml-2 md:ml-0">
																	<span className="text-blue-600 font-black mr-1 md:hidden">•</span>
																	{typeof sched === 'object' && sched !== null ? (
																		<span>
																			<strong className="text-gray-800">{getHariName(sched.hari)}</strong>, {sched.jamMulai}-{sched.jamSelesai} ({sched.ruangan})
																		</span>
																	) : (
																		<span>{sched}</span> // Fallback
																	)}
																</li>
															))}
														</ul>
													) : (
														<span className="text-gray-400 italic pl-2 md:pl-4">BELUM DIATUR</span>
													)}
												</div>

												{/* SKS */}
												<div className="hidden md:flex p-3 border-r border-gray-200 items-center justify-center text-center font-bold">
													{cls.sks}
												</div>

												{/* Kapasitas */}
												<div className="hidden md:flex p-3 border-r border-gray-200 flex-col items-center justify-center text-center">
													<span className="font-bold text-sm text-gray-800">{cls.terisi}/{cls.kapasitas}</span>
													<span className="text-[9px] text-gray-400 uppercase mt-0.5">Kursi</span>
												</div>

												{/* Aksi */}
												<div className="p-3 flex items-center justify-center">
													<button
														className="text-[10px] uppercase font-bold text-gray-500 hover:text-blue-700 underline decoration-dotted transition-colors"
														onClick={() => navigate(`/class/${cls.id}`)}
													>
														Detail
													</button>
												</div>

											</div>
										))
									) : (
										<div className="p-10 text-center text-gray-400 italic font-mono text-[12px]">
											--- Tidak ada data kelas ditemukan ---
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="bg-gray-50 border-t border-gray-300 p-3 flex justify-between items-center text-[10px] text-gray-500 mt-auto">
						<div>Menampilkan {filteredClasses.length} entitas kelas</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CurrentClassesPage;