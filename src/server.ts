import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { Answer, getAssessments } from './scoring';
import { screenerConfig } from './screenerConfig';
import { saveAssessmentSubmission } from './db';

interface RequestBody {
  answers: Answer[];
  patientId?: string;
}

export const app = express();
const PORT = process.env.PORT || 3000;

const jsonErrorHandler: ErrorRequestHandler = (err: SyntaxError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('Invalid JSON format:', err.body);
    res.status(400).json({ error: 'Invalid JSON format' });
    return;
  }
  next();
};

const allowedOrigins = ['http://localhost:5173', 'https://happinessengineer.github.io'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) === -1) {
      return callback(null, false); // Deny the request
    }
    return callback(null, true);
  }
}));
app.use(express.json());
app.use(jsonErrorHandler);

app.get('/screener-config', (req: Request, res: Response) => {
  console.log('Received request: screener config');
  res.json(screenerConfig);
});

app.post('/assessment-submissions', async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  console.log('Received request:', body);

  if (!body || typeof body !== 'object' || !body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
    console.error('Invalid input format:', body);
    res.status(400).json({ error: 'Invalid input format. Expected { answers: [...] } with at least one answer' });
    return;
  }

  try {
    const assessments = getAssessments(body.answers);
    console.log('Generated assessments:', assessments);
    
    try {
      await saveAssessmentSubmission(body.answers, body.patientId);
      console.log('Saved assessment submission to database');
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with the response even if saving fails
    }
    
    res.json({ results: assessments });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing assessments:', error.message);
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

export const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});