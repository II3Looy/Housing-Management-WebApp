"use client";
import Navigation from "@/components/Navigation";
import { Table, TableCard } from "@/components/base/table/table";
import { Modal } from "@/components/base/modal/modal";
import { AddRoomTypeForm } from "@/components/forms/AddRoomTypeForm";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";

const columns = [
    { id: "RoomTypeID", key: "RoomTypeID", label: "Room Type ID" },
    { id: "RoomType", key: "RoomType", label: "Type Name" },
    { id: "actions", key: "actions", label: "Actions" },
];

export default function RoomTypePage() {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState<any>(null);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch room types from API
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/roomtype');
                if (!response.ok) {
                    throw new Error('Failed to fetch room types');
                }
                const data = await response.json();
                setRoomTypes(data);
            } catch (err) {
                console.error('Error fetching room types:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch room types');
            } finally {
                setLoading(false);
            }
        };

        fetchRoomTypes();
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

    const handleAddRoomType = () => {
        setIsModalOpen(true);
    };

    const handleEditRoomType = (roomType: any) => {
        setEditingRoomType(roomType);
        setIsEditModalOpen(true);
    };

    const handleDeleteRoomType = async (roomTypeID: number) => {
        if (confirm("Are you sure you want to delete this room type?")) {
            try {
                const response = await fetch(`/api/roomtype?RoomTypeID=${roomTypeID}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete room type');
                }
                
                // Refresh data from API
                const refreshResponse = await fetch('/api/roomtype');
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setRoomTypes(data);
                }
            } catch (error) {
                console.error("Error deleting room type:", error);
                alert('Failed to delete room type');
            }
        }
    };

    const handleSubmitRoomType = async (formData: any) => {
        try {
            const response = await fetch('/api/roomtype', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create room type');
            }

            // Refresh data from API
            const refreshResponse = await fetch('/api/roomtype');
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setRoomTypes(data);
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating room type:', error);
            alert('Failed to create room type');
        }
    };

    const handleUpdateRoomType = async (formData: any) => {
        try {
            const response = await fetch('/api/roomtype', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update room type');
            }

            // Refresh data from API
            const refreshResponse = await fetch('/api/roomtype');
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setRoomTypes(data);
            }

            setIsEditModalOpen(false);
            setEditingRoomType(null);
        } catch (error) {
            console.error('Error updating room type:', error);
            alert('Failed to update room type');
        }
    };

    const handleCancelRoomType = () => {
        setIsModalOpen(false);
    };

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditingRoomType(null);
    };

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return roomTypes;
        return [...roomTypes].sort((a, b) => {
            const aValue = a[sortColumn as keyof typeof a];
            const bValue = b[sortColumn as keyof typeof b];
            
            if (aValue < bValue) return sortDirection === "ascending" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "ascending" ? 1 : -1;
            return 0;
        });
    }, [sortColumn, sortDirection, roomTypes]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navigation />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-xl">Loading room types...</div>
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
                        title="Room Type Management"
                        description="Manage room types and their information"
                        badge={roomTypes.length}
                        contentTrailing={
                            <button
                                onClick={handleAddRoomType}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black"
                            >
                                <Plus className="h-4 w-4" />
                                Add Room Type
                            </button>
                        }
                    />
                    <div className="p-6">
                        <Table aria-label="RoomType table">
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
                                                    <span className="text-cyan-400">
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
                                    <Table.Row key={item.RoomTypeID || item.id}>
                                        <Table.Cell>{item.RoomTypeID || ''}</Table.Cell>
                                        <Table.Cell>{item.RoomType || ''}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditRoomType(item)}
                                                    className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                                                    title="Edit room type"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRoomType(item.RoomTypeID)}
                                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete room type"
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

                {/* Add Room Type Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancelRoomType}
                    title="Add New Room Type"
                    size="lg"
                >
                    <AddRoomTypeForm
                        onSubmit={handleSubmitRoomType}
                        onCancel={handleCancelRoomType}
                    />
                </Modal>

                {/* Edit Room Type Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleCancelEdit}
                    title="Edit Room Type"
                    size="lg"
                >
                    <AddRoomTypeForm
                        onSubmit={handleUpdateRoomType}
                        onCancel={handleCancelEdit}
                        initialData={editingRoomType}
                        isEdit={true}
                    />
                </Modal>
            </div>
        </div>
    );
} 