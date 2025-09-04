import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import DefaultLayout from '../../layout/DefaultLayout';
import DynamicDataGrid, { DynamicColumn, GridData, GridParams } from '../../components/data-grid/DynamicDataGrid';
import { useGridSettings } from '../../hooks/useGridSettings';
import DynamicFormModal, { FormField } from '../../modals/DynamicFormModal';
import toast from 'react-hot-toast';

// Mock data
const generateMockUsers = (page: number, pageSize: number, sortField?: string, sortDirection?: string, searchTerm?: string) => {
  const allUsers = Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['Admin', 'User', 'Manager'][i % 3],
    status: ['Active', 'Inactive'][i % 2],
    createdAt: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    lastLogin: new Date(2024, 5, (i % 30) + 1).toISOString().split('T')[0],
  }));

  let filteredUsers = allUsers;
  
  // Apply search filter
  if (searchTerm) {
    filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply sorting
  if (sortField && sortDirection) {
    filteredUsers.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Apply pagination
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    rows: paginatedUsers,
    totalCount: filteredUsers.length,
  };
};

const Users: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({ rows: [], totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Define columns for the users table
  const columns: DynamicColumn[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      flex: 0.5,
      type: 'number',
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1.5,
      type: 'string',
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 2,
      type: 'string',
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      flex: 1,
      type: 'string',
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      type: 'string',
      renderCell: (params) => (
        <Box
          sx={{
            borderRadius: 1,
            // backgroundColor: params.value === 'Active' ? '#e8f5e8' : '#ffeaa7',
            color: params.value === 'Active' ? '#2e7d32' : '#f57f17',
            fontWeight: 'bold',
            fontSize: '0.75rem',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      flex: 1,
      type: 'date',
      valueFormatter: (value) => new Date(value).toLocaleDateString(),  
    },
    // { 
    //   field: 'lastLogin', 
    //   headerName: 'Last Login', 
    //   flex: 1,
    //   type: 'date',
    //   valueFormatter: (value) => new Date(value).toLocaleDateString(),  
    // },
  ];

  // Define form fields for add/edit modal
  // const formFields: FormField[] = [
  //   {
  //     field: 'name',
  //     label: 'Name',
  //     type: 'text',
  //     required: true,
  //   },
  //   {
  //     field: 'email',
  //     label: 'Email',
  //     type: 'email',
  //     required: true,
  //     validation: (value) => {
  //       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //       return emailRegex.test(value) ? null : 'Invalid email format';
  //     },
  //   },
  //   {
  //     field: 'role',
  //     label: 'Role',
  //     type: 'select',
  //     required: true,
  //     options: [
  //       { value: 'Admin', label: 'Admin' },
  //       { value: 'User', label: 'User' },
  //       { value: 'Manager', label: 'Manager' },
  //     ],
  //   },
  //   {
  //     field: 'status',
  //     label: 'Status',
  //     type: 'select',
  //     required: true,
  //     options: [
  //       { value: 'Active', label: 'Active' },
  //       { value: 'Inactive', label: 'Inactive' },
  //     ],
  //   },
  // ];

  // Load data based on current parameters
  const loadData = useCallback(async (params: GridParams) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const sortField = params.sortModel[0]?.field;
    const sortDirection = params.sortModel[0]?.sort ?? undefined;
    const searchTerm = params.quickFilterValue;
    
    const data = generateMockUsers(
      params.page, 
      params.pageSize, 
      sortField, 
      sortDirection, 
      searchTerm
    );
    
    setGridData(data);
    setLoading(false);
  }, []);

  // Load initial data
  useEffect(() => {
    loadData(currentParams);
  }, []);

    const { currentParams, handleParamsChange } = useGridSettings('users', 10, loadData);



  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditingUser(row);
    setModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      toast.success(`User ${id} deleted successfully`);
      // Reload data after delete
      loadData(currentParams);
    }
  };

  const handleFormSubmit = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (editingUser) {
      toast.success('User updated successfully');
    } else {
      toast.success('User created successfully');
    }
    
    // Reload data after submit
    loadData(currentParams);
  };

  return (
    <DefaultLayout>
      <Box>
        <DynamicDataGrid
          id="users"
          title="Users Management"
          columns={columns}
          data={gridData}
          loading={loading}
          onParamsChange={handleParamsChange}
          // onAdd={handleAdd}
          // onEdit={handleEdit}
          // onDelete={handleDelete}
        />

        {/* <DynamicFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingUser ? 'Edit User' : 'Add New User'}
          fields={formFields}
          initialData={editingUser}
          onSubmit={handleFormSubmit}
          isLoading={false}
        /> */}
      </Box>
    </DefaultLayout>
  );
};

export default Users;