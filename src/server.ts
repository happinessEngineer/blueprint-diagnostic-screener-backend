import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { Answer, getAssessments } from './scoring';

interface RequestBody {
  answers: Answer[];
}

const app = express();
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

app.use(express.json());
app.use(jsonErrorHandler);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Origin not allowed by CORS'));
    }
    return callback(null, true);
  }
}));

app.post('/assessment-submissions', (req: Request, res: Response) => {
    const body = req.body as RequestBody;
    console.log('Received request:', body);

    if (!body || typeof body !== 'object' || !body.answers || !Array.isArray(body.answers)) {
      console.error('Invalid input format:', body);
      res.status(400).json({ error: 'Invalid input format. Expected { answers: [...] }' });
      return;
    }
  
    try {
      const assessments = getAssessments(body.answers);  
      console.log('Generated assessments:', assessments);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});