import request from 'supertest';
import { app, server } from '../src/server';
import { testCases } from '../src/testHelpers';
import { AssessmentSubmission } from '../src/db';

// Mock the database module
jest.mock('../src/db', () => {
  const mockSaveAssessmentSubmission = jest.fn().mockImplementation((answers, patientId) => {
    return Promise.resolve({
      id: 1,
      patient_id: patientId || 'default-patient-id',
      answers: answers,
      submitted_at: new Date()
    });
  });
  
  return {
    saveAssessmentSubmission: mockSaveAssessmentSubmission,
    AssessmentSubmission: jest.fn()
  };
});

describe('Server Endpoints', () => {
  describe('GET /screener-config', () => {
    it('should return the screener configuration', async () => {
      const response = await request(app).get('/screener-config');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('disorder');
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toHaveProperty('sections');
      expect(response.body.content.sections).toBeInstanceOf(Array);
      expect(response.body.content.sections.length).toBeGreaterThan(0);
    });
  });

  describe('POST /assessment-submissions', () => {
    it('should return assessments based on valid answers', async () => {
      const response = await request(app)
        .post('/assessment-submissions')
        .send({ answers: testCases.validAnswers })
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results).toContain('PHQ-9');
      expect(response.body.results).toContain('ASRM');
      expect(response.body.results.length).toBe(2);
    });

    it('should return ASSIST for substance_use threshold', async () => {
      const response = await request(app)
        .post('/assessment-submissions')
        .send({ answers: testCases.substanceUseAnswers })
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.results).toContain('ASSIST');
      expect(response.body.results.length).toBe(1);
    });

    it('should return 400 for invalid input format', async () => {
      const invalidInputs = [
        {}, // Empty object
        { answers: null }, // Null answers
        { answers: 'not an array' }, // Non-array answers
        { answers: [] }, // Empty array (now rejected)
      ];

      for (const invalidInput of invalidInputs) {
        const response = await request(app)
          .post('/assessment-submissions')
          .send(invalidInput)
          .set('Content-Type', 'application/json');
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should return 400 for invalid answer values', async () => {
      for (const answer of testCases.invalidAnswers) {
        const response = await request(app)
          .post('/assessment-submissions')
          .send({ answers: [answer] })
          .set('Content-Type', 'application/json');
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should return 400 for unknown question_id', async () => {
      const response = await request(app)
        .post('/assessment-submissions')
        .send({ answers: testCases.unknownQuestionAnswers })
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unknown question_id');
    });

    it('should handle all domains exceeding thresholds', async () => {
      const response = await request(app)
        .post('/assessment-submissions')
        .send({ answers: testCases.allDomainsExceedingThresholds })
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.results).toContain('PHQ-9');
      expect(response.body.results).toContain('ASSIST');
      expect(response.body.results).toContain('ASRM');
      expect(response.body.results.length).toBe(3);
    });

    it('should save answers to database when patientId is provided', async () => {
      const { saveAssessmentSubmission } = require('../src/db');
      
      const response = await request(app)
        .post('/assessment-submissions')
        .send({ 
          patientId: 'test-patient-id',
          answers: testCases.validAnswers 
        })
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(saveAssessmentSubmission).toHaveBeenCalledWith(testCases.validAnswers, 'test-patient-id');
    });

    it('should save answers with generated UUID when patientId is not provided', async () => {
      const { saveAssessmentSubmission } = require('../src/db');
      
      const response = await request(app)
        .post('/assessment-submissions')
        .send({ answers: testCases.validAnswers })
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);    
      expect(saveAssessmentSubmission).toHaveBeenCalledWith(testCases.validAnswers, undefined);
    });

    it('should still return results even if database save fails', async () => {
      const { saveAssessmentSubmission } = require('../src/db');
      saveAssessmentSubmission.mockRejectedValueOnce(new Error('Database error'));
      
      const response = await request(app)
        .post('/assessment-submissions')
        .send({ 
          patientId: 'test-patient-id',
          answers: testCases.validAnswers 
        })
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
    });

    it('should handle CORS headers correctly', async () => {
      const response = await request(app)
        .get('/screener-config')
        .set('Origin', 'http://localhost:5173');
      
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should reject requests from disallowed origins', async () => {
      const response = await request(app)
        .get('/screener-config')
        .set('Origin', 'http://malicious-site.com');
      
      // The request should still succeed, but with CORS headers indicating the origin is not allowed
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).not.toBe('http://malicious-site.com');
    });
  });
});

// Close the server after all tests complete
afterAll(done => {
  server.close(() => {
    done();
  });
}); 