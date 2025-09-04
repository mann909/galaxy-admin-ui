import React, { useState, useEffect } from "react";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { useGridSettings } from "../../hooks/useGridSettings";
import DefaultLayout from "../../layout/DefaultLayout";
import DynamicDataGrid, {
  DynamicColumn,
  GridData,
  GridParams,
} from "../../components/data-grid/DynamicDataGrid";
import ProductFormModal from "../../modals/ProductFormModal";
import toast from "react-hot-toast";
import {
  useProductsApi,
  useCreateProductApi,
  useUpdateProductApi,
  useDeleteProductApi,
} from "../../api/api-hooks/useProductApi";
import { useCategoriesApi } from "../../api/api-hooks/useCategoryApi";
import { Product, CreateProductRequest, UpdateProductRequest } from "./interface";

const Products: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({ rows: [], totalCount: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { currentParams, handleParamsChange } = useGridSettings('products', 10);

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

  const { data: productsData, isLoading } = useProductsApi(apiParams);
  const {
    mutate: createProduct,
    isSuccess: createProductSuccess,
    isError: createProductError,
    isPending: createProductPending,
    error: createProductErrorMessage,
  } = useCreateProductApi();
  const {
    mutate: updateProduct,
    isSuccess: updateProductSuccess,
    isError: updateProductError,
    isPending: updateProductPending,
    error: updateProductErrorMessage,
  } = useUpdateProductApi();
  const {
    mutate: deleteProduct,
    isSuccess: deleteProductSuccess,
    isError: deleteProductError,
    isPending: deleteProductPending,
    error: deleteProductErrorMessage,
  } = useDeleteProductApi();

  // Update grid data when API data changes
  useEffect(() => {
    if (productsData) {
      setGridData({
        rows: productsData.docs || [],
        totalCount: productsData.totalCount || 0,
      });
    }
  }, [productsData]);

  useEffect(() => {
    if (createProductSuccess) {
      toast.success("Product created successfully");
      setModalOpen(false);
    }
    if (createProductError) {
      toast.error("Failed to create product");
    }
  }, [createProductSuccess, createProductError]);

  useEffect(() => {
    console.log(updateProductSuccess, updateProductError);
    if (updateProductSuccess) {
      toast.success("Product updated successfully");
      setModalOpen(false);
    }
    if (updateProductError) {
      toast.error("Failed to update product");
    }
  }, [updateProductSuccess, updateProductError]);

  useEffect(() => {
    if (deleteProductSuccess) {
      toast.success("Product deleted successfully");
    }
    if (deleteProductError) {
      toast.error("Failed to delete product");
    }
  }, [deleteProductSuccess, deleteProductError]);

  const { data: categoriesData } = useCategoriesApi({ limit: 1000 });

  const columns: DynamicColumn[] = [
    // {
    //   field: '_id',
    //   headerName: 'ID',
    //   width: 100,
    //   type: 'string',
    //   renderCell: (params) => (
    //     <Tooltip title={params.value}>
    //       <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    //         {params.value}
    //       </Box>
    //     </Tooltip>
    //   ),
    // },
    {
      field: "name",
      headerName: "Product Name",
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
      width: 300,
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
      field: "brand",
      headerName: "Brand",
      width: 120,
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
      field: "category",
      headerName: "Category",
      width: 130,
      type: "string",
      valueGetter: (_, row) => row.category?.name || "No Category",
      renderCell: (params) => (
        <Tooltip title={`${params.value} (${params.row.category?.slug || "no-slug"}))`}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "productType",
      headerName: "Type",
      width: 120,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={`Product Type: ${params.value}`}>
          <Chip label={params.value} size="small" sx={{ textTransform: "capitalize" }} />
        </Tooltip>
      ),
    },
    {
      field: "features",
      headerName: "Features",
      width: 200,
      type: "string",
      valueGetter: (_, row) => row.features?.join(", ") || "",
      renderCell: (params) => (
        <Tooltip title={`Features: ${params.value}`}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "No features"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "materials",
      headerName: "Materials",
      width: 150,
      type: "string",
      valueGetter: (_, row) => row.materials?.join(", ") || "",
      renderCell: (params) => (
        <Tooltip title={`Materials: ${params.value}`}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "No materials"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "typeSpecific",
      headerName: "Type Specific",
      width: 180,
      type: "string",
      valueGetter: (_, row) => {
        const typeSpec = row.typeSpecific;
        if (!typeSpec) return "No specifications";
        return Object.entries(typeSpec)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      },
      renderCell: (params) => {
        const typeSpec = params.row.typeSpecific;
        const tooltipContent = typeSpec
          ? Object.entries(typeSpec)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n")
          : "No specifications";
        return (
          <Tooltip title={<Box sx={{ whiteSpace: "pre-line" }}>{tooltipContent}</Box>}>
            <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {params.value}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "variants",
      headerName: "Variants Count",
      headerAlign: "left",
      align: "left",
      width: 80,
      type: "number",
      valueGetter: (_, row) => row.variants?.length || 0,
    },
    {
      field: "variantDetails",
      headerName: "Variant Details",
      width: 250,
      type: "string",
      valueGetter: (_, row) => {
        const variants = row.variants || [];
        return variants.map((v: any) => `${v.color?.name}-${v.size?.name} (${v.sku})`).join(", ");
      },
      renderCell: (params) => {
        const variants = params.row.variants || [];
        const tooltipContent = variants
          .map((v: any, idx: number) =>
            [
              `Variant #${idx + 1}`,
              `SKU: ${v.sku || "N/A"}`,
              `Size:`,
              `  • Name: ${v.size?.name || "N/A"}`,
              `  • Code: ${v.size?.code || "N/A"}`,
              `  • Capacity: ${v.size?.capacity || "N/A"}`,
              `  • Weight: ${v.size?.weight || "N/A"}`,
              `  • Dimension: ${v.size?.dimension?.length || "N/A"} x ${
                v.size?.dimension?.breadth || "N/A"
              } x ${v.size?.dimension?.height || "N/A"}`,
              `Color:`,
              `  • Name: ${v.color?.name || "N/A"}`,
              `  • Code: ${v.color?.code || "N/A"}`,
              `  • Hex: ${v.color?.hexCode || "N/A"}`,
              `  • Images: ${v.color?.images?.length ? v.color.images.join(", ") : "N/A"}`,
              `Pricing:`,
              `  • Base: ₹${v.pricing?.basePrice ?? "N/A"}`,
              `  • Sale: ₹${v.pricing?.salePrice ?? "N/A"}`,
              `  • Currency: ${v.pricing?.currency || "N/A"}`,
              `  • Cost: ₹${v.pricing?.costPrice ?? "N/A"}`,
              `  • Margin: ${v.pricing?.marginPercentage ?? "N/A"}%`,
              `Inventory:`,
              `  • Stock: ${v.inventory?.stock ?? "N/A"}`,
              `  • Low Stock: ${v.inventory?.lowStockThreshold ?? "N/A"}`,
              `  • Reserved: ${v.inventory?.reservedStock ?? "N/A"}`,
              `Active: ${v.isActive ? "✅ Yes" : "❌ No"}`,
              `Display Order: ${v.displayOrder ?? "0"}`,
            ].join("\n")
          )
          .join("\n\n" + "━".repeat(25) + "\n\n");
        return (
          <Tooltip
            title={
              <Box sx={{ whiteSpace: "pre-line", maxWidth: 800, maxHeight: 400, overflow: "auto" }}>
                {tooltipContent}
              </Box>
            }
          >
            <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {params.value || "No variants"}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "totalStock",
      headerName: "Total Stock",
      width: 120,
      type: "number",
      valueGetter: (_, row) => {
        const variants = row.variants || [];
        return variants.reduce((total: number, variant: any) => total + (variant.inventory?.stock || 0), 0);
      },
      renderCell: (params) => (
        <Tooltip title={`Total Stock across all variants: ${params.value}`}>
          <Chip
            label={params.value}
            color={params.value > 20 ? "success" : params.value > 5 ? "warning" : "error"}
            size="small"
          />
        </Tooltip>
      ),
    },
    // {
    //   field: 'priceRange',
    //   headerName: 'Price Range',
    //   width: 150,
    //   type: 'string',
    //   valueGetter: (_, row) => {
    //     const variants = row.variants || [];
    //     if (variants.length === 0) return 'N/A';

    //     const prices = variants.map((v: any) => v.pricing?.salePrice || v.pricing?.basePrice || 0);
    //     const min = Math.min(...prices);
    //     const max = Math.max(...prices);

    //     return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
    //   },
    //   renderCell: (params) => (
    //     <Tooltip title={`Price range across all variants: ${params.value}`}>
    //       <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    //         {params.value}
    //       </Box>
    //     </Tooltip>
    //   ),
    // },
    {
      field: "rating",
      headerName: "Rating",
      width: 120,
      type: "number",
      valueGetter: (_, row) => row.rating?.average || 0,
      renderCell: (params) => {
        const rating = params.row.rating;
        const tooltipContent = rating
          ? `Average: ${rating.average}/5\nTotal Reviews: ${rating.totalReviews}\nDistribution: 5⭐(${rating.distribution[5]}) 4⭐(${rating.distribution[4]}) 3⭐(${rating.distribution[3]}) 2⭐(${rating.distribution[2]}) 1⭐(${rating.distribution[1]})`
          : "No ratings yet";
        return (
          <Tooltip title={<Box sx={{ whiteSpace: "pre-line" }}>{tooltipContent}</Box>}>
            <Chip
              label={`${params.value.toFixed(1)} ⭐`}
              size="small"
              color={params.value >= 4 ? "success" : params.value >= 3 ? "warning" : "error"}
            />
          </Tooltip>
        );
      },
    },
    {
      field: "totalReviews",
      headerName: "Reviews",
      width: 100,
      type: "number",
      valueGetter: (_, row) => row.rating?.totalReviews || 0,
    },
    {
      field: "analytics",
      headerName: "Views",
      width: 100,
      type: "number",
      valueGetter: (_, row) => row.analytics?.views || 0,
      renderCell: (params) => (
        <Tooltip title={`Total product views: ${params.value}`}>
          <Typography variant="body2">{params.value}</Typography>
        </Tooltip>
      ),
    },
    {
      field: "purchases",
      headerName: "Purchases",
      width: 100,
      type: "number",
      valueGetter: (_, row) => row.analytics?.purchases || 0,
      renderCell: (params) => (
        <Tooltip title={`Total purchases: ${params.value}`}>
          <Typography variant="body2">{params.value}</Typography>
        </Tooltip>
      ),
    },
    {
      field: "wishlistCount",
      headerName: "Wishlisted",
      width: 100,
      type: "number",
      valueGetter: (_, row) => row.analytics?.wishlistCount || 0,
      renderCell: (params) => (
        <Tooltip title={`Times added to wishlist: ${params.value}`}>
          <Typography variant="body2">{params.value}</Typography>
        </Tooltip>
      ),
    },
    {
      field: "seoTitle",
      headerName: "SEO Title",
      width: 200,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={params.value || "SEO Title not set"}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "Not set"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "seoDescription",
      headerName: "SEO Description",
      width: 250,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={params.value || "SEO Description not set"}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "Not set"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 150,
      type: "string",
      valueGetter: (_, row) => row.tags?.join(", ") || "",
      renderCell: (params) => (
        <Tooltip title={`Product tags: ${params.value || "No tags"}`}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "No tags"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "comboOffers",
      headerName: "Combo Offers",
      width: 120,
      type: "number",
      valueGetter: (_, row) => row.comboOffers?.length || 0,
      renderCell: (params) => {
        const offers = params.row.comboOffers || [];
        const tooltipContent =
          offers.length > 0
            ? offers
                .map((offer: any, idx: number) =>
                  [
                    `Combo #${idx + 1}: ${offer.name || "N/A"}`,
                    offer.description ? `Description: ${offer.description}` : null,
                    `Included Sizes: ${
                      Array.isArray(offer.includedSizes)
                        ? offer.includedSizes
                            .map(
                              (s: any) => `${s.sizeCode || "N/A"}${s.quantity > 1 ? ` x${s.quantity}` : ""}`
                            )
                            .join(", ")
                        : "N/A"
                    }`,
                    `Combo Price: ₹${offer.comboPrice ?? "N/A"}`,
                    offer.savings != null ? `Savings: ₹${offer.savings}` : null,
                    offer.savingsPercentage != null ? `Savings %: ${offer.savingsPercentage}%` : null,
                    offer.badgeText ? `Badge: ${offer.badgeText}` : null,
                    `Active: ${offer.isActive ? "✅ Yes" : "❌ No"}`,
                    `Display Order: ${offer.displayOrder ?? 0}`,
                  ]
                    .filter(Boolean)
                    .join("\n")
                )
                .join("\n\n" + "━".repeat(25) + "\n\n")
            : "No combo offers";
        return (
          <Tooltip
            title={
              <Box sx={{ whiteSpace: "pre-line", maxWidth: 600, maxHeight: 400, overflow: "auto" }}>
                {tooltipContent}
              </Box>
            }
          >
            <Typography variant="body2">{params.value}</Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "adminNotes",
      headerName: "Admin Notes",
      width: 200,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={params.value || "No admin notes"}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "No notes"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={`Product status: ${params.value}`}>
          <Chip
            label={params.value}
            color={
              params.value === "active"
                ? "success"
                : params.value === "inactive"
                ? "default"
                : params.value === "out-of-stock"
                ? "error"
                : "warning"
            }
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        </Tooltip>
      ),
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


  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (row: Product) => {
    setEditingProduct(row);
    setModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleFormSubmit = async (data: CreateProductRequest) => {
    if (editingProduct) {
      const updateData: UpdateProductRequest = {
        _id: editingProduct._id,
        ...data,
      };
      updateProduct(updateData);
    } else {
      createProduct(data);
    }
  };

  return (
    <DefaultLayout>
      <Box>
        <DynamicDataGrid
          id="products"
          title="Products Management"
          columns={columns}
          data={gridData}
          loading={isLoading}
          onParamsChange={handleParamsChange}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <ProductFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingProduct ? "Edit Product" : "Add New Product"}
          initialData={editingProduct}
          onSubmit={handleFormSubmit}
          // isLoading={createProductPending || updateProductPending}
          isSuccess={createProductSuccess || updateProductSuccess}
          isError={createProductError || updateProductError}
          categories={categoriesData?.docs || []}
        />
      </Box>
    </DefaultLayout>
  );
};

export default Products;
