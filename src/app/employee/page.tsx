"use client";
import Navigation from "@/components/Navigation";
import { Table, TableCard } from "@/components/base/table/table";
import { Modal } from "@/components/base/modal/modal";
import { AddEmployeeForm } from "@/components/forms/AddEmployeeForm";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";

const columns = [
    { id: "EmployeeID", key: "EmployeeID", label: "Employee ID" },
    { id: "FirstName", key: "FirstName", label: "First Name" },
    { id: "LastName", key: "LastName", label: "Last Name" },
    { id: "Email", key: "Email", label: "Email" },
    { id: "PhoneNumber", key: "PhoneNumber", label: "Phone Number" },
    { id: "JobTitle", key: "JobTitle", label: "Job Title" },
    { id: "Nationality", key: "Nationality", label: "Nationality" },
    { id: "Salary", key: "Salary", label: "Salary" },
    { id: "Discount", key: "Discount", label: "Discount" },
    { id: "Net Salary", key: "Net Salary", label: "Net Salary" },
    { id: "actions", key: "actions", label: "Actions" },
];

export default function EmployeePage() {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch employees from API
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/employee');
                if (!response.ok) {
                    throw new Error('Failed to fetch employees');
                }
                const data = await response.json();
                setEmployees(data);
            } catch (err) {
                console.error('Error fetching employees:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch employees');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
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

    const handleAddEmployee = () => {
        setIsModalOpen(true);
    };

    const handleEditEmployee = (employee: any) => {
        setEditingEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleDeleteEmployee = async (employeeID: number) => {
        if (confirm("Are you sure you want to delete this employee?")) {
            try {
                const response = await fetch(`/api/employee?EmployeeID=${employeeID}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete employee');
                }

                setEmployees(prev => prev.filter(employee => employee.EmployeeID !== employeeID));
            } catch (error) {
                console.error("Error deleting employee:", error);
                alert('Failed to delete employee. Please try again.');
            }
        }
    };

    const handleSubmitEmployee = async (formData: any) => {
        try {
            const response = await fetch('/api/employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create employee');
            }

            const newEmployee = await response.json();
            setEmployees(prev => [...prev, newEmployee]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating employee:', error);
            alert('Failed to create employee. Please try again.');
        }
    };

    const handleUpdateEmployee = async (formData: any) => {
        try {
            const response = await fetch('/api/employee', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, EmployeeID: editingEmployee.EmployeeID }),
            });

            if (!response.ok) {
                throw new Error('Failed to update employee');
            }

            const updatedEmployee = await response.json();
            setEmployees(prev => prev.map(employee =>
                employee.EmployeeID === editingEmployee.EmployeeID
                    ? updatedEmployee
                    : employee
            ));
            setIsEditModalOpen(false);
            setEditingEmployee(null);
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee. Please try again.');
        }
    };

    const handleCancelEmployee = () => {
        setIsModalOpen(false);
    };

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditingEmployee(null);
    };

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return employees;
        return [...employees].sort((a, b) => {
            const aValue = a[sortColumn as keyof typeof a];
            const bValue = b[sortColumn as keyof typeof b];
            
            if (aValue < bValue) return sortDirection === "ascending" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "ascending" ? 1 : -1;
            return 0;
        });
    }, [sortColumn, sortDirection, employees]);

    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="p-6">
                <TableCard.Root>
                    <TableCard.Header
                        title="Employee Management"
                        description="Manage camp employees and their information"
                        badge={employees.length}
                        contentTrailing={
                            <button
                                onClick={handleAddEmployee}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
                            >
                                <Plus className="h-4 w-4" />
                                Add Employee
                            </button>
                        }
                    />
                                         <div className="p-6">
                         {loading && (
                             <div className="text-center py-8">
                                 <div className="text-gray-400">Loading employees...</div>
                             </div>
                         )}
                         
                         {error && (
                             <div className="text-center py-8">
                                 <div className="text-red-400">Error: {error}</div>
                                 <button 
                                     onClick={() => window.location.reload()} 
                                     className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                 >
                                     Retry
                                 </button>
                             </div>
                         )}
                         
                         {!loading && !error && (
                             <Table aria-label="Employee table">
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
                                        <Table.Row key={item.EmployeeID || item.id}>
                                        <Table.Cell>{item.EmployeeID || ''}</Table.Cell>
                                        <Table.Cell>{item.FirstName || ''}</Table.Cell>
                                        <Table.Cell>{item.LastName || ''}</Table.Cell>
                                        <Table.Cell>{item.Email || ''}</Table.Cell>
                                        <Table.Cell>{item.PhoneNumber || ''}</Table.Cell>
                                        <Table.Cell>{item.JobTitle || ''}</Table.Cell>
                                        <Table.Cell>{item.Nationality || ''}</Table.Cell>
                                        <Table.Cell>${(item.Salary || 0).toLocaleString()}</Table.Cell>
                                        <Table.Cell>{item.Discount || 0}</Table.Cell>
                                        <Table.Cell>${(item['Net Salary'] || 0).toLocaleString()}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditEmployee(item)}
                                                    className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                                                    title="Edit employee"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(item.EmployeeID)}
                                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete employee"
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
                         )}
                     </div>
                </TableCard.Root>

                {/* Add Employee Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancelEmployee}
                    title="Add New Employee"
                    size="lg"
                >
                    <AddEmployeeForm
                        onSubmit={handleSubmitEmployee}
                        onCancel={handleCancelEmployee}
                    />
                </Modal>

                {/* Edit Employee Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleCancelEdit}
                    title="Edit Employee"
                    size="lg"
                >
                    <AddEmployeeForm
                        onSubmit={handleUpdateEmployee}
                        onCancel={handleCancelEdit}
                        initialData={editingEmployee}
                        isEdit={true}
                    />
                </Modal>
            </main>
        </div>
    );
} 