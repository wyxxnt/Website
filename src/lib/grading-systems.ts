import { Country, GradingSystem } from './types';

export const gradingSystems: Record<Country, GradingSystem> = {
  US: {
    country: 'US',
    name: 'United States (Letter Grades)',
    scale: 'A-F (4.0 GPA)',
    grades: [
      { value: 4.0, label: 'A', description: 'Excellent (90-100%)' },
      { value: 3.7, label: 'A-', description: '(87-89%)' },
      { value: 3.3, label: 'B+', description: '(83-86%)' },
      { value: 3.0, label: 'B', description: 'Good (80-82%)' },
      { value: 2.7, label: 'B-', description: '(77-79%)' },
      { value: 2.3, label: 'C+', description: '(73-76%)' },
      { value: 2.0, label: 'C', description: 'Average (70-72%)' },
      { value: 1.7, label: 'C-', description: '(67-69%)' },
      { value: 1.3, label: 'D+', description: '(63-66%)' },
      { value: 1.0, label: 'D', description: 'Below Average (60-62%)' },
      { value: 0.0, label: 'F', description: 'Failing (0-59%)' },
    ],
    passingGrade: 1.0,
    higherIsBetter: true,
  },
  UK: {
    country: 'UK',
    name: 'United Kingdom',
    scale: 'First Class - Fail',
    grades: [
      { value: 80, label: 'First Class (1st)', description: '70%+' },
      { value: 65, label: 'Upper Second (2:1)', description: '60-69%' },
      { value: 55, label: 'Lower Second (2:2)', description: '50-59%' },
      { value: 45, label: 'Third Class (3rd)', description: '40-49%' },
      { value: 30, label: 'Fail', description: 'Below 40%' },
    ],
    passingGrade: 40,
    higherIsBetter: true,
  },
  DE: {
    country: 'DE',
    name: 'Germany',
    scale: '1.0 - 6.0',
    grades: [
      { value: 1.0, label: '1.0', description: 'Sehr gut (Very Good)' },
      { value: 1.3, label: '1.3', description: 'Sehr gut' },
      { value: 1.7, label: '1.7', description: 'Gut (Good)' },
      { value: 2.0, label: '2.0', description: 'Gut' },
      { value: 2.3, label: '2.3', description: 'Gut' },
      { value: 2.7, label: '2.7', description: 'Befriedigend (Satisfactory)' },
      { value: 3.0, label: '3.0', description: 'Befriedigend' },
      { value: 3.3, label: '3.3', description: 'Befriedigend' },
      { value: 3.7, label: '3.7', description: 'Ausreichend (Sufficient)' },
      { value: 4.0, label: '4.0', description: 'Ausreichend' },
      { value: 5.0, label: '5.0', description: 'Mangelhaft (Poor)' },
      { value: 6.0, label: '6.0', description: 'Ungenügend (Insufficient)' },
    ],
    passingGrade: 4.0,
    higherIsBetter: false,
  },
  UA: {
    country: 'UA',
    name: 'Україна (Ukraine)',
    scale: '1-12',
    grades: [
      { value: 12, label: '12', description: 'Відмінно (Excellent)' },
      { value: 11, label: '11', description: 'Відмінно' },
      { value: 10, label: '10', description: 'Відмінно' },
      { value: 9, label: '9', description: 'Добре (Good)' },
      { value: 8, label: '8', description: 'Добре' },
      { value: 7, label: '7', description: 'Добре' },
      { value: 6, label: '6', description: 'Задовільно (Satisfactory)' },
      { value: 5, label: '5', description: 'Задовільно' },
      { value: 4, label: '4', description: 'Задовільно' },
      { value: 3, label: '3', description: 'Незадовільно (Unsatisfactory)' },
      { value: 2, label: '2', description: 'Незадовільно' },
      { value: 1, label: '1', description: 'Незадовільно' },
    ],
    passingGrade: 4,
    higherIsBetter: true,
  },
  FR: {
    country: 'FR',
    name: 'France',
    scale: '0-20',
    grades: [
      { value: 20, label: '20', description: 'Parfait (Perfect)' },
      { value: 18, label: '18', description: 'Excellent' },
      { value: 16, label: '16', description: 'Très Bien (Very Good)' },
      { value: 14, label: '14', description: 'Bien (Good)' },
      { value: 12, label: '12', description: 'Assez Bien (Fairly Good)' },
      { value: 10, label: '10', description: 'Passable (Pass)' },
      { value: 8, label: '8', description: 'Insuffisant (Insufficient)' },
      { value: 5, label: '5', description: 'Médiocre' },
      { value: 0, label: '0', description: 'Nul (Zero)' },
    ],
    passingGrade: 10,
    higherIsBetter: true,
  },
  ES: {
    country: 'ES',
    name: 'España (Spain)',
    scale: '0-10',
    grades: [
      { value: 10, label: '10', description: 'Matrícula de Honor (Outstanding)' },
      { value: 9, label: '9', description: 'Sobresaliente (Excellent)' },
      { value: 7, label: '7', description: 'Notable (Good)' },
      { value: 5, label: '5', description: 'Aprobado (Pass)' },
      { value: 4, label: '4', description: 'Suspenso (Fail)' },
      { value: 0, label: '0', description: 'Suspenso' },
    ],
    passingGrade: 5,
    higherIsBetter: true,
  },
  PL: {
    country: 'PL',
    name: 'Polska (Poland)',
    scale: '1-6',
    grades: [
      { value: 6, label: '6', description: 'Celujący (Excellent)' },
      { value: 5, label: '5', description: 'Bardzo dobry (Very Good)' },
      { value: 4, label: '4', description: 'Dobry (Good)' },
      { value: 3, label: '3', description: 'Dostateczny (Satisfactory)' },
      { value: 2, label: '2', description: 'Dopuszczający (Acceptable)' },
      { value: 1, label: '1', description: 'Niedostateczny (Unsatisfactory)' },
    ],
    passingGrade: 2,
    higherIsBetter: true,
  },
  CZ: {
    country: 'CZ',
    name: 'Česko (Czech Republic)',
    scale: '1-5',
    grades: [
      { value: 1, label: '1', description: 'Výborný (Excellent)' },
      { value: 2, label: '2', description: 'Chvalitebný (Commendable)' },
      { value: 3, label: '3', description: 'Dobrý (Good)' },
      { value: 4, label: '4', description: 'Dostatečný (Sufficient)' },
      { value: 5, label: '5', description: 'Nedostatečný (Insufficient)' },
    ],
    passingGrade: 4,
    higherIsBetter: false,
  },
};

export const countryNames: Record<Country, string> = {
  US: '🇺🇸 United States',
  UK: '🇬🇧 United Kingdom',
  DE: '🇩🇪 Germany',
  UA: '🇺🇦 Ukraine',
  FR: '🇫🇷 France',
  ES: '🇪🇸 Spain',
  PL: '🇵🇱 Poland',
  CZ: '🇨🇿 Czech Republic',
};

export function getGradingSystem(country: Country): GradingSystem {
  return gradingSystems[country];
}

export function calculateAverage(grades: { value: number; weight: number }[], higherIsBetter: boolean): number {
  if (grades.length === 0) return 0;
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);
  return weightedSum / totalWeight;
}

export function gradeNeededForGoal(
  currentGrades: { value: number; weight: number }[],
  goalGrade: number,
  nextWeight: number,
  higherIsBetter: boolean
): number {
  const totalWeight = currentGrades.reduce((sum, g) => sum + g.weight, 0);
  const currentWeightedSum = currentGrades.reduce((sum, g) => sum + g.value * g.weight, 0);
  const needed = (goalGrade * (totalWeight + nextWeight) - currentWeightedSum) / nextWeight;
  return Math.round(needed * 100) / 100;
}
