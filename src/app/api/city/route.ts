import { NextRequest, NextResponse } from 'next/server';
import { storedProcedures } from '@/lib/database';

// GET /api/city - Get all cities
export async function GET() {
    try {
        // Use stored procedure to get cities
        const result = await storedProcedures.getCities();
        const cities = result.recordset || [];

        return NextResponse.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cities' },
            { status: 500 }
        );
    }
}

// POST /api/city - Create a new city
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { CityName } = body;

        // Validate required fields
        if (!CityName) {
            return NextResponse.json(
                { error: 'City Name is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to create city
        const result = await storedProcedures.createCity(CityName);
        
        // Return the created city
        const newCity = result.recordset?.[0] || {
            CityName,
        };

        return NextResponse.json(newCity);
    } catch (error) {
        console.error('Error creating city:', error);
        return NextResponse.json(
            { error: 'Failed to create city' },
            { status: 500 }
        );
    }
}

// PUT /api/city - Update a city
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { CityID, CityName } = body;

        // Validate required fields
        if (!CityID) {
            return NextResponse.json(
                { error: 'City ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to update city
        const result = await storedProcedures.updateCity(CityID, CityName);
        
        // Return the updated city
        const updatedCity = result.recordset?.[0] || {
            CityID,
            CityName,
        };

        return NextResponse.json(updatedCity);
    } catch (error) {
        console.error('Error updating city:', error);
        return NextResponse.json(
            { error: 'Failed to update city' },
            { status: 500 }
        );
    }
}

// DELETE /api/city - Delete a city
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const CityID = searchParams.get('CityID');

        if (!CityID) {
            return NextResponse.json(
                { error: 'City ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to delete city
        await storedProcedures.deleteCity(parseInt(CityID));

        return NextResponse.json({ message: 'City deleted successfully' });
    } catch (error) {
        console.error('Error deleting city:', error);
        return NextResponse.json(
            { error: 'Failed to delete city' },
            { status: 500 }
        );
    }
}
