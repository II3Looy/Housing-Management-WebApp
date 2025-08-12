import { NextRequest, NextResponse } from 'next/server';
import { storedProcedures } from '@/lib/database';

// GET /api/camp - Get all camps
export async function GET() {
    try {
        // Use stored procedure to get camps
        const result = await storedProcedures.getCamps();
        const camps = result.recordset || [];

        return NextResponse.json(camps);
    } catch (error) {
        console.error('Error fetching camps:', error);
        return NextResponse.json(
            { error: 'Failed to fetch camps' },
            { status: 500 }
        );
    }
}

// POST /api/camp - Create a new camp
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { CampusName, City } = body;

        // Validate required fields
        if (!CampusName || !City) {
            return NextResponse.json(
                { error: 'Campus Name and City are required' },
                { status: 400 }
            );
        }

        // Use stored procedure to create camp
        const result = await storedProcedures.createCamp(CampusName, City);
        
        // Return the created camp
        const newCamp = result.recordset?.[0] || {
            CampusName,
            City,
        };

        return NextResponse.json(newCamp);
    } catch (error) {
        console.error('Error creating camp:', error);
        return NextResponse.json(
            { error: 'Failed to create camp' },
            { status: 500 }
        );
    }
}

// PUT /api/camp - Update a camp
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { CampusID, CampusName, City } = body;

        // Validate required fields
        if (!CampusID) {
            return NextResponse.json(
                { error: 'Campus ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to update camp
        const result = await storedProcedures.updateCamp(CampusID, CampusName, City);
        
        // Return the updated camp
        const updatedCamp = result.recordset?.[0] || {
            CampusID,
            CampusName,
            City,
        };

        return NextResponse.json(updatedCamp);
    } catch (error) {
        console.error('Error updating camp:', error);
        return NextResponse.json(
            { error: 'Failed to update camp' },
            { status: 500 }
        );
    }
}

// DELETE /api/camp - Delete a camp
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const CampusID = searchParams.get('CampusID');

        if (!CampusID) {
            return NextResponse.json(
                { error: 'Campus ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to delete camp
        await storedProcedures.deleteCamp(parseInt(CampusID));

        return NextResponse.json({ message: 'Camp deleted successfully' });
    } catch (error) {
        console.error('Error deleting camp:', error);
        return NextResponse.json(
            { error: 'Failed to delete camp' },
            { status: 500 }
        );
    }
}
