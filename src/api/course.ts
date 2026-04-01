import { API_BASE_URL, getToken } from './config';
import type { Course, CreateCourseDto } from '../types/api';

export type { Course, CreateCourseDto };

export const createCourse = async (dto: CreateCourseDto): Promise<Course> => {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/course`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal membuat mata kuliah');
  
  return data;
};

export const getAllCourses = async (): Promise<Course[]> => {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/course`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil data matkul');
  return data;
};

export const getCourseDetail = async (id: number): Promise<Course> => {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/course/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil detail matkul');
  return data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/course/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Gagal menghapus mata kuliah');
};

export const updateCourse = async (id: number, dto: CreateCourseDto): Promise<Course> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/course/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal memperbarui mata kuliah');
  return data;
};