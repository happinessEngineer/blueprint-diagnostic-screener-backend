import { Answer } from './scoring';
import { Sequelize, Model, DataTypes } from 'sequelize';
import config from './config';

const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Heroku/render.com style hosted PostgreSQL
    }
  }
});

class AssessmentSubmission extends Model {
  public id?: number;
  public patient_id!: string;
  public answers!: Answer[];
  public submitted_at!: Date;
}

AssessmentSubmission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AssessmentSubmission',
    tableName: 'assessment_submissions',
    timestamps: false,
  }
);

export async function saveAssessmentSubmission(answers: Answer[], patientId?: string): Promise<AssessmentSubmission> {
  try {
    await sequelize.authenticate();
    
    const submission = await AssessmentSubmission.create({
      patient_id: patientId,
      answers: answers,
    });
    
    return submission;
  } catch (error) {
    console.error('Error saving assessment submission:', error);
    throw new Error('Failed to save assessment submission');
  }
}

export { AssessmentSubmission }; 