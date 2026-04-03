import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { getMyIrs } from "../../api/irs";
import { getAllClasses } from "../../api/classes";
import { Loader2, ArrowLeft, AlertCircle, AlertTriangle } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { useNavigate } from "react-router-dom";
import type { MergedIrsData, IrsResponse, ClassDetail } from '../../types';
import { timeToMinutes, getCourseColor } from "../../utils/helper";
import { DAYS, END_HOUR, START_HOUR, HOURS, PIXELS_PER_MINUTE } from "../../utils/enum";

const StudyPlanSummaryPage = () => {
	const { user } = useAuth();
	const [mergedData, setMergedData] = useState<MergedIrsData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [activeTab, setActiveTab] = useState<'irs' | 'jadwal'>('jadwal');
	const navigate = useNavigate();

	useEffect(() => {
		const initData = async () => {
			setLoading(true);
			try {
				const [irsResponse, classesResponse] = await Promise.all([
					getMyIrs(),
					getAllClasses()
				]);

			const combinedData = irsResponse.map((irs: IrsResponse) => {
				const classDetail = classesResponse.find((cls: ClassDetail) => cls.id === irs.classId);
					return {
						id: irs.id,
						classId: irs.classId,
						status: irs.status,
						namaKelas: classDetail?.namaKelas || 'Unknown',
						namaMatkul: classDetail?.namaMatkul || 'Mata Kuliah Tidak Ditemukan',
						kodeMatkul: classDetail?.kodeMatkul || '-',
						sks: classDetail?.sks || 0,
						namaDosen: classDetail?.namaDosen || 'Staf Pengajar',
						schedules: classDetail?.schedules || [],
					};
				});

				setMergedData(combinedData);
			} catch (err: unknown) {
				if (err instanceof Error) setError(err.message || "Gagal menyinkronkan data mata kuliah.");
			} finally {
				setLoading(false);
			}
		}
		initData();
	}, []);

	const totalSKS = mergedData.reduce((acc, curr) => acc + (curr.sks || 0), 0);

	const flatSchedules = mergedData.flatMap(item =>
		item.schedules?.map(s => ({
			...s,
			namaMatkul: item.namaMatkul,
			namaKelas: item.namaKelas,
		})) || []
	);

	// LOGIKA DETEKSI BENTROK
	let hasOverlap = false;
	for (let i = 0; i < flatSchedules.length; i++) {
		for (let j = i + 1; j < flatSchedules.length; j++) {
			const a = flatSchedules[i];
			const b = flatSchedules[j];

			if (a.hari === b.hari) {
				const startA = timeToMinutes(a.jamMulai);
				const endA = timeToMinutes(a.jamSelesai);
				const startB = timeToMinutes(b.jamMulai);
				const endB = timeToMinutes(b.jamSelesai);

				if (startA < endB && endA > startB) {
					hasOverlap = true;
					break;
				}
			}
		}
		if (hasOverlap) break;
	}

	if (loading) return (
		<div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
			<Loader2 className="animate-spin text-blue-700" size={32} />
		</div>
	);

	return (
		<div className='min-h-screen bg-[#f8fafc] text-sm font-sans pb-20'>
			<Header
				subtitle="Ringkasan Rencana Studi"
				rightContent={
					<button
						onClick={() => navigate('/dashboard')}
						className="flex items-center text-[11px] font-bold uppercase bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-all text-white shadow-sm"
					>
						<ArrowLeft size={14} className="mr-2" /> Kembali
					</button>
				}
			/>

			<div className="max-w-[1300px] mx-auto p-4 md:p-6 flex flex-col gap-6">

				{/* PANEL INFORMASI MAHASISWA */}
				<div className="bg-white shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
					<div className="flex flex-wrap gap-8">
						<div>
							<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nama Mahasiswa</p>
							<p className="font-bold text-slate-800 text-sm flex items-center gap-2">
								{user?.nama || 'N/A'}
								<span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
									{user?.npm_atau_nip}
								</span>
							</p>
						</div>
						<div>
							<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total SKS</p>
							<p className={`font-black text-sm ${totalSKS > 24 ? 'text-rose-600' : 'text-emerald-600'}`}>
								{totalSKS} <span className="text-xs font-semibold text-slate-500">/ 24 SKS</span>
							</p>
						</div>
						<div>
							<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status IRS</p>
							<span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${mergedData.length > 0 && mergedData[0].status === 'APPROVED'
								? 'bg-emerald-50 text-emerald-700 border-emerald-200'
								: 'bg-amber-50 text-amber-700 border-amber-200'
								}`}>
								{mergedData.length > 0 ? mergedData[0].status : 'KOSONG'}
							</span>
						</div>
					</div>
				</div>

				{error && (
					<div className="bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-mono flex items-center gap-2 rounded-lg">
						<AlertCircle size={14} /> {error.toUpperCase()}
					</div>
				)}

				{/* WARNING BENTROK */}
				{hasOverlap && (
					<div className="bg-amber-50 border border-amber-200 p-3 md:p-4 text-amber-800 text-xs md:text-sm font-sans flex items-start gap-3 shadow-sm rounded-lg animate-in fade-in slide-in-from-top-2">
						<AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />
						<div>
							<p className="font-bold uppercase tracking-wide mb-1 text-amber-900">Peringatan: Terdeteksi Jadwal Bentrok</p>
							<p className="leading-relaxed opacity-90">
								Sistem mendeteksi adanya tumpang tindih waktu pada jadwal kelas Anda. Hal ini mungkin terjadi jika ada penyesuaian jadwal oleh program studi setelah Anda mendaftar. Validasi ketat akan dilakukan pada saat proses penyetujuan IRS oleh Pembimbing Akademik.
							</p>
						</div>
					</div>
				)}

				{/* TAB NAVIGATION */}
				<div className="flex bg-slate-100 p-1.5 gap-1 w-full max-w-sm border border-slate-200">
					<button
						onClick={() => setActiveTab('jadwal')}
						className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase transition-all ${activeTab === 'jadwal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
							}`}
					>
						Jadwal
					</button>
					<button
						onClick={() => setActiveTab('irs')}
						className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase transition-all  ${activeTab === 'irs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
							}`}
					>
						Ringkasan
					</button>
				</div>

				{/* KONTEN */}
				<div className="bg-white shadow-sm border border-slate-200 min-h-[400px] overflow-hidden">

					{/* TAB RINGKASAN IRS */}
					{activeTab === 'irs' && (
						<div className="w-full flex flex-col">
							{/* Grid Header */}
							<div className="grid grid-cols-[1fr_4rem_3rem] md:grid-cols-[3rem_6rem_1fr_4.5rem_3.5rem_12rem] bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
								<div className="hidden md:flex p-3 justify-center text-center border-r border-slate-200">No</div>
								<div className="hidden md:flex p-3 border-r border-slate-200 items-center">Kode</div>
								<div className="p-3 border-r border-slate-200 flex items-center">Mata Kuliah</div>
								<div className="p-3 text-center border-r border-slate-200 flex items-center justify-center">Kelas</div>
								<div className="p-3 text-center border-r border-slate-200 flex items-center justify-center">SKS</div>
								<div className="hidden md:flex p-3 items-center">Dosen</div>
							</div>

							{/* Grid Body */}
							<div className="flex flex-col text-sm text-slate-800">
								{mergedData.map((item, index) => (
									<div key={item.id} className="grid grid-cols-[1fr_4rem_3rem] md:grid-cols-[3rem_6rem_1fr_4.5rem_3.5rem_12rem] border-b border-slate-100 hover:bg-slate-50/80 transition-colors last:border-b-0">

										<div className="hidden md:flex p-3 items-center justify-center text-center text-slate-400 border-r border-slate-100">
											{index + 1}
										</div>

										<div className="hidden md:flex p-3 items-center font-mono text-[11px] text-slate-500 border-r border-slate-100">
											{item.kodeMatkul}
										</div>

										<div className="p-3 flex flex-col justify-center border-r border-slate-100">
											<span className="font-bold text-slate-800 uppercase leading-tight text-xs md:text-sm">{item.namaMatkul}</span>
											<span className="md:hidden font-mono text-[10px] text-slate-500 mt-1">{item.kodeMatkul}</span>
										</div>

										<div className="p-3 flex items-center justify-center text-center font-black text-blue-600 border-r border-slate-100 text-xs md:text-sm">
											{item.namaKelas}
										</div>

										<div className="p-3 flex items-center justify-center text-center font-bold text-slate-600 border-r border-slate-100 text-xs md:text-sm">
											{item.sks}
										</div>

										<div className="hidden md:flex p-3 items-center text-[11px] uppercase font-semibold text-slate-600 truncate">
											{item.namaDosen}
										</div>

									</div>
								))}
								{mergedData.length === 0 && (
									<div className="p-10 text-center text-slate-400 italic font-mono text-[11px]">
										-- Belum ada rencana studi yang diisi --
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === 'jadwal' && (
						<div className="overflow-x-auto bg-slate-50/50 custom-scrollbar">
							<div className="min-w-[950px] font-sans">

								{/* Header Kolom Hari */}
								<div className="flex bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
									<div className="w-16 shrink-0 border-r border-slate-100 flex flex-col items-center justify-center py-1.5 bg-white">
										<span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Jam</span>
									</div>
									{DAYS.map(day => (
										<div key={day.id} className="flex-1 text-center py-2 text-[10px] font-bold text-slate-700 border-r border-slate-100 last:border-r-0 uppercase tracking-widest bg-white">
											{day.name}
										</div>
									))}
								</div>

								{/* Grid Body Jadwal (Visual) */}
								<div className="flex relative pb-8">

									{/* Kolom Jam (Kiri) */}
									<div className="w-16 shrink-0 border-r border-slate-100 bg-white z-20">
										<div className="relative w-full" style={{ marginTop: '24px', height: `${(END_HOUR - START_HOUR + 1) * 60 * PIXELS_PER_MINUTE}px` }}>
											{HOURS.map(hour => (
												<div key={hour} className="absolute w-full" style={{ top: `${(hour - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}>
													<div className="-mt-2 flex justify-center w-full">
														<span className="text-[9px] font-bold text-slate-500 bg-white px-1">
															{hour.toString().padStart(2, '0')}.00
														</span>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Kolom Content per Hari */}
									{DAYS.map(day => (
										<div key={day.id} className="flex-1 border-r border-slate-100 last:border-r-0">
											<div className="relative w-full" style={{ marginTop: '24px', height: `${(END_HOUR - START_HOUR + 1) * 60 * PIXELS_PER_MINUTE}px` }}>

												{/* Grid Lines */}
												{HOURS.map(hour => (
													<div key={`line-${hour}`} className="absolute w-full" style={{ top: `${(hour - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}>
														<div className="border-t border-slate-200 w-full absolute top-0"></div>
													</div>
												))}

												{/* Render Block Jadwal */}
												{flatSchedules
													.filter(s => s.hari === day.id)
													.map((sched, idx) => {
														const startMins = timeToMinutes(sched.jamMulai);
														const endMins = timeToMinutes(sched.jamSelesai);
														const topPosition = (startMins - (START_HOUR * 60)) * PIXELS_PER_MINUTE;
														const blockHeight = (endMins - startMins) * PIXELS_PER_MINUTE;

														const theme = getCourseColor(sched.namaMatkul || '');

														return (
															<div
																key={idx}
																className="absolute w-full px-1 z-10 hover:z-20 transition-all duration-200 hover:-translate-y-0.5"
																style={{
																	top: `${topPosition}px`,
																	height: `${blockHeight}px`,
																	paddingTop: '1px',
																	paddingBottom: '1px'
																}}
															>
																<div className={`w-full h-full shadow-sm border ${theme.border} ${theme.bg} overflow-hidden flex flex-col relative`}>
																	<div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent}`}></div>
																	<div className="p-1 pl-2 flex flex-col h-full overflow-hidden justify-center">
																		<div className={`text-[8px] font-bold opacity-75 leading-none mb-0.5 ${theme.text}`}>
																			{sched.jamMulai}-{sched.jamSelesai}
																		</div>
																		<h3 className={`font-bold text-[9px] leading-none truncate ${theme.text}`}>
																			{sched.namaMatkul}
																		</h3>
																		<div className={`text-[8px] mt-0.5 font-medium opacity-90 leading-none truncate ${theme.text}`}>
																			R.{sched.ruangan} • Kls {sched.namaKelas}
																		</div>
																	</div>
																</div>
															</div>
														);
													})}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

				</div>
			</div>
		</div>
	);
}

export default StudyPlanSummaryPage;