"use client";
import Navigation from "@/components/Navigation";
import { Table, TableCard } from "@/components/base/table/table";
import { Modal } from "@/components/base/modal/modal";
import { AddBookingForm } from "@/components/forms/AddBookingForm";
import { useState, useMemo, useEffect } from "react";
import { Edit, Trash } from "lucide-react";

interface Booking {
  BookingID: number;
  RoomID: number;
  EmployeeID: number;
  StartDate: string;
  EndDate: string;
  Active: boolean;
  Finished: boolean;
}

const columns = [
  { id: "BookingID", key: "BookingID", label: "Booking ID" },
  { id: "RoomID", key: "RoomID", label: "Room" },
  { id: "EmployeeID", key: "EmployeeID", label: "Employee" },
  { id: "StartDate", key: "StartDate", label: "Start Date" },
  { id: "EndDate", key: "EndDate", label: "End Date" },
  { id: "Active", key: "Active", label: "Active" },
  { id: "Finished", key: "Finished", label: "Finished" },
  { id: "actions", key: "actions", label: "Actions" },
];

type SortDirection = "ascending" | "descending";

export default function BookingPage() {
  const [sortColumn, setSortColumn] = useState<string>("BookingID");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsResponse, employeesResponse, roomsResponse] = await Promise.all([
          fetch('/api/booking'),
          fetch('/api/employee'),
          fetch('/api/room')
        ]);

        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch bookings');
        }
        if (!employeesResponse.ok) {
          throw new Error('Failed to fetch employees');
        }
        if (!roomsResponse.ok) {
          throw new Error('Failed to fetch rooms');
        }

        const [bookingsData, employeesData, roomsData] = await Promise.all([
          bookingsResponse.json(),
          employeesResponse.json(),
          roomsResponse.json()
        ]);

        setBookings(bookingsData);
        setEmployees(employeesData);
        setRooms(roomsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "ascending" ? "descending" : "ascending");
    } else {
      setSortColumn(columnKey);
      setSortDirection("ascending");
    }
  };

  const handleAddBooking = () => setIsModalOpen(true);

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleDeleteBooking = async (bookingID: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      const response = await fetch(`/api/booking?BookingID=${bookingID}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete booking: ${response.status} ${response.statusText}`);
      }

      setBookings(prev => prev.filter(booking => booking.BookingID !== bookingID));
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert(`Failed to delete booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmitBooking = async (formData: Partial<Booking>) => {
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create booking: ${response.status} ${response.statusText}${errorData.details ? ` - ${errorData.details}` : ''}`);
      }

      const newBooking = await response.json();
      setBookings(prev => [...prev, newBooking]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateBooking = async (formData: Partial<Booking>) => {
    if (!editingBooking) return;
    
    try {
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, BookingID: editingBooking.BookingID }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update booking: ${response.status} ${response.statusText}`);
      }

      const updatedBooking = await response.json();
      setBookings(prev => prev.map(booking =>
        booking.BookingID === editingBooking.BookingID ? updatedBooking : booking
      ));
      setIsEditModalOpen(false);
      setEditingBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(`Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return bookings;
    
    return [...bookings].sort((a, b) => {
      const aValue = a[sortColumn as keyof Booking];
      const bValue = b[sortColumn as keyof Booking];

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
  }, [sortColumn, sortDirection, bookings]);

  // Helper functions to get employee and room names
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.EmployeeID === employeeId);
    return employee ? `${employee.FirstName} ${employee.LastName}` : `Employee ${employeeId}`;
  };

  const getRoomInfo = (roomId: number) => {
    const room = rooms.find(r => r.RoomID === roomId);
    return room ? `Room ${room.RoomNumber} (Building ${room.BuildingID})` : `Room ${roomId}`;
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="p-6">
        <TableCard.Root>
          <TableCard.Header 
            title="Bookings"
            description="Manage all bookings in the system"
            contentTrailing={
              <button
                onClick={handleAddBooking}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Add Booking
              </button>
            }
          />
          
          <div className="p-6">
            {loading && (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading...</div>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <div className="text-red-400">Error: {error}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}
            
            {!loading && !error && (
              <Table aria-label="Booking table">
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
                            <span className="text-blue-400">
                              {sortDirection === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      )}
                    </Table.Head>
                  ))}
                </Table.Header>
                <Table.Body>
                  {sortedData.map((item, index) => (
                    <Table.Row key={item.BookingID || `booking-${index}`}>
                      <Table.Cell>{item.BookingID}</Table.Cell>
                      <Table.Cell>{getRoomInfo(item.RoomID)}</Table.Cell>
                      <Table.Cell>{getEmployeeName(item.EmployeeID)}</Table.Cell>
                      <Table.Cell>{item.StartDate ? new Date(item.StartDate).toLocaleDateString() : ''}</Table.Cell>
                      <Table.Cell>{item.EndDate ? new Date(item.EndDate).toLocaleDateString() : ''}</Table.Cell>
                      <Table.Cell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.Active 
                            ? "bg-green-900 text-green-300" 
                            : "bg-red-900 text-red-300"
                        }`}>
                          {item.Active ? "Active" : "Inactive"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {(() => {
                          const now = new Date();
                          const startDate = new Date(item.StartDate);
                          const endDate = new Date(item.EndDate);
                          
                          if (item.Finished) {
                            return (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-900 text-blue-300">
                                Finished
                              </span>
                            );
                          } else if (item.Active && now >= startDate && now <= endDate) {
                            return (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-900 text-green-300">
                                Ongoing
                              </span>
                            );
                          } else if (item.Active && now < startDate) {
                            return (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-900 text-yellow-300">
                                Upcoming
                              </span>
                            );
                          } else if (item.Active && now > endDate) {
                            return (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-900 text-orange-300">
                                Overdue
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-900 text-gray-300">
                                Inactive
                              </span>
                            );
                          }
                        })()}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBooking(item)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit booking"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(item.BookingID)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete booking"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </div>
        </TableCard.Root>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Booking"
          size="lg"
        >
          <AddBookingForm
            onSubmit={handleSubmitBooking}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBooking(null);
          }}
          title="Edit Booking"
          size="lg"
        >
          <AddBookingForm
            onSubmit={handleUpdateBooking}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingBooking(null);
            }}
            initialData={editingBooking}
            isEdit={true}
          />
        </Modal>
      </main>
    </div>
  );
} 