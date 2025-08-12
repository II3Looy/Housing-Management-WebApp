"use client";

import { useState, useEffect } from "react";

interface AddRoomFormProps {
    onSubmit: (data: RoomFormData) => void;
    onCancel: () => void;
    initialData?: any; // Changed to any to accept API data structure
    isEdit?: boolean;
}

interface RoomFormData {
    BuildingID: number;
    RoomNumber: number;
    RoomType: number;
    FloorNumber: number;
    Capacity: number;
    FreeBeds: number;
    RoomID?: number; // Added for editing
}

// Helper function to convert API data to form data
const convertApiDataToFormData = (apiData: any): RoomFormData => {
    return {
        BuildingID: apiData.BuildingID || 0,
        RoomNumber: apiData.RoomNumber || 0,
        RoomType: apiData.RoomType || 0,
        FloorNumber: apiData.FloorNumber || 0,
        Capacity: apiData.Capacity || 0,
        FreeBeds: apiData.FreeBeds || 0,
        RoomID: apiData.RoomID, // Include the ID for editing
    };
};

export function AddRoomForm({ onSubmit, onCancel, initialData, isEdit = false }: AddRoomFormProps) {
    const [formData, setFormData] = useState<RoomFormData>({
        BuildingID: 0,
        RoomNumber: 0,
        RoomType: 0,
        FloorNumber: 0,
        Capacity: 0,
        FreeBeds: 0,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof RoomFormData, string>>>(
        {}
    );
    const [buildings, setBuildings] = useState<any[]>([]);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch buildings and room types from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [buildingsResponse, roomTypesResponse] = await Promise.all([
                    fetch('/api/building'),
                    fetch('/api/roomtype')
                ]);

                if (buildingsResponse.ok) {
                    const buildingsData = await buildingsResponse.json();
                    setBuildings(buildingsData);
                }

                if (roomTypesResponse.ok) {
                    const roomTypesData = await roomTypesResponse.json();
                    setRoomTypes(roomTypesData);
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

    // Auto-set FreeBeds to Capacity for new rooms
    useEffect(() => {
        if (!isEdit) {
            setFormData(prev => ({
                ...prev,
                FreeBeds: formData.Capacity
            }));
        }
    }, [formData.Capacity, isEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Partial<Record<keyof RoomFormData, string>> = {};
        
        if (!formData.BuildingID || formData.BuildingID === 0) {
            newErrors.BuildingID = "Please select a building";
        }
        
        if (!formData.RoomNumber || formData.RoomNumber <= 0) {
            newErrors.RoomNumber = "Please enter a valid room number";
        }
        
        if (!formData.RoomType || formData.RoomType === 0) {
            newErrors.RoomType = "Please select a room type";
        }
        
        if (!formData.FloorNumber || formData.FloorNumber <= 0) {
            newErrors.FloorNumber = "Please enter a valid floor number";
        }
        
        if (!formData.Capacity || formData.Capacity <= 0) {
            newErrors.Capacity = "Please enter a valid capacity";
        }
        
        if (!isEdit && formData.FreeBeds !== formData.Capacity) {
            newErrors.FreeBeds = "Free beds must equal capacity for new rooms";
        }
        
        if (isEdit && (formData.FreeBeds < 0 || formData.FreeBeds > formData.Capacity)) {
            newErrors.FreeBeds = "Free beds must be between 0 and capacity";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        onSubmit(formData);
    };

    const handleChange = (field: keyof RoomFormData, value: string | number) => {
        let convertedValue: number = 0;
        
        if (field === 'BuildingID' || field === 'RoomNumber' || field === 'RoomType' || 
            field === 'FloorNumber' || field === 'Capacity' || field === 'FreeBeds' || field === 'RoomID') {
            convertedValue = typeof value === 'string' ? parseInt(value) || 0 : value;
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: convertedValue
        }));
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    // Get available floors for selected building
    const getAvailableFloors = () => {
        if (!formData.BuildingID) return [];
        const building = buildings.find(b => b.BuildingID === formData.BuildingID);
        if (!building) return [];
        return Array.from({ length: building.NumberOfFloors }, (_, i) => i + 1);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Building *
                    </label>
                    <select
                        value={formData.BuildingID || ""}
                        onChange={(e) => handleChange('BuildingID', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.BuildingID ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    >
                        <option value="">Select a building</option>
                        {loading ? (
                            <option value="">Loading buildings...</option>
                        ) : buildings.length === 0 ? (
                            <option value="">No buildings available</option>
                        ) : (
                            buildings.map(building => (
                                <option key={building.BuildingID} value={building.BuildingID}>
                                    Building {building.BuildingID} (Camp {building.CampusID})
                                </option>
                            ))
                        )}
                    </select>
                    {errors.BuildingID && (
                        <p className="mt-1 text-sm text-red-400">{errors.BuildingID}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Room Number *
                    </label>
                    <input
                        type="number"
                        value={formData.RoomNumber || ""}
                        onChange={(e) => handleChange('RoomNumber', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.RoomNumber ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter room number"
                        min="1"
                        required
                    />
                    {errors.RoomNumber && (
                        <p className="mt-1 text-sm text-red-400">{errors.RoomNumber}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Room Type *
                    </label>
                    <select
                        value={formData.RoomType || ""}
                        onChange={(e) => handleChange('RoomType', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.RoomType ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    >
                        <option value="">Select room type</option>
                        {loading ? (
                            <option value="">Loading room types...</option>
                        ) : roomTypes.length === 0 ? (
                            <option value="">No room types available</option>
                        ) : (
                            roomTypes.map(roomType => (
                                <option key={roomType.RoomTypeID} value={roomType.RoomTypeID}>
                                    {roomType.RoomType}
                                </option>
                            ))
                        )}
                    </select>
                    {errors.RoomType && (
                        <p className="mt-1 text-sm text-red-400">{errors.RoomType}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Floor Number *
                    </label>
                    <select
                        value={formData.FloorNumber || ""}
                        onChange={(e) => handleChange('FloorNumber', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.FloorNumber ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                        disabled={!formData.BuildingID}
                    >
                        <option value="">Select floor</option>
                        {formData.BuildingID && getAvailableFloors().map(floor => (
                            <option key={floor} value={floor}>
                                Floor {floor}
                            </option>
                        ))}
                    </select>
                    {errors.FloorNumber && (
                        <p className="mt-1 text-sm text-red-400">{errors.FloorNumber}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Capacity *
                    </label>
                    <input
                        type="number"
                        value={formData.Capacity || ""}
                        onChange={(e) => handleChange('Capacity', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.Capacity ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter capacity"
                        min="1"
                        required
                    />
                    {errors.Capacity && (
                        <p className="mt-1 text-sm text-red-400">{errors.Capacity}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Free Beds *
                        {!isEdit && (
                            <span className="text-blue-400 text-xs ml-2">(Auto-set to capacity)</span>
                        )}
                        {isEdit && (
                            <span className="text-green-400 text-xs ml-2">(Adjustable)</span>
                        )}
                    </label>
                    <input
                        type="number"
                        value={formData.FreeBeds || ""}
                        onChange={(e) => handleChange('FreeBeds', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.FreeBeds ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder=""
                        min="0"
                        max={formData.Capacity}
                        required
                        disabled={!isEdit}
                    />
                    {errors.FreeBeds && (
                        <p className="mt-1 text-sm text-red-400">{errors.FreeBeds}</p>
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
                            Room Information
                        </h3>
                        <div className="mt-2 text-sm text-blue-200">
                            <p>• Room ID will be automatically generated by the system</p>
                            <p>• Floor number must be within the building's floor range</p>
                            <p>• For new rooms: Free beds automatically equals capacity</p>
                            <p>• For existing rooms: Free beds can be adjusted as needed</p>
                            <p>• Room availability is managed through the booking system</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {isEdit ? 'Update Room' : 'Create Room'}
                </button>
            </div>
        </form>
    );
}
