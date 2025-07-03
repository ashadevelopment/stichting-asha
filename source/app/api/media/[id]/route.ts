import { NextRequest, NextResponse } from "next/server";
import { getMediaModel } from "../../../lib/models/Media";

// GET - Fetch individual media item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const MediaModel = await getMediaModel();
    
    // Fetch the full media item including data
    const mediaItem = await MediaModel.findById(id).lean();
    
    if (!mediaItem) {
      return NextResponse.json(
        { error: 'Media item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error('Error fetching media item:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching media item', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete individual media item (optional, for admin functionality)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const MediaModel = await getMediaModel();
    
    const deletedItem = await MediaModel.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Media item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Media item deleted successfully',
      id: deletedItem._id 
    });
  } catch (error) {
    console.error('Error deleting media item:', error);
    return NextResponse.json(
      { 
        error: 'Error deleting media item', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}