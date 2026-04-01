import { API_BASE_URL, getToken } from './config';
import type { ClassDetail, CreateClassDto, Student,  } from '../types/api';

export type { ClassDetail, CreateClassDto, Student };

export const getAllClasses = async (): Promise<ClassDetail[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/classes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil daftar kelas');
  return data;
};

export const createClass = async(dto: CreateClassDto) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(dto),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal membuat kelas');
  return data;
}

export const deleteClass = async (id: number): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`}
  });
  if (!response.ok) throw new Error("Gagal menghapus kelas");
}

export const updateClass = async(id: number, dto: CreateClassDto): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(dto)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message  || 'Gagal mengupdate kelas');
}

export const getClassDetail = async (id: number): Promise<ClassDetail> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
    headers: { Authorization: `Bearer ${token}`}
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil detail kelas');
  return Array.isArray(data) ? data[0] : data;
}

export const getStudentsInClass = async (id: number): Promise<Student[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/classes/${id}/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil students');
  return data;
}

export const getMyClass = async (id: string): Promise<ClassDetail[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/classes/dosen/${id}`, {
    headers: { Authorization: `Bearer ${token} `}
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil kelas')
  return data;
  
}