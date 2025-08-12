import { NextRequest, NextResponse } from 'next/server';
import { storedProcedures } from '@/lib/database';

// GET /api/roomtype - Get all room types
export async function GET() {
    try {
        // Use stored procedure to get room types
        const result = await storedProcedures.getRoomTypes();
        const roomTypes = result.recordset || [];

        return NextResponse.json(roomTypes);
    } catch (error) {
        console.error('Error fetching room types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch room types' },
            { status: 500 }
        );
    }
}

// POST /api/roomtype - Create a new room type
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { RoomType } = body;

        // Validate required fields
        if (!RoomType) {
            return NextResponse.json(
                { error: 'Room Type is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to create room type
        const result = await storedProcedures.createRoomType(RoomType);
        
        // Return the created room type
        const newRoomType = result.recordset?.[0] || {
            RoomType,
        };

        return NextResponse.json(newRoomType);
    } catch (error) {
        console.error('Error creating room type:', error);
        return NextResponse.json(
            { error: 'Failed to create room type' },
            { status: 500 }
        );
    }
}

// PUT /api/roomtype - Update a room type
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { RoomTypeID, RoomType } = body;

        // Validate required fields
        if (!RoomTypeID) {
            return NextResponse.json(
                { error: 'Room Type ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to update room type
        const result = await storedProcedures.updateRoomType(RoomTypeID, RoomType);
        
        // Return the updated room type
        const updatedRoomType = result.recordset?.[0] || {
            RoomTypeID,
            RoomType,
        };

        return NextResponse.json(updatedRoomType);
    } catch (error) {
        console.error('Error updating room type:', error);
        return NextResponse.json(
            { error: 'Failed to update room type' },
            { status: 500 }
        );
    }
}

// DELETE /api/roomtype - Delete a room type
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const RoomTypeID = searchParams.get('RoomTypeID');

        if (!RoomTypeID) {
            return NextResponse.json(
                { error: 'Room Type ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to delete room type
        await storedProcedures.deleteRoomType(parseInt(RoomTypeID));

        return NextResponse.json({ message: 'Room type deleted successfully' });
    } catch (error) {
        console.error('Error deleting room type:', error);
        return NextResponse.json(
            { error: 'Failed to delete room type' },
            { status: 500 }
        );
    }
}
