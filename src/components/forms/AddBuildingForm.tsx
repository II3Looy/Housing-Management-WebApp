"use client";

import { useState, useEffect } from "react";

interface AddBuildingFormProps {
    onSubmit: (data: BuildingFormData) => void;
    onCancel: () => void;
    initialData?: any; // Changed to any to accept API data structure
    isEdit?: boolean;
}

interface BuildingFormData {
    CampusID: number;
    NumberOfFloors: number;
    BuildingID?: number; // Added for editing
}

interface BuildingFormErrors {
    CampusID?: string;
    NumberOfFloors?: string;
}

// Helper function to convert API data to form data
const convertApiDataToFormData = (apiData: any): BuildingFormData => {
    return {
        CampusID: apiData.CampusID || 0,
        NumberOfFloors: apiData.NumberOfFloors || 0,
        BuildingID: apiData.BuildingID, // Include the ID for editing
    };
};

export function AddBuildingForm({ onSubmit, onCancel, initialData, isEdit = false }: AddBuildingFormProps) {
    const [formData, setFormData] = useState<BuildingFormData>({
        CampusID: 0,
        NumberOfFloors: 0,
    });

    const [errors, setErrors] = useState<BuildingFormErrors>({});
    const [camps, setCamps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch camps from API
    useEffect(() => {
        const fetchCamps = async () => {
            try {
                const response = await fetch('/api/camp');
                if (response.ok) {
                    const campsData = await response.json();
                    setCamps(campsData);
                }
            } catch (error) {
                console.error('Error fetching camps:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCamps();
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
        const newErrors: BuildingFormErrors = {};
        
        if (!formData.CampusID || formData.CampusID === 0) {
            newErrors.CampusID = "Please select a camp";
        }
        
        if (!formData.NumberOfFloors || formData.NumberOfFloors === 0) {
            newErrors.NumberOfFloors = "Please select number of floors";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        onSubmit(formData);
    };

    const handleChange = (field: keyof BuildingFormData, value: string | number) => {
        // Convert value based on field type
        let convertedValue: string | number = value;
        if (field === 'CampusID' || field === 'NumberOfFloors' || field === 'BuildingID') {
            convertedValue = typeof value === 'string' ? parseInt(value) || 0 : value;
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: convertedValue
        }));
        
        // Clear error when user starts typing
        if (errors[field as keyof BuildingFormErrors]) {
            setErrors(prev => ({
                ...prev,
                [field as keyof BuildingFormErrors]: undefined,
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Camp *
                    </label>
                    <select
                        value={formData.CampusID || ""}
                        onChange={(e) => handleChange('CampusID', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.CampusID ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    >
                        <option value="">Select a camp</option>
                        {loading ? (
                            <option value="">Loading camps...</option>
                        ) : camps.length === 0 ? (
                            <option value="">No camps available</option>
                        ) : (
                            camps.map(camp => (
                                <option key={camp.CampusID} value={camp.CampusID}>
                                    {camp.CampusName}
                                </option>
                            ))
                        )}
                    </select>
                    {errors.CampusID && (
                        <p className="mt-1 text-sm text-red-400">{errors.CampusID}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Number of Floors *
                    </label>
                    <select
                        value={formData.NumberOfFloors || ""}
                        onChange={(e) => handleChange('NumberOfFloors', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.NumberOfFloors ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    >
                        <option value="">Select floors</option>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(floor => (
                            <option key={floor} value={floor}>
                                {floor} {floor === 1 ? 'floor' : 'floors'}
                            </option>
                        ))}
                    </select>
                    {errors.NumberOfFloors && (
                        <p className="mt-1 text-sm text-red-400">{errors.NumberOfFloors}</p>
                    )}
                </div>
            </div>

            <div className="bg-indigo-900 bg-opacity-20 border border-indigo-800 rounded-md p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-indigo-300">
                            Building Information
                        </h3>
                        <div className="mt-2 text-sm text-indigo-200">
                            <p>• Building ID will be automatically generated by the system</p>
                            <p>• Each building must be associated with a specific camp</p>
                            <p>• Floor count determines available room floor options</p>
                            <p>• Buildings are identified by their ID and camp association</p>
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
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {isEdit ? 'Update Building' : 'Create Building'}
                </button>
            </div>
        </form>
    );
}
