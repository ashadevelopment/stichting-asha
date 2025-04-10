import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Volunteer from '../../../../lib/models/Volunteer'; // Adjust path if necessary

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    await dbConnect();

    const updated = await Volunteer.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Vrijwilliger niet gevonden.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Fout bij afwijzen vrijwilliger:', error);
    return NextResponse.json(
      { error: 'Fout bij afwijzen vrijwilliger.' },
      { status: 500 }
    );
  }
}
