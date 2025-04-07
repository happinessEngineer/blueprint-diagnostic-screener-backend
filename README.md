# Blueprint Diagnostic Screener Backend

## Problem and Solution

### Problem
Create an API that accepts a patient's answers to a diagnostic screener, scores the answers and saves them to a database, and returns the appropriate assessments based on symptom severity.
[Full spec](https://github.com/blueprinthq/coding-exercise?tab=readme-ov-file)

### Solution
This application provides:
- A RESTful API for serving the screener configuration and processing diagnostic screener submissions
- Domain-based scoring logic for different symptom categories
- Database persistence for assessment submissions
- Comprehensive test coverage for both unit and integration tests
- Centralized configuration management

**Note:** The frontend repository can be found [here](https://github.com/happinessEngineer/blueprint-diagnostic-screener-frontend).

## Live application is deployed to heroku
- Backend API: https://blueprint-diagnostic-screener-3373dd544c7a.herokuapp.com

## Running the Application
To start the development server, run the following command in your terminal:  
`npm run start:dev`

## Configuration

The application uses a centralized configuration system in `src/config.ts`. The configuration is loaded from environment variables.

### Environment Variables

- `PORT`: The port on which the server will listen (default: 3000)
- `DATABASE_URL`: The URL of the PostgreSQL database (default: postgres://postgres:postgres@localhost:5432/screener)
- `NODE_ENV`: The environment (development, production) (default: development)

### CORS Configuration

The application is configured to allow requests from the following origins:
- http://localhost:5173 (local development)
- https://happinessengineer.github.io (production)

## API Endpoints

### GET /screener-config

Returns the configuration for the diagnostic screener.

### POST /assessment-submissions

Accepts a patient's answers to the screener and returns the appropriate assessments.

Example request:
```json
{
  "answers": [
    {
      "value": 1,
      "question_id": "question_a"
    },
    {
      "value": 0,
      "question_id": "question_b"
    }
  ],
  "patientId": "optional-uuid"
}
```

Example response:
```json
{
  "results": ["PHQ-9"]
}
```

## Technical Choices

### Node.js with TypeScript
- **TypeScript**: Provides type safety, better IDE support, and catches errors at compile time
- **Node.js**: Chosen for its non-blocking I/O, rich ecosystem, and ease of use

### Express
- **Web Framework**: Lightweight, flexible, and widely used in the Node.js ecosystem
- **Middleware**: Leverages Express middleware for CORS, JSON parsing, and error handling
- **CORS whitelisting**: Implemented to enhance security by allowing only specified origins to access the API.

### Sequelize
- **ORM**: Provides a clean interface for database operations
- **PostgreSQL**: Robust relational database with excellent performance and reliability

### Testing
- **Jest**: Comprehensive testing framework with mocking capabilities
- **Supertest**: HTTP assertions for testing API endpoints

## Production Deployment

I would deploy this application according to the established processes of Blueprint's engineering team. I expect this would include:

1. **Cloud-based hosting** using a service like AWS, GCP, or Azure
2. **Database hosting** using a cloud-based PostgreSQL service
3. **CI/CD pipeline** for automated testing and deployment
4. **Monitoring and logging** for observability
5. **Reliability and scaling** through load balancing and auto-scaling features
6. **Infrastructure management** using infrastructure-as-code tools such as Terraform
7. **Secrets management** using a tool such as AWS Secrets Manager to store the database credentials


### Suggestions for further improvements

1. **Implement structured logging**:
   - Replace console.log with a proper logging library
   - Add request ID tracking for better debugging
   - Implement log aggregation

2. **Add input validation**:
   - Implement schema validation using Joi or Zod
   - Add sanitization for user inputs

3. **Enhance security**:
   - Implement rate limiting
   - Add authentication and authorization using JWT tokens
   - Set up proper CORS policies

4. **Add API documentation**:
   - Implement OpenAPI/Swagger documentation
   - Add health check endpoints

### Code I'm proud of
Unfortunately I'm not allowed to share any code that I've written at my past few jobs. Instead, I'll share an engineering design doc that I wrote for a fairly complex ETL project:

[Braze Reporting ETL - Design Doc.md](Braze%20Reporting%20ETL%20-%20Design%20Doc.md)

I implemented the project as well, which involved 4 of our microservices and Braze (our third-party Customer Experience Platform).

I'll also share the code for my [public profile website](https://github.com/happinessEngineer/me). I designed and built it in about 3 hours, using ChatGPT, Windsurf, Astro and Tailwind.

I believe that being able to build a working solution quickly is crucial for a growth engineer, so I'm sharing this code as an example of that.

### My public profile
https://happinessengineer.github.io/me/