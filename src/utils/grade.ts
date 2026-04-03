import type { StudentGradeItem } from '../types';

export const toLetterGrade = (score: number): string => {
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'E';
};

export const toGradePoint = (letter: string): number => {
  if (letter === 'A') return 4.0;
  if (letter === 'A-') return 3.7;
  if (letter === 'B+') return 3.3;
  if (letter === 'B') return 3.0;
  if (letter === 'B-') return 2.7;
  if (letter === 'C+') return 2.3;
  if (letter === 'C') return 2.0;
  if (letter === 'D') return 1.0;
  return 0.0;
};

export const toFixedScore = (score: number): number => Number(score.toFixed(2));

export const computeWeightedNumericScore = (grades: StudentGradeItem[]): number => {
  const score = grades.reduce((sum, item) => {
    const rawValue = Number(item.value ?? 0);
    const weight = item.component?.weight ?? 0;
    const normalizedValue = Number.isFinite(rawValue) ? rawValue : 0;
    return sum + normalizedValue * (weight / 100);
  }, 0);

  return toFixedScore(score);
};

export const computeIpk = (rows: Array<{ sks: number; bobot: number }>): number => {
  const totalSks = rows.reduce((sum, row) => sum + row.sks, 0);
  if (totalSks === 0) return 0;

  const totalMutu = rows.reduce((sum, row) => sum + row.bobot * row.sks, 0);
  return Number((totalMutu / totalSks).toFixed(2));
};