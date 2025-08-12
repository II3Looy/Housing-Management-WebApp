"use client";
import Navigation from "@/components/Navigation";
import { Table, TableCard } from "@/components/base/table/table";
import { Modal } from "@/components/base/modal/modal";
import { AddNationalityForm } from "@/components/forms/AddNationalityForm";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";

const columns = [
    { id: "NationalityID", key: "NationalityID", label: "Nationality ID" },
    { id: "Nationality", key: "Nationality", label: "Nationality Name" },
    { id: "actions", key: "actions", label: "Actions" },
];

export default function NationalityPage() {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingNationality, setEditingNationality] = useState<any>(null);
    const [nationalities, setNationalities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch nationalities from API
    useEffect(() => {
        const fetchNationalities = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/nationality');
                if (!response.ok) {
                    throw new Error('Failed to fetch nationalities');
                }
                const data = await response.json();
                setNationalities(data);
            } catch (err) {
                console.error('Error fetching nationalities:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch nationalities');
            } finally {
                setLoading(false);
            }
        };

        fetchNationalities();
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

    const handleAddNationality = () => {
        setIsModalOpen(true);
    };

    const handleEditNationality = (nationality: any) => {
        setEditingNationality(nationality);
        setIsEditModalOpen(true);
    };

    const handleDeleteNationality = async (nationalityID: number) => {
        if (confirm("Are you sure you want to delete this nationality?")) {
            try {
                const response = await fetch(`/api/nationality?NationalityID=${nationalityID}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete nationality');
                }
                
                // Refresh data from API
                const refreshResponse = await fetch('/api/nationality');
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setNationalities(data);
                }
            } catch (error) {
                console.error("Error deleting nationality:", error);
                alert('Failed to delete nationality');
            }
        }
    };

    const handleSubmitNationality = async (formData: any) => {
        try {
            const response = await fetch('/api/nationality', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create nationality');
            }

            // Refresh data from API
            const refreshResponse = await fetch('/api/nationality');
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setNationalities(data);
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating nationality:', error);
            alert('Failed to create nationality');
        }
    };

    const handleUpdateNationality = async (formData: any) => {
        try {
            const response = await fetch('/api/nationality', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update nationality');
            }

            // Refresh data from API
            const refreshResponse = await fetch('/api/nationality');
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setNationalities(data);
            }

            setIsEditModalOpen(false);
            setEditingNationality(null);
        } catch (error) {
            console.error('Error updating nationality:', error);
            alert('Failed to update nationality');
        }
    };

    const handleCancelNationality = () => {
        setIsModalOpen(false);
    };

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditingNationality(null);
    };

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return nationalities;

        return [...nationalities].sort((a, b) => {
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
    }, [sortColumn, sortDirection, nationalities]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navigation />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-xl">Loading nationalities...</div>
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
                        title="Nationalities"
                        description="Manage nationality information for the housing system"
                        contentTrailing={
                            <button
                                onClick={handleAddNationality}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
                            >
                                <Plus className="h-4 w-4" />
                                Add Nationality
                            </button>
                        }
                    />
                    <div className="p-6">
                        <Table aria-label="Nationality table">
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
                                                    <span className="text-purple-400">
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
                                        <Table.Row key={item.NationalityID || item.id}>
                                            <Table.Cell>{item.NationalityID || ''}</Table.Cell>
                                            <Table.Cell>{item.Nationality || ''}</Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditNationality(item)}
                                                        className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                                                        title="Edit nationality"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNationality(item.NationalityID)}
                                                        className="p-1 text-red-400 hover:text-red-400 transition-colors"
                                                        title="Delete nationality"
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

            {/* Add Nationality Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCancelNationality}
                title="Add Nationality"
            >
                <AddNationalityForm
                    onSubmit={handleSubmitNationality}
                    onCancel={handleCancelNationality}
                />
            </Modal>

            {/* Edit Nationality Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCancelEdit}
                title="Edit Nationality"
            >
                <AddNationalityForm
                    initialData={editingNationality}
                    isEdit={true}
                    onSubmit={handleUpdateNationality}
                    onCancel={handleCancelEdit}
                />
            </Modal>
        </div>
    );
} 