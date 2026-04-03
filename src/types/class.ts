export type ScheduleItem = {
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
};

export interface ClassDetail {
  id: number;
  namaKelas: string;
  schedules: ScheduleItem[];
  courseId: number;
  namaMatkul: string;
  sks: number;
  dosenId: string;
  namaDosen: string;
  terisi: number;
  kapasitas: number;
  kodeMatkul: string;
}

export interface CreateClassDto {
  courseId: number;
  namaKelas: string;
  dosenId: string;
  kapasitas: number;
  schedules: ScheduleItem[];
}
