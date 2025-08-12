"use client";
import Navigation from "@/components/Navigation";
import { Table, TableCard } from "@/components/base/table/table";
import { Modal } from "@/components/base/modal/modal";
import { AddCampForm } from "@/components/forms/AddCampForm";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";

const columns = [
    { id: "CampusID", key: "CampusID", label: "Campus ID" },
    { id: "CampusName", key: "CampusName", label: "Campus Name" },
    { id: "City", key: "City", label: "City ID" },
    { id: "actions", key: "actions", label: "Actions" },
];

export default function CampPage() {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCamp, setEditingCamp] = useState<any>(null);
    const [camps, setCamps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch camps from API
    useEffect(() => {
        const fetchCamps = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/camp');
                if (!response.ok) {
                    throw new Error('Failed to fetch camps');
                }
                const data = await response.json();
                setCamps(data);
            } catch (err) {
                console.error('Error fetching camps:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch camps');
            } finally {
                setLoading(false);
            }
        };

        fetchCamps();
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

    const handleAddCamp = () => {
        setIsModalOpen(true);
    };

    const handleEditCamp = (camp: any) => {
        setEditingCamp(camp);
        setIsEditModalOpen(true);
    };

    const handleDeleteCamp = async (campusID: number) => {
        if (confirm("Are you sure you want to delete this camp?")) {
            try {
                const response = await fetch(`/api/camp?CampusID=${campusID}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete camp');
                }
                
                // Refresh data from API
                const refreshResponse = await fetch('/api/camp');
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setCamps(data);
                }
            } catch (error) {
                console.error("Error deleting camp:", error);
                alert('Failed to delete camp');
            }
        }
    };

    const handleSubmitCamp = async (formData: any) => {
        try {
            const response = await fetch('/api/camp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create camp');
            }

            // Refresh data from API
            const refreshResponse = await fetch('/api/camp');
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setCamps(data);
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating camp:', error);
            alert('Failed to create camp');
        }
    };

    const handleUpdateCamp = async (formData: any) => {
        try {
            const response = await fetch('/api/camp', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update camp');
            }

            // Refresh data from API
            const refreshResponse = await fetch('/api/camp');
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setCamps(data);
            }

            setIsEditModalOpen(false);
            setEditingCamp(null);
        } catch (error) {
            console.error('Error updating camp:', error);
            alert('Failed to update camp');
        }
    };

    const handleCancelCamp = () => {
        setIsModalOpen(false);
    };

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditingCamp(null);
    };

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return camps;

        return [...camps].sort((a, b) => {
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
    }, [sortColumn, sortDirection, camps]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navigation />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-xl">Loading camps...</div>
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
                        title="Camps"
                        description="Manage campus information for the housing system"
                        contentTrailing={
                            <button
                                onClick={handleAddCamp}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
                            >
                                <Plus className="h-4 w-4" />
                                Add Camp
                            </button>
                        }
                    />
                    <div className="p-6">
                        <Table aria-label="Camp table">
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
                                                    <span className="text-orange-400">
                                                        {sortDirection === "ascending" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </Table.Head>
                                ))}
                            </Table.Header>
                            <Table.Body>
                                {sortedData.map((item) => {
                                    return (
                                        <Table.Row key={item.CampusID || item.id}>
                                        <Table.Cell>{item.CampusID || ''}</Table.Cell>
                                        <Table.Cell>{item.CampusName || ''}</Table.Cell>
                                        <Table.Cell>{item.City || ''}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditCamp(item)}
                                                    className="p-1 text-orange-400 hover:text-orange-300 transition-colors"
                                                    title="Edit camp"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCamp(item.CampusID)}
                                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete camp"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                                })}
                            </Table.Body>
                        </Table>
                    </div>
                </TableCard.Root>
            </div>

            {/* Add Camp Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCancelCamp}
                title="Add Camp"
            >
                <AddCampForm
                    onSubmit={handleSubmitCamp}
                    onCancel={handleCancelCamp}
                />
            </Modal>

            {/* Edit Camp Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCancelEdit}
                title="Edit Camp"
            >
                <AddCampForm
                    initialData={editingCamp}
                    isEdit={true}
                    onSubmit={handleUpdateCamp}
                    onCancel={handleCancelEdit}
                />
            </Modal>
        </div>
    );
} 