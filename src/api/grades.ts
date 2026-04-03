import { API_BASE_URL, getToken } from './config';
import type {
  CreateGradeComponentDto,
  CreateGradeDto,
  GradeComponent,
  StudentGradeItem,
} from '../types';

export const getGradeComponents = async (classId: number): Promise<GradeComponent[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/grades/components/${classId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil komponen nilai');
  return data;
};

export const createGradeComponents = async (payload: CreateGradeComponentDto): Promise<GradeComponent[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/grades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal menambah komponen nilai');
  return data;
};

export const updateGradeComponent = async (
  componentId: number,
  payload: CreateGradeComponentDto,
): Promise<GradeComponent[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/grades/${componentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengubah komponen nilai');
  return data;
};

export const deleteGradeComponent = async (componentId: number): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/grades/${componentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Gagal menghapus komponen nilai');
  }
};

export const setClassGradePublishStatus = async (classId: number, isPublished: boolean): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/grades/${classId}/publish-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isPublished }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Gagal mengubah status publish nilai');
  }
};

export const gradeStudent = async (studentId: number, grades: CreateGradeDto[]): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/grades/${studentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(grades),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Gagal menyimpan nilai mahasiswa');
  }
};

export const getStudentGradesByClass = async (
  classId: number,
  studentId: number,
): Promise<StudentGradeItem[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/grades/${classId}/students/${studentId}/grades`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil nilai mahasiswa');
  return data;
};
