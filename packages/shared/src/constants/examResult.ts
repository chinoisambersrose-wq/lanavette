/** Resultat d'un examen, voir CAHIER_DES_CHARGES.md section 9 (collection examResults). */
export const EXAM_RESULTS = ['admis', 'ajourne', 'absent'] as const;

export type ExamResultValue = (typeof EXAM_RESULTS)[number];
