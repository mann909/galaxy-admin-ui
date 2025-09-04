import React, { useState, useEffect } from "react";
import { Box, Chip, Tooltip, Typography, Avatar } from "@mui/material";
import { useGridSettings } from "../../hooks/useGridSettings";
import DefaultLayout from "../../layout/DefaultLayout";
import DynamicDataGrid, {
  DynamicColumn,
  GridData,
  GridParams,
} from "../../components/data-grid/DynamicDataGrid";
import BannerFormModal from "../../modals/BannerFormModal";
import toast from "react-hot-toast";
import {
  useBannersApi,
  useCreateBannerApi,
  useUpdateBannerApi,
  useDeleteBannerApi,
} from "../../api/api-hooks/useBannerApi";
import { Banner, CreateBannerRequest, UpdateBannerRequest } from "./interface";

const Banners: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({ rows: [], totalCount: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { currentParams, handleParamsChange } = useGridSettings('banners', 10);

  // API hooks
  const apiParams = {
    page: currentParams.page + 1,
    limit: currentParams.pageSize,
    filters: currentParams.filterModel.items.reduce((acc: any, item) => {
      acc[item.field] = item.value;
      return acc;
    }, {}),
    sortBy: currentParams.sortModel[0]?.field,
    sortOrder:
      currentParams.sortModel[0]?.sort === "asc"
        ? ("asc" as const)
        : currentParams.sortModel[0]?.sort === "desc"
        ? ("desc" as const)
        : undefined,
  };

  const { data: bannersData, isLoading } = useBannersApi(apiParams);
  const {
    mutate: createBanner,
    isSuccess: createBannerSuccess,
    isError: createBannerError,
    isPending: createBannerPending,
    error: createBannerErrorMessage,
  } = useCreateBannerApi();
  const {
    mutate: updateBanner,
    isSuccess: updateBannerSuccess,
    isError: updateBannerError,
    isPending: updateBannerPending,
    error: updateBannerErrorMessage,
  } = useUpdateBannerApi();
  const {
    mutate: deleteBanner,
    isSuccess: deleteBannerSuccess,
    isError: deleteBannerError,
    isPending: deleteBannerPending,
    error: deleteBannerErrorMessage,
  } = useDeleteBannerApi();

  // Update grid data when API data changes
  useEffect(() => {
    if (bannersData) {
      setGridData({
        rows: bannersData.docs || [],
        totalCount: bannersData.totalCount || 0,
      });
    }
  }, [bannersData]);

  useEffect(() => {
    if (createBannerSuccess) {
      toast.success("Banner created successfully");
      setModalOpen(false);
    }
    if (createBannerError) {
      toast.error("Failed to create banner");
    }
  }, [createBannerSuccess, createBannerError]);

  useEffect(() => {
    if (updateBannerSuccess) {
      toast.success("Banner updated successfully");
      setModalOpen(false);
    }
    if (updateBannerError) {
      toast.error("Failed to update banner");
    }
  }, [updateBannerSuccess, updateBannerError]);

  useEffect(() => {
    if (deleteBannerSuccess) {
      toast.success("Banner deleted successfully");
    }
    if (deleteBannerError) {
      toast.error("Failed to delete banner");
    }
  }, [deleteBannerSuccess, deleteBannerError]);

  const columns: DynamicColumn[] = [
    {
      field: "bannerImages",
      headerName: "Images",
      width: 150,
      type: "string",
      renderCell: (params) => {
        const images = params.row.bannerImages || [];
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {images.slice(0, 3).map((image: string, index: number) => (
              <Avatar
                key={index}
                src={image}
                alt={`Banner ${index + 1}`}
                sx={{ width: 32, height: 32, borderRadius: 1 }}
              />
            ))}
            {images.length > 3 && (
              <Chip 
                label={`+${images.length - 3}`} 
                size="small" 
                sx={{ height: 32, borderRadius: 1 }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: "imageCount",
      headerName: "Total Images",
      width: 120,
      type: "number",
      valueGetter: (_, row) => row.bannerImages?.length || 0,
      renderCell: (params) => (
        <Tooltip title={`Total banner images: ${params.value}`}>
          <Chip
            label={params.value}
            color={params.value > 0 ? "success" : "default"}
            size="small"
          />
        </Tooltip>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
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
      width: 150,
      type: "date",
      valueGetter: (value) => new Date(value),
      renderCell: (params) => (
        <Tooltip title={`Last updated: ${new Date(params.value).toLocaleString()}`}>
          <Typography variant="body2">{new Date(params.value).toLocaleDateString()}</Typography>
        </Tooltip>
      ),
    },
  ];


  const handleAdd = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const handleEdit = (row: Banner) => {
    setEditingBanner(row);
    setModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteBanner(id as string);
    }
  };

  const handleFormSubmit = async (data: CreateBannerRequest) => {
    if (editingBanner) {
      const updateData: UpdateBannerRequest = {
        _id: editingBanner._id,
        ...data,
      };
      updateBanner(updateData);
    } else {
      createBanner(data);
    }
  };

  return (
    <DefaultLayout>
      <Box>
        <DynamicDataGrid
          id="banners"
          title="Banner Management"
          columns={columns}
          data={gridData}
          loading={isLoading}
          onParamsChange={handleParamsChange}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <BannerFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingBanner ? "Edit Banner" : "Add New Banner"}
          initialData={editingBanner}
          onSubmit={handleFormSubmit}
          isSuccess={createBannerSuccess || updateBannerSuccess}
          isError={createBannerError || updateBannerError}
        />
      </Box>
    </DefaultLayout>
  );
};

export default Banners;