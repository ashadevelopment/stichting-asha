// lib/models/Event.ts
import mongoose, { Schema, Document } from "mongoose"

export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  type: 'eenmalig' | 'standaard' | 'dagelijks' | 'wekelijks';
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  author: string;
  location: string;
  zaal: string; // Zaal 1, Zaal 2, etc.
  date: string; // YYYY-MM-DD format
  // For recurring events
  recurringDays?: number[]; // 0-6 (Sunday-Saturday) for dagelijks
  recurringWeeks?: number[]; // Week numbers for wekelijks
  recurringDayOfWeek?: number; // 0-6 for standaard events
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['eenmalig', 'standaard', 'dagelijks', 'wekelijks'],
    required: true 
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  author: { type: String, required: true },
  location: { type: String, required: true },
  zaal: { type: String, required: true },
  date: { type: String, required: true },
  recurringDays: [{ type: Number }],
  recurringWeeks: [{ type: Number }],
  recurringDayOfWeek: { type: Number }
}, {
  timestamps: true
});

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;