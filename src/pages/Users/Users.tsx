import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import DefaultLayout from "../../layout/DefaultLayout";
import DynamicDataGrid, {
  DynamicColumn,
  GridData,
  GridParams,
} from "../../components/data-grid/DynamicDataGrid";
import { useGridSettings } from "../../hooks/useGridSettings";
import { useUsersApi } from "../../api/api-hooks/useUserApi";
// import DynamicFormModal, { FormField } from '../../modals/DynamicFormModal';
// import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({ rows: [], totalCount: 0 });
  const [loading, setLoading] = useState(false);
  // const [modalOpen, setModalOpen] = useState(false);
  // const [editingUser, setEditingUser] = useState<any>(null);

  // Define columns for the users table
  const columns: DynamicColumn[] = [
    {
      field: "_id",
      headerName: "ID",
      flex: 0.5,
      type: "number",
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1.5,
      type: "string",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 2,
      type: "string",
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      flex: 2,
      type: "string",
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      type: "string",
    },
    {
      field: "isActive",
      headerName: "is Active?",
      flex: 1,
      type: "string",
      renderCell: (params) => (
        <Box
          sx={{
            borderRadius: 1,
            // backgroundColor: params.value ? '#e8f5e8' : '#ffeaa7',
            color: params.value ? "#2e7d32" : "#f57f17",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
          {params.value ? "Active" : "Inactive"}
        </Box>
      ),
    },
    {
      field: "isVerified",
      headerName: "is Verified?",
      flex: 1,
      type: "string",
      renderCell: (params) => (
        <Box
          sx={{
            borderRadius: 1,
            // backgroundColor: params.value ? '#e8f5e8' : '#ffeaa7',
            color: params.value ? "#2e7d32" : "#f57f17",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
          {params.value ? "Verified" : "Unverified"}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      type: "date",
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      flex: 1,
      type: "date",
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
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
  // const loadData = useCallback(async (params: GridParams) => {
  //   setLoading(true);

  //   // Simulate API delay
  //   // await new Promise(resolve => setTimeout(resolve, 500));

  //   const sortField = params.sortModel[0]?.field;
  //   const sortDirection = params.sortModel[0]?.sort ?? undefined;
  //   const searchTerm = params.quickFilterValue;

  //   // const data = generateMockUsers(
  //   //   params.page,
  //   //   params.pageSize,
  //   //   sortField,
  //   //   sortDirection,
  //   //   searchTerm
  //   // );

  //   setGridData(data);
  //   setLoading(false);
  // }, []);

  // Load initial data
  // useEffect(() => {
  //   loadData(currentParams);
  // }, []);

  const { currentParams, handleParamsChange } = useGridSettings("users", 10);

  // API hooks
  const apiParams = {
    page: currentParams.page + 1,
    limit: currentParams.pageSize,
    filters: currentParams.filterModel.items.map((item) => {
      return {
        field: item.field,
        operator: item.operator,
        type: columns.filter((i) => i.field === item.field)[0]?.type,
        value: item.value,
      };
    }),
    // filters:{
    //   field:
    // },
    sortBy: currentParams.sortModel[0]?.field,
    sortOrder:
      currentParams.sortModel[0]?.sort === "asc"
        ? ("asc" as const)
        : currentParams.sortModel[0]?.sort === "desc"
        ? ("desc" as const)
        : undefined,
  };

  const { data: usersData, isLoading } = useUsersApi(apiParams);

  useEffect(() => {
    if (usersData) {
      setGridData({
        rows: usersData.docs || [],
        totalCount: usersData.totalCount || 0,
      });
    }
  }, [usersData]);

  // const handleAdd = () => {
  //   setEditingUser(null);
  //   setModalOpen(true);
  // };

  // const handleEdit = (row: any) => {
  //   setEditingUser(row);
  //   setModalOpen(true);
  // };

  // const handleDelete = async (id: string | number) => {
  //   if (confirm('Are you sure you want to delete this user?')) {
  //     toast.success(`User ${id} deleted successfully`);
  //     // Reload data after delete
  //     loadData(currentParams);
  //   }
  // };

  // const handleFormSubmit = async () => {
  //   // Simulate API call
  //   await new Promise(resolve => setTimeout(resolve, 1000));

  //   if (editingUser) {
  //     toast.success('User updated successfully');
  //   } else {
  //     toast.success('User created successfully');
  //   }

  //   // Reload data after submit
  //   loadData(currentParams);
  // };

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
