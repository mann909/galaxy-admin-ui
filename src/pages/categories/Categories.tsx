import React, { useState, useEffect } from "react";
import { Box, Chip, Tooltip, Typography, Avatar } from "@mui/material";
import { useGridSettings } from "../../hooks/useGridSettings";
import DefaultLayout from "../../layout/DefaultLayout";
import DynamicDataGrid, {
  DynamicColumn,
  GridData,
  GridParams,
} from "../../components/data-grid/DynamicDataGrid";
import CategoryFormModal from "../../modals/CategoryFormModal";
import toast from "react-hot-toast";
import {
  useCategoriesApi,
  useCreateCategoryApi,
  useUpdateCategoryApi,
  useDeleteCategoryApi,
} from "../../api/api-hooks/useCategoryApi";
import { Category, CreateCategoryRequest } from "./interface";

const Categories: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({ rows: [], totalCount: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { currentParams, handleParamsChange } = useGridSettings('categories', 10);

    const columns: DynamicColumn[] = [
    {
      field: "name",
      headerName: "Category Name",
      width: 200,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "slug",
      headerName: "Slug",
      width: 150,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={params.value || "No description"}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "No description"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "parent",
      headerName: "Parent Category",
      width: 150,
      type: "string",
      valueGetter: (_, row) => row.parent?.name || "Root Category",
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "level",
      headerName: "Level",
      width: 100,
      type: "number",
      renderCell: (params) => (
        <Chip
          label={`L${params.value}`}
          color={params.value === 1 ? "primary" : params.value === 2 ? "secondary" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "image",
      headerName: "Image",
      width: 100,
      type: "string",
      renderCell: (params) => (
        params.value ? (
          <Avatar
            src={params.value}
            alt={params.row.name}
            sx={{ width: 40, height: 40, borderRadius: 1 }}
          />
        ) : (
          // <Avatar sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: "#e2e8f0" }}>
          //   {params.row.name?.[0]?.toUpperCase() || "?"}
          // </Avatar>
          <Typography variant="body2" sx={{ color: "#6c757d" }}>
            No Image
          </Typography>
        )
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      type: "boolean",
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "displayOrder",
      headerName: "Display Order",
      width: 130,
      type: "number",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 130,
      type: "date",
      valueGetter: (value) => new Date(value),
      renderCell: (params) => (
        <Tooltip title={`Created: ${new Date(params.value).toLocaleString()}`}>
          <Typography variant="body2">{new Date(params.value).toLocaleDateString()}</Typography>
        </Tooltip>
      ),
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 130,
      type: "date",
      valueGetter: (value) => new Date(value),
      renderCell: (params) => (
        <Tooltip title={`Last updated: ${new Date(params.value).toLocaleString()}`}>
          <Typography variant="body2">{new Date(params.value).toLocaleDateString()}</Typography>
        </Tooltip>
      ),
    },
  ];

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
    sortBy: currentParams.sortModel[0]?.field,
    sortOrder:
      currentParams.sortModel[0]?.sort === "asc"
        ? ("asc" as const)
        : currentParams.sortModel[0]?.sort === "desc"
        ? ("desc" as const)
        : undefined,
  };

  const { data: categoriesData, isLoading } = useCategoriesApi(apiParams);
  const {
    mutate: createCategory,
    isSuccess: createCategorySuccess,
    isError: createCategoryError,
    isPending: createCategoryPending,
    error: createCategoryErrorMessage,
  } = useCreateCategoryApi();
  const {
    mutate: updateCategory,
    isSuccess: updateCategorySuccess,
    isError: updateCategoryError,
    isPending: updateCategoryPending,
    error: updateCategoryErrorMessage,
  } = useUpdateCategoryApi();
  const {
    mutate: deleteCategory,
    isSuccess: deleteCategorySuccess,
    isError: deleteCategoryError,
    isPending: deleteCategoryPending,
    error: deleteCategoryErrorMessage,
  } = useDeleteCategoryApi();

  // Update grid data when API data changes
  useEffect(() => {
    if (categoriesData) {
      setGridData({
        rows: categoriesData.docs || [],
        totalCount: categoriesData.totalCount || 0,
      });
    }
  }, [categoriesData]);

  useEffect(() => {
    if (createCategorySuccess) {
      toast.success("Category created successfully");
      setModalOpen(false);
    }
    if (createCategoryError) {
      toast.error("Failed to create category");
    }
  }, [createCategorySuccess, createCategoryError]);

  useEffect(() => {
    if (updateCategorySuccess) {
      toast.success("Category updated successfully");
      setModalOpen(false);
    }
    if (updateCategoryError) {
      toast.error("Failed to update category");
    }
  }, [updateCategorySuccess, updateCategoryError]);

  useEffect(() => {
    if (deleteCategorySuccess) {
      toast.success("Category deleted successfully");
    }
    if (deleteCategoryError) {
      toast.error("Failed to delete category");
    }
  }, [deleteCategorySuccess, deleteCategoryError]);


  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (row: Category) => {
    setEditingCategory(row);
    setModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategory(id as string);
    }
  };

  const handleFormSubmit = async (data: CreateCategoryRequest) => {
    if (editingCategory) {
      const updateData = {
        id: editingCategory._id,
        ...data,
      };
      updateCategory(updateData);
    } else {
      createCategory(data);
    }
  };

  return (
    <DefaultLayout>
      <Box>
        <DynamicDataGrid
          id="categories"
          title="Category Management"
          columns={columns}
          data={gridData}
          loading={isLoading}
          onParamsChange={handleParamsChange}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {modalOpen && <CategoryFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? "Edit Category" : "Add New Category"}
          initialData={editingCategory}
          onSubmit={handleFormSubmit}
          isSuccess={createCategorySuccess || updateCategorySuccess}
          isError={createCategoryError || updateCategoryError}
        />}
      </Box>
    </DefaultLayout>
  );
};

export default Categories;