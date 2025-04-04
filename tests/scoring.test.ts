import { getAssessments } from '../src/scoring';
import { testCases } from '../src/testHelpers';

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
    const result = getAssessments(testCases.validAnswers);
    
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
    expect(() => getAssessments(testCases.invalidAnswers)).toThrow('Invalid value for question question_a');
  });

  test('should throw error for unknown question_id', () => {
    expect(() => getAssessments(testCases.unknownQuestionAnswers)).toThrow('Unknown question_id: unknown_question');
  });

  test('should return ASSIST for substance_use threshold', () => {
    const result = getAssessments(testCases.substanceUseAnswers);
    expect(result).toContain('ASSIST');
    expect(result.length).toBe(1);
  });

  test('should handle all domains exceeding thresholds', () => {
    const result = getAssessments(testCases.allDomainsExceedingThresholds);
    
    // All domains exceed their thresholds
    expect(result).toContain('PHQ-9');
    expect(result).toContain('ASSIST');
    expect(result).toContain('ASRM');
    expect(result.length).toBe(3);
  });
}); 