import { NextRequest, NextResponse } from 'next/server';
import { storedProcedures } from '@/lib/database';

// GET /api/nationality - Get all nationalities
export async function GET() {
    try {
        // Use stored procedure to get nationalities
        const result = await storedProcedures.getNationalities();
        const nationalities = result.recordset || [];

        return NextResponse.json(nationalities);
    } catch (error) {
        console.error('Error fetching nationalities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch nationalities' },
            { status: 500 }
        );
    }
}

// POST /api/nationality - Create a new nationality
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { Nationality } = body;

        // Validate required fields
        if (!Nationality) {
            return NextResponse.json(
                { error: 'Nationality is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to create nationality
        const result = await storedProcedures.createNationality(Nationality);
        
        // Return the created nationality
        const newNationality = result.recordset?.[0] || {
            Nationality,
        };

        return NextResponse.json(newNationality);
    } catch (error) {
        console.error('Error creating nationality:', error);
        return NextResponse.json(
            { error: 'Failed to create nationality' },
            { status: 500 }
        );
    }
}

// PUT /api/nationality - Update a nationality
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { NationalityID, Nationality } = body;

        // Validate required fields
        if (!NationalityID) {
            return NextResponse.json(
                { error: 'Nationality ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to update nationality
        const result = await storedProcedures.updateNationality(NationalityID, Nationality);
        
        // Return the updated nationality
        const updatedNationality = result.recordset?.[0] || {
            NationalityID,
            Nationality,
        };

        return NextResponse.json(updatedNationality);
    } catch (error) {
        console.error('Error updating nationality:', error);
        return NextResponse.json(
            { error: 'Failed to update nationality' },
            { status: 500 }
        );
    }
}

// DELETE /api/nationality - Delete a nationality
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const NationalityID = searchParams.get('NationalityID');

        if (!NationalityID) {
            return NextResponse.json(
                { error: 'Nationality ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to delete nationality
        await storedProcedures.deleteNationality(parseInt(NationalityID));

        return NextResponse.json({ message: 'Nationality deleted successfully' });
    } catch (error) {
        console.error('Error deleting nationality:', error);
        return NextResponse.json(
            { error: 'Failed to delete nationality' },
            { status: 500 }
        );
    }
}
