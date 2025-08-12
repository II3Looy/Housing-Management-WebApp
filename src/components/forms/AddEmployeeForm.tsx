"use client";

import { useState, useEffect } from "react";

interface AddEmployeeFormProps {
    onSubmit: (data: EmployeeFormData) => void;
    onCancel: () => void;
    initialData?: any; // Changed to any to accept API data structure
    isEdit?: boolean;
}

interface EmployeeFormData {
    FirstName: string;
    LastName: string;
    NationalityID: number;
    PhoneNumber: string;
    Email: string;
    JobTitle: string;
    Salary: number;
    EmployeeID?: number; // Added for editing
}

// Helper function to convert API data to form data
const convertApiDataToFormData = (apiData: any): EmployeeFormData => {
    return {
        FirstName: apiData.FirstName || "",
        LastName: apiData.LastName || "",
        NationalityID: apiData.NationalityID || 0,
        PhoneNumber: apiData.PhoneNumber || "",
        Email: apiData.Email || "",
        JobTitle: apiData.JobTitle || "",
        Salary: apiData.Salary || 0,
        EmployeeID: apiData.EmployeeID, // Include the ID for editing
    };
};

export function AddEmployeeForm({ onSubmit, onCancel, initialData, isEdit = false }: AddEmployeeFormProps) {
    const [formData, setFormData] = useState<EmployeeFormData>({
        FirstName: "",
        LastName: "",
        NationalityID: 0,
        PhoneNumber: "",
        Email: "",
        JobTitle: "",
        Salary: 0,
    });

    const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});
    const [nationalities, setNationalities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch nationalities from API
    useEffect(() => {
        const fetchNationalities = async () => {
            try {
                const response = await fetch('/api/nationality');
                if (response.ok) {
                    const nationalitiesData = await response.json();
                    setNationalities(nationalitiesData);
                }
            } catch (error) {
                console.error('Error fetching nationalities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNationalities();
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
        const newErrors: Partial<EmployeeFormData> = {};
        
        if (!formData.FirstName.trim()) {
            newErrors.FirstName = "Please enter first name";
        }
        
        if (!formData.LastName.trim()) {
            newErrors.LastName = "Please enter last name";
        }
        
        if (!formData.PhoneNumber.trim()) {
            newErrors.PhoneNumber = "Please enter phone number";
        }
        
        if (!formData.Email.trim()) {
            newErrors.Email = "Please enter email address";
        } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
            newErrors.Email = "Please enter a valid email address";
        }
        
        if (!formData.JobTitle.trim()) {
            newErrors.JobTitle = "Please enter job title";
        }
        
        if (!formData.NationalityID || formData.NationalityID === 0) {
            newErrors.NationalityID = "Please select a nationality";
        }
        
        if (!formData.Salary || formData.Salary <= 0) {
            newErrors.Salary = "Please enter a valid salary";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        onSubmit(formData);
    };

    const handleChange = (field: keyof EmployeeFormData, value: string | number) => {
        // Convert value based on field type
        let convertedValue: string | number = value;
        if (field === 'NationalityID' || field === 'Salary' || field === 'EmployeeID') {
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
                        First Name *
                    </label>
                    <input
                        type="text"
                        value={formData.FirstName}
                        onChange={(e) => handleChange('FirstName', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.FirstName ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter first name"
                        required
                    />
                    {errors.FirstName && (
                        <p className="mt-1 text-sm text-red-400">{errors.FirstName}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name *
                    </label>
                    <input
                        type="text"
                        value={formData.LastName}
                        onChange={(e) => handleChange('LastName', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.LastName ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter last name"
                        required
                    />
                    {errors.LastName && (
                        <p className="mt-1 text-sm text-red-400">{errors.LastName}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        value={formData.PhoneNumber}
                        onChange={(e) => handleChange('PhoneNumber', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.PhoneNumber ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter phone number"
                        required
                    />
                    {errors.PhoneNumber && (
                        <p className="mt-1 text-sm text-red-400">{errors.PhoneNumber}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                    </label>
                    <input
                        type="email"
                        value={formData.Email}
                        onChange={(e) => handleChange('Email', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.Email ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter email address"
                        required
                    />
                    {errors.Email && (
                        <p className="mt-1 text-sm text-red-400">{errors.Email}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Job Title *
                    </label>
                    <input
                        type="text"
                        value={formData.JobTitle}
                        onChange={(e) => handleChange('JobTitle', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.JobTitle ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter job title"
                        required
                    />
                    {errors.JobTitle && (
                        <p className="mt-1 text-sm text-red-400">{errors.JobTitle}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nationality *
                    </label>
                    <select
                        value={formData.NationalityID || ""}
                        onChange={(e) => handleChange('NationalityID', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.NationalityID ? "border-red-500" : "border-gray-700"
                        }`}
                        required
                    >
                        <option value="">Select a nationality</option>
                        {loading ? (
                            <option value="">Loading nationalities...</option>
                        ) : nationalities.length === 0 ? (
                            <option value="">No nationalities available</option>
                        ) : (
                            nationalities.map(nationality => (
                                <option key={nationality.NationalityID} value={nationality.NationalityID}>
                                    {nationality.Nationality}
                                </option>
                            ))
                        )}
                    </select>
                    {errors.NationalityID && (
                        <p className="mt-1 text-sm text-red-400">{errors.NationalityID}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Salary *
                    </label>
                    <input
                        type="number"
                        value={formData.Salary || ""}
                        onChange={(e) => handleChange('Salary', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.Salary ? "border-red-500" : "border-gray-700"
                        }`}
                        placeholder="Enter salary"
                        min="1"
                        step="0.01"
                        required
                    />
                    {errors.Salary && (
                        <p className="mt-1 text-sm text-red-400">{errors.Salary}</p>
                    )}
                </div>
            </div>

            <div className="bg-purple-900 bg-opacity-20 border border-purple-800 rounded-md p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-purple-300">
                            Employee Information
                        </h3>
                        <div className="mt-2 text-sm text-purple-200">
                            <p>• Employee ID will be automatically generated by the system</p>
                            <p>• All fields are required for employee registration</p>
                            <p>• Email must be in a valid format</p>
                            <p>• Salary must be a positive number</p>
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
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    {isEdit ? 'Update Employee' : 'Create Employee'}
                </button>
            </div>
        </form>
    );
}
