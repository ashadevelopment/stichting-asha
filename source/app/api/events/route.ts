// Fixed route.ts for /api/events
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Event from '../../lib/models/Event';

// Helper function to get current week number
function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

// Helper function to generate recurring events
function generateRecurringEvents(baseEvent: any, year: number, month?: number) {
  const events = [];
  const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  const endDate = month ? new Date(year, month, 0) : new Date(year, 11, 31);

  switch (baseEvent.type) {
    case 'dagelijks':
      // Generate events for selected days of the CURRENT week only
      if (baseEvent.recurringDays?.length) {
        const currentWeek = getCurrentWeek();
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        
        baseEvent.recurringDays.forEach((dayOfWeek: number) => {
          const eventDate = new Date(startOfWeek);
          eventDate.setDate(startOfWeek.getDate() + dayOfWeek);
          
          // Only add if the date is within the requested range and not in the past
          if (eventDate >= startDate && eventDate <= endDate && eventDate >= now) {
            events.push({
              ...baseEvent,
              date: eventDate.toISOString().split('T')[0],
              _id: `${baseEvent._id}_${eventDate.toISOString().split('T')[0]}`
            });
          }
        });
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
      // Generate events for specific number of weeks starting from current week
      if (baseEvent.recurringWeeks && baseEvent.recurringDayOfWeek !== undefined) {
        const currentWeek = getCurrentWeek();
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        
        // Generate events for the specified number of weeks
        for (let i = 0; i < baseEvent.recurringWeeks; i++) {
          const weekStart = new Date(startOfWeek);
          weekStart.setDate(startOfWeek.getDate() + (i * 7));
          
          const eventDate = new Date(weekStart);
          eventDate.setDate(weekStart.getDate() + baseEvent.recurringDayOfWeek);
          
          // Only add if the date is within the requested range and not in the past
          if (eventDate >= startDate && eventDate <= endDate && eventDate >= now) {
            events.push({
              ...baseEvent,
              date: eventDate.toISOString().split('T')[0],
              _id: `${baseEvent._id}_${eventDate.toISOString().split('T')[0]}`
            });
          }
        }
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
    
    // Convert recurringWeeks from number to array for wekelijks type
    if (body.type === 'wekelijks' && typeof body.recurringWeeks === 'number') {
      body.recurringWeeks = body.recurringWeeks; // Keep as number for our new logic
    }
    
    const newEvent = new Event(body);
    const savedEvent = await newEvent.save();
    
    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}