import { Answer } from './scoring';

export const testCases = {
  validAnswers: [
    { question_id: 'question_a', value: 3 }, // depression: 3
    { question_id: 'question_b', value: 2 }, // depression: 5
    { question_id: 'question_c', value: 1 }, // mania: 1
    { question_id: 'question_d', value: 2 }, // mania: 3
    { question_id: 'question_e', value: 0 }, // anxiety: 0
    { question_id: 'question_f', value: 1 }, // anxiety: 1
    { question_id: 'question_g', value: 2 }, // anxiety: 3
    { question_id: 'question_h', value: 0 }  // substance_use: 0
  ] as Answer[],

  substanceUseAnswers: [
    { question_id: 'question_h', value: 1 } // substance_use: 1 (threshold is 1)
  ] as Answer[],

  invalidAnswers: [
    { question_id: 'question_a', value: 5 }, // Invalid value > 4
    { question_id: 'question_b', value: -1 }, // Negative value
    { question_id: 'question_c', value: '2' as any }, // String instead of number
  ] as Answer[],

  unknownQuestionAnswers: [
    { question_id: 'unknown_question', value: 2 }
  ] as Answer[],

  allDomainsExceedingThresholds: [
    { question_id: 'question_a', value: 3 }, // depression: 3
    { question_id: 'question_c', value: 3 }, // mania: 3
    { question_id: 'question_h', value: 2 }  // substance_use: 2
  ] as Answer[]
}; 