import mongoose from 'mongoose';

export interface IPersonalAnalysis {
  _id?: string;
  ticker: string;
  assetName: string;
  tendency: 'bullish' | 'bearish' | 'neutral';
  timeFrame: 'short-term' | 'mid-term' | 'long-term';
  description?: string;
  explanation?: string;
  targetPrice?: number;
  stopLoss?: number;
  confidence: number; // 1-10 scale
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID of the admin who created it
}

const PersonalAnalysisSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: [true, 'Please provide a ticker symbol'],
    uppercase: true,
    trim: true,
  },
  assetName: {
    type: String,
    required: [true, 'Please provide an asset name'],
    trim: true,
  },
  tendency: {
    type: String,
    enum: ['bullish', 'bearish', 'neutral'],
    required: [true, 'Please specify the tendency'],
  },
  timeFrame: {
    type: String,
    enum: ['short-term', 'mid-term', 'long-term'],
    required: [true, 'Please specify the time frame'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [2000, 'Explanation cannot exceed 2000 characters'],
  },
  targetPrice: {
    type: Number,
    min: [0, 'Target price must be positive'],
  },
  stopLoss: {
    type: Number,
    min: [0, 'Stop loss must be positive'],
  },
  confidence: {
    type: Number,
    required: [true, 'Please provide a confidence level'],
    min: [1, 'Confidence must be between 1 and 10'],
    max: [10, 'Confidence must be between 1 and 10'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: [true, 'Created by user ID is required'],
  },
}, {
  timestamps: true,
});

// Create compound index for better performance
PersonalAnalysisSchema.index({ ticker: 1, isActive: 1 });
PersonalAnalysisSchema.index({ tendency: 1, timeFrame: 1 });

export default mongoose.models.PersonalAnalysis || mongoose.model<IPersonalAnalysis>('PersonalAnalysis', PersonalAnalysisSchema);
