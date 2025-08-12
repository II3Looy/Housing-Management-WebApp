"use client";
import Navigation from "@/components/Navigation";
import { Table, TableCard } from "@/components/base/table/table";
import { Modal } from "@/components/base/modal/modal";
import { AddCityForm } from "@/components/forms/AddCityForm";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";

const columns = [
    { id: "CityID", key: "CityID", label: "City ID" },
    { id: "CityName", key: "CityName", label: "City Name" },
    { id: "actions", key: "actions", label: "Actions" },
];

export default function CityPage() {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<any>(null);
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch cities from API
    useEffect(() => {
        const fetchCities = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/city');
                if (!response.ok) {
                    throw new Error('Failed to fetch cities');
                }
                const data = await response.json();
                setCities(data);
            } catch (err) {
                console.error('Error fetching cities:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch cities');
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, []);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            if (sortDirection === "ascending") {
                setSortDirection("descending");
            } else if (sortDirection === "descending") {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(columnKey);
            setSortDirection("ascending");
        }
    };

    const handleAddCity = () => {
        setIsModalOpen(true);
    };

    const handleEditCity = (city: any) => {
        setEditingCity(city);
        setIsEditModalOpen(true);
    };

    const handleDeleteCity = async (cityID: number) => {
        if (confirm("Are you sure you want to delete this city?")) {
            try {
                const response = await fetch(`/api/city?CityID=${cityID}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete city');
                }
                
                // Refresh data from API
                const refreshResponse = await fetch('/api/city');
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setCities(data);
                }
            } catch (error) {
                console.error("Error deleting city:", error);
                alert('Failed to delete city');
            }
        }
    };

    const handleSubmitCity = async (formData: any) => {
        try {
            const response = await fetch('/api/city', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create city');
            }

            // Refresh data from API
            const refreshResponse = await fetch('/api/city');
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setCities(data);
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating city:', error);
            alert('Failed to create city');
        }
    };

    const handleUpdateCity = async (formData: any) => {
        try {
            const response = await fetch('/api/city', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update city');
            }

            // Refresh data from API
            const refreshResponse = await fetch('/api/city');
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setCities(data);
            }

            setIsEditModalOpen(false);
            setEditingCity(null);
        } catch (error) {
            console.error('Error updating city:', error);
            alert('Failed to update city');
        }
    };

    const handleCancelCity = () => {
        setIsModalOpen(false);
    };

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditingCity(null);
    };

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return cities;

        return [...cities].sort((a, b) => {
            const aValue = a[sortColumn as keyof typeof a];
            const bValue = b[sortColumn as keyof typeof b];

            let comparison = 0;

            if (typeof aValue === "string" && typeof bValue === "string") {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                comparison = aValue - bValue;
            } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
                comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sortDirection === "ascending" ? comparison : -comparison;
        });
    }, [sortColumn, sortDirection, cities]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navigation />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-xl">Loading cities...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navigation />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-xl text-red-400">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />
            <div className="p-6">
                <TableCard.Root>
                    <TableCard.Header
                        title="Cities"
                        description="Manage city information for the housing system"
                        contentTrailing={
                            <button
                                onClick={handleAddCity}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-black"
                            >
                                <Plus className="h-4 w-4" />
                                Add City
                            </button>
                        }
                    />
                    <div className="p-6">
                        <Table aria-label="City table">
                            <Table.Header>
                                {columns.map((column, index) => (
                                    <Table.Head
                                        key={column.key}
                                        allowsSorting={column.key !== 'actions'}
                                        sortDirection={sortColumn === column.key ? sortDirection : null}
                                    >
                                        {column.key === 'actions' ? (
                                            column.label
                                        ) : (
                                            <button
                                                onClick={() => handleSort(column.key)}
                                                className="flex items-center gap-1 w-full text-left hover:text-gray-200 transition-colors"
                                            >
                                                {column.label}
                                                {sortColumn === column.key && (
                                                    <span className="text-teal-400">
                                                        {sortDirection === "ascending" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </Table.Head>
                                ))}
                            </Table.Header>
                            <Table.Body>
                                {sortedData.map((item) => (
                                    <Table.Row key={item.CityID || item.id}>
                                        <Table.Cell>{item.CityID || ''}</Table.Cell>
                                        <Table.Cell>{item.CityName || ''}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditCity(item)}
                                                    className="p-1 text-teal-400 hover:text-teal-300 transition-colors"
                                                    title="Edit city"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCity(item.CityID)}
                                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete city"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                </TableCard.Root>
            </div>

            {/* Add City Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCancelCity}
                title="Add City"
            >
                <AddCityForm
                    onSubmit={handleSubmitCity}
                    onCancel={handleCancelCity}
                />
            </Modal>

            {/* Edit City Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCancelEdit}
                title="Edit City"
            >
                <AddCityForm
                    initialData={editingCity}
                    isEdit={true}
                    onSubmit={handleUpdateCity}
                    onCancel={handleCancelEdit}
                />
            </Modal>
        </div>
    );
} 