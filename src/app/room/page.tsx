"use client";
import { useState, useMemo, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { TableCard } from "@/components/base/table/table";
import { Table } from "@/components/base/table/table";
import { Modal } from "@/components/base/modal/modal";
import { AddRoomForm } from "@/components/forms/AddRoomForm";
import { Plus, Edit, Trash } from "lucide-react";

const columns = [
    { id: "RoomID", key: "RoomID", label: "Room ID" },
    { id: "BuildingID", key: "BuildingID", label: "Building ID" },
    { id: "RoomNumber", key: "RoomNumber", label: "Room Number" },
    { id: "RoomType", key: "RoomType", label: "Room Type" },
    { id: "FloorNumber", key: "FloorNumber", label: "Floor Number" },
    { id: "Capacity", key: "Capacity", label: "Capacity" },
    { id: "Free Beds", key: "Free Beds", label: "Free Beds" },
    { id: "actions", key: "actions", label: "Actions" },
];

export default function RoomPage() {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch rooms from API
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/room');
                if (!response.ok) {
                    throw new Error('Failed to fetch rooms');
                }
                const data = await response.json();
                setRooms(data);
            } catch (err) {
                console.error('Error fetching rooms:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
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

    const handleAddRoom = () => {
        setIsModalOpen(true);
    };

    const handleEditRoom = (room: any) => {
        setEditingRoom(room);
        setIsEditModalOpen(true);
    };

    const handleDeleteRoom = async (roomID: number) => {
        if (confirm("Are you sure you want to delete this room?")) {
            try {
                const response = await fetch(`/api/room?RoomID=${roomID}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete room');
                }

                setRooms(rooms.filter(room => room.RoomID !== roomID));
            } catch (error) {
                console.error("Error deleting room:", error);
                alert('Failed to delete room. Please try again.');
            }
        }
    };

    const handleSubmitRoom = async (formData: any) => {
        try {
            const response = await fetch('/api/room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            const newRoom = await response.json();
            setRooms(prev => [...prev, newRoom]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        }
    };

    const handleUpdateRoom = async (formData: any) => {
        try {
            const response = await fetch('/api/room', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, RoomID: editingRoom.RoomID }),
            });

            if (!response.ok) {
                throw new Error('Failed to update room');
            }

            const updatedRoom = await response.json();
            setRooms(prev => prev.map(room =>
                room.RoomID === editingRoom.RoomID
                    ? updatedRoom
                    : room
            ));
            setIsEditModalOpen(false);
            setEditingRoom(null);
        } catch (error) {
            console.error('Error updating room:', error);
            alert('Failed to update room. Please try again.');
        }
    };

    const handleCancelRoom = () => {
        setIsModalOpen(false);
    };

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditingRoom(null);
    };

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return rooms;
        return [...rooms].sort((a, b) => {
            const aValue = a[sortColumn as keyof typeof a];
            const bValue = b[sortColumn as keyof typeof b];
            
            if (aValue < bValue) return sortDirection === "ascending" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "ascending" ? 1 : -1;
            return 0;
        });
    }, [sortColumn, sortDirection, rooms]);

    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="p-6">
                <TableCard.Root>
                    <TableCard.Header
                        title="Room Management"
                        description="Manage camp accommodation rooms and their availability"
                        badge={rooms.length}
                        contentTrailing={
                            <button
                                onClick={handleAddRoom}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
                            >
                                <Plus className="h-4 w-4" />
                                Add Room
                            </button>
                        }
                    />
                    <div className="p-6">
                        <Table aria-label="Room table">
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
                                                    <span className="text-green-400">
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
                                        <Table.Row key={item.RoomID || item.id}>
                                            <Table.Cell>{item.RoomID}</Table.Cell>
                                            <Table.Cell>{item.BuildingID}</Table.Cell>
                                            <Table.Cell>{item.RoomNumber}</Table.Cell>
                                            <Table.Cell>{item.RoomType}</Table.Cell>
                                            <Table.Cell>{item.FloorNumber}</Table.Cell>
                                            <Table.Cell>{item.Capacity}</Table.Cell>
                                            <Table.Cell>{item['Free Beds']}</Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditRoom(item)}
                                                        className="p-1 text-green-400 hover:text-red-300 transition-colors"
                                                        title="Edit room"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoom(item.RoomID)}
                                                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                        title="Delete room"
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

                {/* Add Room Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancelRoom}
                    title="Add New Room"
                    size="lg"
                >
                    <AddRoomForm
                        onSubmit={handleSubmitRoom}
                        onCancel={handleCancelRoom}
                    />
                </Modal>

                {/* Edit Room Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleCancelEdit}
                    title="Edit Room"
                    size="lg"
                >
                    <AddRoomForm
                        onSubmit={handleUpdateRoom}
                        onCancel={handleCancelEdit}
                        initialData={editingRoom}
                        isEdit={true}
                    />
                </Modal>
            </main>
        </div>
    );
} 