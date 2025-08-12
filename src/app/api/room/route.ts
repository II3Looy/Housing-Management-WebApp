import { NextRequest, NextResponse } from 'next/server';
import { storedProcedures } from '@/lib/database';

// GET /api/room - Get all rooms
export async function GET() {
    try {
        // Use stored procedure to get rooms
        const result = await storedProcedures.getRooms();
        const rooms = result.recordset || [];

        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rooms' },
            { status: 500 }
        );
    }
}

// POST /api/room - Create a new room
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { BuildingID, RoomNumber, RoomType, FloorNumber, Capacity, FreeBeds } = body;

        // Validate required fields
        if (!BuildingID || !RoomNumber || !RoomType || !FloorNumber || !Capacity || FreeBeds === undefined) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Use stored procedure to create room
        const result = await storedProcedures.createRoom(BuildingID, RoomNumber, RoomType, FloorNumber, Capacity, FreeBeds);
        
        // Return the created room
        const newRoom = result.recordset?.[0] || {
            BuildingID,
            RoomNumber,
            RoomType,
            FloorNumber,
            Capacity,
            FreeBeds,
        };

        return NextResponse.json(newRoom);
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json(
            { error: 'Failed to create room' },
            { status: 500 }
        );
    }
}

// PUT /api/room - Update a room
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { RoomID, BuildingID, RoomNumber, RoomType, FloorNumber, Capacity, FreeBeds, Availability } = body;

        // Validate required fields
        if (!RoomID) {
            return NextResponse.json(
                { error: 'Room ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to update room
        const result = await storedProcedures.updateRoom(RoomID, BuildingID, RoomNumber, RoomType, FloorNumber, Capacity, FreeBeds, Availability);
        
        // Return the updated room
        const updatedRoom = result.recordset?.[0] || {
            RoomID,
            BuildingID,
            RoomNumber,
            RoomType,
            FloorNumber,
            Capacity,
            FreeBeds,
            Availability,
        };

        return NextResponse.json(updatedRoom);
    } catch (error) {
        console.error('Error updating room:', error);
        return NextResponse.json(
            { error: 'Failed to update room' },
            { status: 500 }
        );
    }
}

// DELETE /api/room - Delete a room
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const RoomID = searchParams.get('RoomID');

        if (!RoomID) {
            return NextResponse.json(
                { error: 'Room ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to delete room
        await storedProcedures.deleteRoom(parseInt(RoomID));

        return NextResponse.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        return NextResponse.json(
            { error: 'Failed to delete room' },
            { status: 500 }
        );
    }
}
