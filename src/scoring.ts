import domainMappings from './domainMapping.json';

export interface Answer {
  value: number;
  question_id: string;
}

interface DomainMapping {
  question_id: string;
  domain: string;
}

interface DomainScores {
  [key: string]: number;
}

interface AssessmentCriteria {
  threshold: number;
  assessment: string;
}

const assessmentCriteria: { [key: string]: AssessmentCriteria } = {
  depression: { threshold: 2, assessment: 'PHQ-9' },
  mania: { threshold: 2, assessment: 'ASRM' },
  anxiety: { threshold: 2, assessment: 'PHQ-9' },
  substance_use: { threshold: 1, assessment: 'ASSIST' },
};

export function getAssessments(answers: Answer[]): string[] {
  const domainScores = getDomainScores(answers);
  const assessments = determineAssessments(domainScores);

  return assessments;
}

function getDomainScores(answers: Answer[]): DomainScores {
  const scores: DomainScores = {};

  for (const answer of answers) {
    if (typeof answer.value !== 'number' || answer.value < 0 || answer.value > 4) {
      throw new Error(`Invalid value for question ${answer.question_id}`);
    }
    const domain = getDomainForQuestion(answer.question_id);
    if (!domain) {
      throw new Error(`Unknown question_id: ${answer.question_id}`);
    }
    scores[domain] = (scores[domain] || 0) + answer.value;
  }
  return scores;
}

function determineAssessments(domainScores: DomainScores): string[] {
  const assessments = new Set<string>();
  for (const domain in assessmentCriteria) {
    const criteria = assessmentCriteria[domain];
    if ((domainScores[domain] || 0) >= criteria.threshold) {
      assessments.add(criteria.assessment);
    }
  }
  return [...assessments];
}

function getDomainForQuestion(questionId: string): string | undefined {
  const mapping = domainMappings.find((m) => m.question_id === questionId);
  return mapping ? mapping.domain : undefined;
}