export interface GradeInputProps {
  studentName: string;
  studentNpm: string;
  currentScore: number;
  onChange: (score: number) => void;
  error?: string;
}

export interface GradeComponent {
  id?: number;
  componentName: string;
  weight: number;
}

export interface CreateGradeComponentDto {
  classId: number;
  components: {
    componentName: string;
    weight: number;
  }[];
}

export interface CreateGradeDto {
  componentId: number;
  value?: number;
}

export interface StudentGradeItem {
  id?: number;
  studentId: number;
  componentId: number;
  value: string;
  component?: GradeComponent & {
    classId?: number;
    isPublished?: boolean;
  };
}

export interface GradePerClassSummary {
  classId: number;
  kodeMatkul: string;
  namaMatkul: string;
  namaKelas: string;
  sks: number;
  nilaiAkhirNumerik: number;
  nilaiHuruf: string;
  bobot: number;
}
