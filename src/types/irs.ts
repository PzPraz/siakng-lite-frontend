import type { ScheduleItem } from './class';

export type MergedIrsData = {
  id: number;
  classId: number;
  status: string;
  namaKelas?: string;
  namaMatkul?: string;
  kodeMatkul?: string;
  sks?: number;
  namaDosen?: string;
  schedules?: ScheduleItem[];
};

export interface IrsResponse {
  id: string;
  studentId?: string;
  classId?: number;
  status?: string;
  createdAt?: string;
  namaKelas?: string;
  namaMatkul?: string;
  kodeMatkul?: string;
  sks?: number;
  nilaiAkhir?: string | number | null;
}
