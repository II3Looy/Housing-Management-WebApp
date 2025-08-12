import { NextRequest, NextResponse } from 'next/server';
import { storedProcedures } from '@/lib/database';

// GET /api/building - Get all buildings
export async function GET() {
    try {
        // Use stored procedure to get buildings
        const result = await storedProcedures.getBuildings();
        const buildings = result.recordset || [];

        return NextResponse.json(buildings);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch buildings' },
            { status: 500 }
        );
    }
}

// POST /api/building - Create a new building
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { CampusID, NumberOfFloors } = body;

        // Validate required fields
        if (!CampusID || !NumberOfFloors) {
            return NextResponse.json(
                { error: 'Campus ID and Number of Floors are required' },
                { status: 400 }
            );
        }

        // Use stored procedure to create building
        const result = await storedProcedures.createBuilding(CampusID, NumberOfFloors);
        
        // Return the created building
        const newBuilding = result.recordset?.[0] || {
            CampusID,
            NumberOfFloors,
        };

        return NextResponse.json(newBuilding);
    } catch (error) {
        console.error('Error creating building:', error);
        return NextResponse.json(
            { error: 'Failed to create building' },
            { status: 500 }
        );
    }
}

// PUT /api/building - Update a building
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { BuildingID, CampusID, NumberOfFloors } = body;

        // Validate required fields
        if (!BuildingID) {
            return NextResponse.json(
                { error: 'Building ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to update building
        const result = await storedProcedures.updateBuilding(BuildingID, CampusID, NumberOfFloors);
        
        // Return the updated building
        const updatedBuilding = result.recordset?.[0] || {
            BuildingID,
            CampusID,
            NumberOfFloors,
        };

        return NextResponse.json(updatedBuilding);
    } catch (error) {
        console.error('Error updating building:', error);
        return NextResponse.json(
            { error: 'Failed to update building' },
            { status: 500 }
        );
    }
}

// DELETE /api/building - Delete a building
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const BuildingID = searchParams.get('BuildingID');

        if (!BuildingID) {
            return NextResponse.json(
                { error: 'Building ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to delete building
        await storedProcedures.deleteBuilding(parseInt(BuildingID));

        return NextResponse.json({ message: 'Building deleted successfully' });
    } catch (error) {
        console.error('Error deleting building:', error);
        return NextResponse.json(
            { error: 'Failed to delete building' },
            { status: 500 }
        );
    }
}
