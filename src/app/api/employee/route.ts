import { NextRequest, NextResponse } from 'next/server';
import { storedProcedures } from '@/lib/database';

// GET /api/employee - Get all employees
export async function GET() {
    try {
        // Use stored procedure to get employees
        const result = await storedProcedures.getEmployees();
        const employees = result.recordset || [];

        return NextResponse.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}

// POST /api/employee - Create a new employee
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { FirstName, LastName, NationalityID, PhoneNumber, Email, JobTitle, Salary } = body;

        // Validate required fields
        if (!FirstName || !LastName || !NationalityID || !PhoneNumber || !Email || !JobTitle || !Salary) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Use stored procedure to create employee
        const result = await storedProcedures.createEmployee(FirstName, LastName, Email, parseInt(PhoneNumber), JobTitle, NationalityID, Salary);
        
        // Return the created employee
        const newEmployee = result.recordset?.[0] || {
            FirstName,
            LastName,
            NationalityID,
            PhoneNumber,
            Email,
            JobTitle,
            Salary,
        };

        return NextResponse.json(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json(
            { error: 'Failed to create employee' },
            { status: 500 }
        );
    }
}

// PUT /api/employee - Update an employee
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { EmployeeID, FirstName, LastName, NationalityID, PhoneNumber, Email, JobTitle, Salary } = body;

        // Validate required fields
        if (!EmployeeID) {
            return NextResponse.json(
                { error: 'Employee ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to update employee
        const result = await storedProcedures.updateEmployee(EmployeeID, FirstName, LastName, NationalityID, parseInt(PhoneNumber), Email, JobTitle, Salary);
        
        // Return the updated employee
        const updatedEmployee = result.recordset?.[0] || {
            EmployeeID,
            FirstName,
            LastName,
            NationalityID,
            PhoneNumber,
            Email,
            JobTitle,
            Salary,
        };

        return NextResponse.json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        return NextResponse.json(
            { error: 'Failed to update employee' },
            { status: 500 }
        );
    }
}

// DELETE /api/employee - Delete an employee
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const EmployeeID = searchParams.get('EmployeeID');

        if (!EmployeeID) {
            return NextResponse.json(
                { error: 'Employee ID is required' },
                { status: 400 }
            );
        }

        // Use stored procedure to delete employee
        await storedProcedures.deleteEmployee(parseInt(EmployeeID));

        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json(
            { error: 'Failed to delete employee' },
            { status: 500 }
        );
    }
}
