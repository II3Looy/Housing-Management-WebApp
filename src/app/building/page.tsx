"use client";
import Navigation from "@/components/Navigation";
import { Table, TableCard } from "@/components/base/table/table";
import { Modal } from "@/components/base/modal/modal";
import { AddBuildingForm } from "@/components/forms/AddBuildingForm";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";

interface Building {
  BuildingID: number;
  CampusID: number;
  NumberOfFloors: number;
}

const columns = [
  { id: "BuildingID", key: "BuildingID", label: "Building ID" },
  { id: "CampusID", key: "CampusID", label: "Campus ID" },
  { id: "NumberOfFloors", key: "NumberOfFloors", label: "Floors" },
  { id: "actions", key: "actions", label: "Actions" },
];

export default function BuildingPage() {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/building');
        if (!response.ok) {
          throw new Error('Failed to fetch buildings');
        }
        const data = await response.json();
        setBuildings(data);
      } catch (err) {
        console.error('Error fetching buildings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch buildings');
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
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

  const handleAddBuilding = () => setIsModalOpen(true);

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsEditModalOpen(true);
  };

  const handleDeleteBuilding = async (buildingID: number) => {
    if (!confirm("Are you sure you want to delete this building?")) return;
    
    try {
      const response = await fetch(`/api/building?BuildingID=${buildingID}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete building');
      }
      
      const refreshResponse = await fetch('/api/building');
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setBuildings(data);
      }
    } catch (error) {
      console.error("Error deleting building:", error);
      alert('Failed to delete building');
    }
  };

  const handleSubmitBuilding = async (formData: Partial<Building>) => {
    try {
      const response = await fetch('/api/building', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create building');
      }

      const refreshResponse = await fetch('/api/building');
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setBuildings(data);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating building:', error);
      alert('Failed to create building');
    }
  };

  const handleUpdateBuilding = async (formData: Partial<Building>) => {
    try {
      const response = await fetch('/api/building', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update building');
      }

      const refreshResponse = await fetch('/api/building');
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setBuildings(data);
      }

      setIsEditModalOpen(false);
      setEditingBuilding(null);
    } catch (error) {
      console.error('Error updating building:', error);
      alert('Failed to update building');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return buildings;

    return [...buildings].sort((a, b) => {
      const aValue = a[sortColumn as keyof Building];
      const bValue = b[sortColumn as keyof Building];

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
  }, [sortColumn, sortDirection, buildings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-xl">Loading buildings...</div>
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
            title="Buildings"
            description="Manage building information for the housing system"
            contentTrailing={
              <button
                onClick={handleAddBuilding}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <Plus className="h-4 w-4" />
                Add Building
              </button>
            }
          />
          <div className="p-6">
            <Table aria-label="Building table">
              <Table.Header>
                {columns.map((column) => (
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
                          <span className="text-indigo-400">
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
                  <Table.Row key={item.BuildingID}>
                    <Table.Cell>{item.BuildingID}</Table.Cell>
                    <Table.Cell>{item.CampusID}</Table.Cell>
                    <Table.Cell>{item.NumberOfFloors}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditBuilding(item)}
                          className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                          title="Edit building"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBuilding(item.BuildingID)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete building"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Building"
      >
        <AddBuildingForm
          onSubmit={handleSubmitBuilding}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBuilding(null);
        }}
        title="Edit Building"
      >
        <AddBuildingForm
          initialData={editingBuilding}
          isEdit={true}
          onSubmit={handleUpdateBuilding}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingBuilding(null);
          }}
        />
      </Modal>
    </div>
  );
} 