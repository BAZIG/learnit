import mongoose from 'mongoose';

interface AffectedAsset {
  ticker: string;
  impact: 'bullish' | 'bearish' | 'neutral';
}

export interface INews {
  _id?: string;
  title: string;
  event: string;
  affectedAssets: AffectedAsset[];
  expectations: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID of the admin who created it
}

const AffectedAssetSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: [true, 'Ticker is required'],
    uppercase: true,
    trim: true,
  },
  impact: {
    type: String,
    enum: ['bullish', 'bearish', 'neutral'],
    required: [true, 'Impact is required'],
  }
}, { _id: false });

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  event: {
    type: String,
    required: [true, 'Please provide event description'],
    trim: true,
    maxlength: [1000, 'Event description cannot exceed 1000 characters'],
  },
  affectedAssets: {
    type: [AffectedAssetSchema],
    default: [],
    validate: {
      validator: function(assets: AffectedAsset[]) {
        return assets.length <= 10; // Maximum 10 affected assets
      },
      message: 'Cannot have more than 10 affected assets'
    }
  },
  expectations: {
    type: String,
    required: [true, 'Please provide expectations explanation'],
    trim: true,
    maxlength: [2000, 'Expectations cannot exceed 2000 characters'],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: String,
    required: [true, 'Created by user ID is required'],
  },
}, {
  timestamps: true,
});

// Index for better performance
NewsSchema.index({ isPublished: 1, publishedAt: -1 });
NewsSchema.index({ 'affectedAssets.ticker': 1 });

// Middleware to set publishedAt when isPublished changes to true
NewsSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
