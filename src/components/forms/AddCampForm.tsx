"use client";

import { useState, useEffect } from "react";

interface AddCampFormProps {
    onSubmit: (data: CampFormData) => void;
    onCancel: () => void;
    initialData?: any; // Changed to any to accept API data structure
    isEdit?: boolean;
}

interface CampFormData {
    CampusName: string;
    City: number;
    CampusID?: number; // Added for editing
}

// Helper function to convert API data to form data
const convertApiDataToFormData = (apiData: any): CampFormData => {
    return {
        CampusName: apiData.CampusName || "",
        City: apiData.City || 0,
        CampusID: apiData.CampusID, // Include the ID for editing
    };
};

export function AddCampForm({ onSubmit, onCancel, initialData, isEdit = false }: AddCampFormProps) {
    const [formData, setFormData] = useState<CampFormData>({
        CampusName: "",
        City: 0,
    });

    const [errors, setErrors] = useState<Partial<CampFormData>>({});
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch cities from API
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('/api/city');
                if (response.ok) {
                    const citiesData = await response.json();
                    setCities(citiesData);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
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
        const newErrors: Partial<CampFormData> = {};
        
        if (!formData.CampusName.trim()) {
            newErrors.CampusName = "Please enter camp name";
        }
        
        if (!formData.City) {
            newErrors.City = "Please select a city";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        onSubmit(formData);
    };

    const handleChange = (field: keyof CampFormData, value: string | number) => {
        // Convert value based on field type
        let convertedValue: string | number = value;
        if (field === 'City' || field === 'CampusID') {
            convertedValue = typeof value === 'string' ? parseInt(value) || 0 : value;
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: convertedValue
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Camp Name *
                    </label>
                    <input
                        type="text"
                        value={formData.CampusName}
                        onChange={(e) => handleChange('CampusName', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.CampusName ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter camp name"
                        required
                    />
                    {errors.CampusName && (
                        <p className="mt-1 text-sm text-red-400">{errors.CampusName}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                    </label>
                    <select
                        value={formData.City || ""}
                        onChange={(e) => handleChange("City", e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.City ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    >
                        <option value="">Select a city</option>
                        {loading ? (
                            <option value="">Loading cities...</option>
                        ) : cities.length === 0 ? (
                            <option value="">No cities available</option>
                        ) : (
                            cities.map(city => (
                                <option key={city.CityID} value={city.CityID}>
                                    {city.CityName}
                                </option>
                            ))
                        )}
                    </select>
                    {errors.City && (
                        <p className="mt-1 text-sm text-red-400">{errors.City}</p>
                    )}
                </div>
            </div>

            <div className="bg-orange-900 bg-opacity-20 border border-orange-800 rounded-md p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-orange-300">
                            Camp Information
                        </h3>
                        <div className="mt-2 text-sm text-orange-200">
                            <p>• Camp ID will be automatically generated by the system</p>
                            <p>• Each camp must be associated with a specific city</p>
                            <p>• Camp name should be unique within the city</p>
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
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    {isEdit ? 'Update Camp' : 'Create Camp'}
                </button>
            </div>
        </form>
    );
}
