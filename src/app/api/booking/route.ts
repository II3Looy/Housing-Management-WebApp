import { NextRequest, NextResponse } from 'next/server';
import { storedProcedures, getConnection } from '@/lib/database';

// GET /api/booking - Get all bookings
export async function GET() {
    try {
        const result = await storedProcedures.getBookings();
        const bookings = result.recordset || [];
        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST /api/booking - Create a new booking
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { RoomID, EmployeeID, StartDate, EndDate } = body;

        // Validate required fields
        if (!RoomID || !EmployeeID || !StartDate || !EndDate) {
            return NextResponse.json(
                { error: 'Room ID, Employee ID, Start Date, and End Date are required' },
                { status: 400 }
            );
        }

        // Convert dates to proper SQL Server format (YYYY-MM-DD)
        const formattedStartDate = new Date(StartDate).toISOString().split('T')[0];
        const formattedEndDate = new Date(EndDate).toISOString().split('T')[0];

        const result = await storedProcedures.createBooking(RoomID, EmployeeID, formattedStartDate, formattedEndDate);
        
        // Return the created booking
        const newBooking = result.recordset?.[0] || {
            RoomID,
            EmployeeID,
            StartDate: formattedStartDate,
            EndDate: formattedEndDate,
            Active: true,
            Finished: false,
        };

        return NextResponse.json(newBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: 'Failed to create booking', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// PUT /api/booking - Update a booking
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { BookingID, RoomID, EmployeeID, StartDate, EndDate } = body;

        // Validate required fields
        if (!BookingID) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            );
        }
        
        // Convert dates to proper SQL Server format (YYYY-MM-DD) if provided
        const formattedStartDate = StartDate ? new Date(StartDate).toISOString().split('T')[0] : null;
        const formattedEndDate = EndDate ? new Date(EndDate).toISOString().split('T')[0] : null;
        
        // Use stored procedure to update booking
        let result;
        try {
            result = await storedProcedures.updateBooking(BookingID, RoomID, EmployeeID, formattedStartDate || '', formattedEndDate || '');
        } catch (spError) {
            console.error('Stored procedure execution failed:', spError);
            throw new Error(`Stored procedure failed: ${spError instanceof Error ? spError.message : 'Unknown error'}`);
        }
        
        // Return the updated booking
        const updatedBooking = result.recordset?.[0] || {
            BookingID,
            RoomID,
            EmployeeID,
            StartDate: formattedStartDate,
            EndDate: formattedEndDate,
        };

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json(
            { error: 'Failed to update booking', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// DELETE /api/booking - Delete a booking
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const BookingID = searchParams.get('BookingID');

        if (!BookingID) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            );
        }
        
        // Use stored procedure to delete booking
        try {
            await storedProcedures.deleteBooking(parseInt(BookingID));
        } catch (spError) {
            console.error('Delete stored procedure execution failed:', spError);
            throw new Error(`Delete stored procedure failed: ${spError instanceof Error ? spError.message : 'Unknown error'}`);
        }

        return NextResponse.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json(
            { error: 'Failed to delete booking', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
