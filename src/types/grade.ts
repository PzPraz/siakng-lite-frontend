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
