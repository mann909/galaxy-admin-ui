import React, { useState, useEffect } from "react";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { useGridSettings } from "../../hooks/useGridSettings";
import DefaultLayout from "../../layout/DefaultLayout";
import DynamicDataGrid, {
  DynamicColumn,
  GridData,
  GridParams,
} from "../../components/data-grid/DynamicDataGrid";
import OfferFormModal from "../../modals/OfferFormModal";
import toast from "react-hot-toast";
import {
  useOffersApi,
  useCreateOfferApi,
  useUpdateOfferApi,
  useDeleteOfferApi,
} from "../../api/api-hooks/useOfferApi";
import { Offer, CreateOfferRequest } from "./interface";

const Offers: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({ rows: [], totalCount: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const { currentParams, handleParamsChange } = useGridSettings('offers', 10);

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

  const { data: offersData, isLoading } = useOffersApi(apiParams);
  const {
    mutate: createOffer,
    isSuccess: createOfferSuccess,
    isError: createOfferError,
    isPending: createOfferPending,
    error: createOfferErrorMessage,
  } = useCreateOfferApi();
  const {
    mutate: updateOffer,
    isSuccess: updateOfferSuccess,
    isError: updateOfferError,
    isPending: updateOfferPending,
    error: updateOfferErrorMessage,
  } = useUpdateOfferApi();
  const {
    mutate: deleteOffer,
    isSuccess: deleteOfferSuccess,
    isError: deleteOfferError,
    isPending: deleteOfferPending,
    error: deleteOfferErrorMessage,
  } = useDeleteOfferApi();

  // Update grid data when API data changes
  useEffect(() => {
    if (offersData) {
      setGridData({
        rows: offersData.docs || [],
        totalCount: offersData.totalCount || 0,
      });
    }
  }, [offersData]);

  useEffect(() => {
    if (createOfferSuccess) {
      toast.success("Offer created successfully");
      setModalOpen(false);
    }
    if (createOfferError) {
      toast.error("Failed to create offer");
    }
  }, [createOfferSuccess, createOfferError]);

  useEffect(() => {
    if (updateOfferSuccess) {
      toast.success("Offer updated successfully");
      setModalOpen(false);
    }
    if (updateOfferError) {
      toast.error("Failed to update offer");
    }
  }, [updateOfferSuccess, updateOfferError]);

  useEffect(() => {
    if (deleteOfferSuccess) {
      toast.success("Offer deleted successfully");
    }
    if (deleteOfferError) {
      toast.error("Failed to delete offer");
    }
  }, [deleteOfferSuccess, deleteOfferError]);

  const getDiscountLabel = (offer: Offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.value}% OFF`;
    } else if (offer.discountType === 'amount') {
      return `₹${offer.value} OFF`;
    }
    return "No Discount";
  };

  const getDiscountColor = (offer: Offer) => {
    if (offer.discountType === 'percentage') {
      return offer.value && offer.value >= 50 ? "error" : "warning";
    } else if (offer.discountType === 'amount') {
      return offer.value && offer.value >= 1000 ? "error" : "warning";
    }
    return "default";
  };

  const columns: DynamicColumn[] = [
    {
      field: "offerName",
      headerName: "Offer Name",
      width: 200,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={params.value || "No name provided"}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "Unnamed Offer"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "couponCode",
      headerName: "Coupon Code",
      width: 150,
      type: "string",
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="primary"
          size="small"
          sx={{ fontFamily: "monospace", fontWeight: 600 }}
        />
      ),
    },
    {
      field: "discountType",
      headerName: "Discount",
      width: 130,
      type: "string",
      renderCell: (params) => (
        <Chip
          label={getDiscountLabel(params.row)}
          color={getDiscountColor(params.row) as any}
          size="small"
        />
      ),
    },
    {
      field: "discountedItemsType",
      headerName: "Applies To",
      width: 130,
      type: "string",
      renderCell: (params) => (
        <Chip
          label={params.value === 'allItems' ? 'All Items' : 'Cart Total'}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: "minCartValue",
      headerName: "Min Cart Value",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `₹${params.value}` : "No minimum"}
        </Typography>
      ),
    },
    {
      field: "uptoAmountLimit",
      headerName: "Max Discount",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `₹${params.value}` : "No limit"}
        </Typography>
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 100,
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
      field: "startDateTime",
      headerName: "Start Date",
      width: 130,
      type: "date",
      valueGetter: (value) => value ? new Date(value) : null,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : "No start date"}
        </Typography>
      ),
    },
    {
      field: "expiryDateTime",
      headerName: "Expiry Date",
      width: 130,
      type: "date",
      valueGetter: (value) => value ? new Date(value) : null,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2">No expiry</Typography>;
        const isExpired = new Date(params.value) < new Date();
        return (
          <Typography 
            variant="body2" 
            sx={{ color: isExpired ? "#dc2626" : "#16a34a" }}
          >
            {new Date(params.value).toLocaleDateString()}
          </Typography>
        );
      },
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
  ];


  const handleAdd = () => {
    setEditingOffer(null);
    setModalOpen(true);
  };

  const handleEdit = (row: Offer) => {
    setEditingOffer(row);
    setModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      deleteOffer(id as string);
    }
  };

  const handleFormSubmit = async (data: CreateOfferRequest) => {
    if (editingOffer) {
      const updateData = {
        id: editingOffer._id,
        ...data,
      };
      updateOffer(updateData);
    } else {
      createOffer(data);
    }
  };

  return (
    <DefaultLayout>
      <Box>
        <DynamicDataGrid
          id="offers"
          title="Offers Management"
          columns={columns}
          data={gridData}
          loading={isLoading}
          onParamsChange={handleParamsChange}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {modalOpen && <OfferFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingOffer ? "Edit Offer" : "Add New Offer"}
          initialData={editingOffer}
          onSubmit={handleFormSubmit}
          isSuccess={createOfferSuccess || updateOfferSuccess}
          isError={createOfferError || updateOfferError}
        />}
      </Box>
    </DefaultLayout>
  );
};

export default Offers;