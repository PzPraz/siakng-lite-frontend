import type { ReactNode } from "react";

// Course

export interface Course {
  id: number;
  kode: string;
  nama: string;
  sks: number;
  classes?: ClassDetail[];
}

export interface CreateCourseDto {
  nama: string;
  kode: string;
  sks: number;
}

// Class

export interface ClassDetail {
  id: number;
  namaKelas: string;
  schedules: {
    hari: number;
    jamMulai: string;
    jamSelesai: string;
    ruangan: string;
  }[];
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
  schedules: {
    hari: number;
    jamMulai: string;
    jamSelesai: string;
    ruangan: string;
  }[];
}

export type ScheduleItem = {
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
};

// Irs

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
    id: string,
    studentId?: string,
    classId?: number,
    status?: string,
    createdAt?: string,
}


// Auth

export type UserRole = 'DOSEN' | 'MAHASISWA';

export interface AuthUser {
  nama?: string;
  role?: UserRole;
  npm_atau_nip?: string;
}


export interface AuthContextValue {
  user: AuthUser | null;
  token: string | undefined;
  isAuthenticated: boolean;
  login: (tokenValue: string, userValue: AuthUser) => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface Student {
  id?: number;
  npm: string;
  nama: string;
  statusIrs?: string;
}

export interface UserData {
  nama?: string;
  role?: 'DOSEN' | 'MAHASISWA';
  npm?: string;
  nip?: string;
  npm_atau_nip?: string;
}

export interface LoginResponse {
  access_token?: string;
  user?: UserData;
  message?: string;
}
