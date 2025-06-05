import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Event from '../../lib/models/Event';

// Helper function to generate recurring events
function generateRecurringEvents(baseEvent: any, year: number, month?: number) {
  const events = [];
  const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  const endDate = month ? new Date(year, month, 0) : new Date(year, 11, 31);

  switch (baseEvent.type) {
    case 'dagelijks':
      // Generate events for selected days of the week
      if (baseEvent.recurringDays?.length) {
        const current = new Date(startDate);
        while (current <= endDate) {
          if (baseEvent.recurringDays.includes(current.getDay())) {
            events.push({
              ...baseEvent,
              date: current.toISOString().split('T')[0],
              _id: `${baseEvent._id}_${current.toISOString().split('T')[0]}`
            });
          }
          current.setDate(current.getDate() + 1);
        }
      }
      break;

    case 'standaard':
      // Generate events for a specific day of the week (every week)
      if (baseEvent.recurringDayOfWeek !== undefined) {
        const current = new Date(startDate);
        // Find first occurrence of the target day
        while (current.getDay() !== baseEvent.recurringDayOfWeek && current <= endDate) {
          current.setDate(current.getDate() + 1);
        }
        // Generate weekly occurrences
        while (current <= endDate) {
          events.push({
            ...baseEvent,
            date: current.toISOString().split('T')[0],
            _id: `${baseEvent._id}_${current.toISOString().split('T')[0]}`
          });
          current.setDate(current.getDate() + 7);
        }
      }
      break;

    case 'wekelijks':
      // Generate events for specific weeks of the year
      if (baseEvent.recurringWeeks?.length && baseEvent.recurringDayOfWeek !== undefined) {
        baseEvent.recurringWeeks.forEach((weekNum: number) => {
          const weekStart = new Date(year, 0, 1 + (weekNum - 1) * 7);
          const current = new Date(weekStart);
          
          // Find the target day in that week
          while (current.getDay() !== baseEvent.recurringDayOfWeek && current.getTime() < weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) {
            current.setDate(current.getDate() + 1);
          }
          
          if (current >= startDate && current <= endDate) {
            events.push({
              ...baseEvent,
              date: current.toISOString().split('T')[0],
              _id: `${baseEvent._id}_${current.toISOString().split('T')[0]}`
            });
          }
        });
      }
      break;

    case 'eenmalig':
      // One-time events are returned as-is
      if (new Date(baseEvent.date) >= startDate && new Date(baseEvent.date) <= endDate) {
        events.push(baseEvent);
      }
      break;
  }

  return events;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    // Get all base events from database
    const baseEvents = await Event.find({}).sort({ date: 1, startTime: 1 });
    
    if (month && year) {
      // Generate recurring events for the specific month
      const allEvents: any[] = [];
      
      baseEvents.forEach(baseEvent => {
        const generatedEvents = generateRecurringEvents(
          baseEvent.toObject(), 
          parseInt(year), 
          parseInt(month)
        );
        allEvents.push(...generatedEvents);
      });
      
      // Sort by date and time
      allEvents.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
      
      return NextResponse.json(allEvents);
    } else {
      // Return all events for the current year
      const currentYear = new Date().getFullYear();
      const allEvents: any[] = [];
      
      baseEvents.forEach(baseEvent => {
        const generatedEvents = generateRecurringEvents(
          baseEvent.toObject(), 
          currentYear
        );
        allEvents.push(...generatedEvents);
      });
      
      // Sort by date and time
      allEvents.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
      
      return NextResponse.json(allEvents);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // For recurring events, we don't need a specific date
    if (body.type !== 'eenmalig') {
      body.date = new Date().toISOString().split('T')[0]; // Use current date as base
    }
    
    const newEvent = new Event(body);
    const savedEvent = await newEvent.save();
    
    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}