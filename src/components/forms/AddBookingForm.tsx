"use client";

import { useState, useEffect } from "react";

interface AddBookingFormProps {
    onSubmit: (data: BookingFormData) => void;
    onCancel: () => void;
    initialData?: any; // Changed to any to accept API data structure
    isEdit?: boolean;
}

interface BookingFormData {
    RoomID: number;
    EmployeeID: number;
    StartDate: string;
    EndDate: string;
    BookingID?: number; // Added for editing
}

// Helper function to convert API data to form data
const convertApiDataToFormData = (apiData: any): BookingFormData => {
    return {
        RoomID: apiData.RoomID || 0,
        EmployeeID: apiData.EmployeeID || 0,
        StartDate: apiData.StartDate ? new Date(apiData.StartDate).toISOString().split('T')[0] : "",
        EndDate: apiData.EndDate ? new Date(apiData.EndDate).toISOString().split('T')[0] : "",
        BookingID: apiData.BookingID, // Include the ID for editing
    };
};

export function AddBookingForm({ onSubmit, onCancel, initialData, isEdit = false }: AddBookingFormProps) {
    const [formData, setFormData] = useState<BookingFormData>({
        RoomID: 0,
        EmployeeID: 0,
        StartDate: "",
        EndDate: "",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
    const [rooms, setRooms] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch rooms and employees data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomsResponse, employeesResponse] = await Promise.all([
                    fetch('/api/room'),
                    fetch('/api/employee')
                ]);

                if (roomsResponse.ok) {
                    const roomsData = await roomsResponse.json();
                    setRooms(roomsData);
                }

                if (employeesResponse.ok) {
                    const employeesData = await employeesResponse.json();
                    setEmployees(employeesData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Initialize form with initial data if editing
    useEffect(() => {
        if (initialData && isEdit) {
            setFormData(convertApiDataToFormData(initialData));
        }
    }, [initialData, isEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        const newErrors: Partial<Record<keyof BookingFormData, string>> = {};
        
        if (!formData.RoomID || formData.RoomID === 0) {
            newErrors.RoomID = "Please select a room";
        }
        
        if (!formData.EmployeeID || formData.EmployeeID === 0) {
            newErrors.EmployeeID = "Please select an employee";
        }
        
        if (!formData.StartDate) {
            newErrors.StartDate = "Please select a start date";
        } else {
            const startDate = new Date(formData.StartDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                newErrors.StartDate = "Start date cannot be in the past";
            }
        }
        
        if (!formData.EndDate) {
            newErrors.EndDate = "Please select an end date";
        } else if (formData.StartDate && formData.EndDate) {
            const startDate = new Date(formData.StartDate);
            const endDate = new Date(formData.EndDate);
            
            if (endDate <= startDate) {
                newErrors.EndDate = "End date must be after start date";
            }
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        onSubmit(formData);
    };

    const handleChange = (field: keyof BookingFormData, value: string | number) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value,
            };
            
            // If start date is changed and end date becomes invalid, update end date
            if (field === "StartDate" && value && newData.EndDate) {
                const startDate = new Date(value as string);
                const endDate = new Date(newData.EndDate);
                
                if (endDate <= startDate) {
                    // Set end date to start date + 1 day
                    const newEndDate = new Date(startDate);
                    newEndDate.setDate(newEndDate.getDate() + 1);
                    newData.EndDate = newEndDate.toISOString().split('T')[0];
                }
            }
            
            return newData;
        });
        
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Room *
                    </label>
                    <select
                        value={formData.RoomID || ""}
                        onChange={(e) => handleChange("RoomID", parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.RoomID ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    >
                        <option value="">Select a room</option>
                        {loading ? (
                            <option value="">Loading rooms...</option>
                        ) : rooms.length === 0 ? (
                            <option value="">No rooms available</option>
                        ) : (
                            rooms.map((room) => (
                                <option key={room.RoomID} value={room.RoomID}>
                                    Room {room.RoomNumber} - Building {room.BuildingID}
                                </option>
                            ))
                        )}
                    </select>
                    {errors.RoomID && (
                        <p className="mt-1 text-sm text-red-400">{errors.RoomID}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Employee *
                    </label>
                    <select
                        value={formData.EmployeeID || ""}
                        onChange={(e) => handleChange("EmployeeID", parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.EmployeeID ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    >
                        <option value="">Select an employee</option>
                        {loading ? (
                            <option value="">Loading employees...</option>
                        ) : employees.length === 0 ? (
                            <option value="">No employees available</option>
                        ) : (
                            employees.map((employee) => (
                                <option key={employee.EmployeeID} value={employee.EmployeeID}>
                                    {employee.FirstName} {employee.LastName}
                                </option>
                            ))
                        )}
                    </select>
                    {errors.EmployeeID && (
                        <p className="mt-1 text-sm text-red-400">{errors.EmployeeID}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        value={formData.StartDate}
                        onChange={(e) => handleChange("StartDate", e.target.value)}
                        min={today}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.StartDate ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    />
                    {errors.StartDate && (
                        <p className="mt-1 text-sm text-red-400">{errors.StartDate}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date *
                    </label>
                    <input
                        type="date"
                        value={formData.EndDate}
                        onChange={(e) => handleChange("EndDate", e.target.value)}
                        min={formData.StartDate || today}
                        disabled={!formData.StartDate}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.EndDate ? "border-red-500" : "border-gray-700"
                        } ${!formData.StartDate ? "opacity-50 cursor-not-allowed" : ""}`}
                        required
                    />
                    {errors.EndDate && (
                        <p className="mt-1 text-sm text-red-400">{errors.EndDate}</p>
                    )}
                    {!formData.StartDate && (
                        <p className="mt-1 text-sm text-gray-400">Please select a start date first</p>
                    )}
                </div>
            </div>

            <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-md p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-300">
                            Booking Information
                        </h3>
                        <div className="mt-2 text-sm text-blue-200">
                            <p>• Active and Finished status will be automatically managed by the system</p>
                            <p>• Only available rooms and employees are shown in the dropdowns</p>
                            <p>• Start date must be today or in the future</p>
                            <p>• End date must be after the start date</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                >
                    {isEdit ? "Update Booking" : "Add Booking"}
                </button>
            </div>
        </form>
    );
}
