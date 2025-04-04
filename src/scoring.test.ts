import { getAssessments, Answer } from './scoring';

// Mock the fs module to avoid file system operations during tests
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(JSON.stringify([
    { question_id: 'question_a', domain: 'depression' },
    { question_id: 'question_b', domain: 'depression' },
    { question_id: 'question_c', domain: 'mania' },
    { question_id: 'question_d', domain: 'mania' },
    { question_id: 'question_e', domain: 'anxiety' },
    { question_id: 'question_f', domain: 'anxiety' },
    { question_id: 'question_g', domain: 'anxiety' },
    { question_id: 'question_h', domain: 'substance_use' }
  ]))
}));

describe('getAssessments', () => {
  test('should return empty array when no answers are provided', () => {
    const result = getAssessments([]);
    expect(result).toEqual([]);
  });

  test('should return correct assessments based on domain scores', () => {
    const answers: Answer[] = [
      { question_id: 'question_a', value: 3 }, // depression: 3
      { question_id: 'question_b', value: 2 }, // depression: 5
      { question_id: 'question_c', value: 1 }, // mania: 1
      { question_id: 'question_d', value: 2 }, // mania: 3
      { question_id: 'question_e', value: 0 }, // anxiety: 0
      { question_id: 'question_f', value: 1 }, // anxiety: 1
      { question_id: 'question_g', value: 2 }, // anxiety: 3
      { question_id: 'question_h', value: 0 }  // substance_use: 0
    ];

    const result = getAssessments(answers);
    
    // Based on thresholds:
    // depression: 5 >= 2 -> PHQ-9
    // mania: 3 >= 2 -> ASRM
    // anxiety: 3 >= 2 -> PHQ-9
    // substance_use: 0 < 1 -> no assessment
    
    // PHQ-9 should only appear once
    expect(result).toContain('PHQ-9');
    expect(result).toContain('ASRM');
    expect(result).not.toContain('ASSIST');
    expect(result.length).toBe(2);
  });

  test('should throw error for invalid answer values', () => {
    const answers: Answer[] = [
      { question_id: 'question_a', value: 5 }, // Invalid value > 4
      { question_id: 'question_b', value: 2 }
    ];

    expect(() => getAssessments(answers)).toThrow('Invalid value for question question_a');
  });

  test('should throw error for unknown question_id', () => {
    const answers: Answer[] = [
      { question_id: 'unknown_question', value: 2 }
    ];

    expect(() => getAssessments(answers)).toThrow('Unknown question_id: unknown_question');
  });

  test('should return ASSIST for substance_use threshold', () => {
    const answers: Answer[] = [
      { question_id: 'question_h', value: 1 } // substance_use: 1 (threshold is 1)
    ];

    const result = getAssessments(answers);
    expect(result).toContain('ASSIST');
    expect(result.length).toBe(1);
  });

  test('should handle all domains exceeding thresholds', () => {
    const answers: Answer[] = [
      { question_id: 'question_a', value: 3 }, // depression: 3
      { question_id: 'question_c', value: 3 }, // mania: 3
      { question_id: 'question_h', value: 2 }  // substance_use: 2
    ];

    const result = getAssessments(answers);
    
    // All domains exceed their thresholds
    expect(result).toContain('PHQ-9');
    expect(result).toContain('ASSIST');
    expect(result).toContain('ASRM');
    expect(result.length).toBe(3);
  });
}); 