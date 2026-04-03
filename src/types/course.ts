import type { ClassDetail } from './class';

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
