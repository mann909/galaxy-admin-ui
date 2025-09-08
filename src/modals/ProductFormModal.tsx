import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
} from "@mui/material";
import { X, ChevronDown, Plus, Trash2, Upload } from "lucide-react";
import {
  Product,
  CreateProductRequest,
  ProductVariant,
  ComboOffer,
  ComboOfferIncludedSize,
} from "../pages/products/interface";
import { Category } from "../pages/categories/interface";
import { useUploadFilesApi } from "../api/api-hooks/useUploadApi";
import toast from "react-hot-toast";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initialData?: Product | null;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  // isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  categories: Category[];
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onClose,
  title,
  initialData,
  onSubmit,
  // isLoading: isSaving = false,
  isSuccess,
  isError,
  categories,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingUploads, setPendingUploads] = useState<{ [variantIndex: number]: File[] }>({});
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState<{ [variantIndex: number]: boolean }>({});
  const uploadMutation = useUploadFilesApi();
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("productFormData");
    return saved ? JSON.parse(saved) : null;
  };

  // Save to localStorage
  const saveToLocalStorage = (data: any) => {
    if (initialData) return; // Don't save in editing mode
    localStorage.setItem("productFormData", JSON.stringify(data));
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("productFormData");
    setPendingUploads({});
    setShowManualInput({});
  };

  // clear localstorage when in editing mode
  const handleClose = () => {
    if (initialData) {
      clearLocalStorage();
    }
    onClose();

    return () => {
      clearLocalStorage();
    };
  };

  useEffect(() => {
    if (isSuccess) {
      setIsLoading(false);
      clearLocalStorage();
    }

    if (isError) {
      setIsLoading(false);
    }
  }, [isSuccess, isError]);

  // Initialize form data
  useEffect(() => {
    if (open) {
      const savedData = loadFromLocalStorage();
      const defaultData = {
        name: "",
        slug: "",
        description: "",
        brand: "",
        category: "",
        productType: "",
        features: "",
        materials: "",
        typeSpecific: {
          laptopCompatibility: "",
          compartments: 0,
          hasWaterBottleHolder: false,
          wheelType: "",
          lockType: "",
          isExpandable: false,
          closureType: "",
          handleType: "",
          strapType: "",
        },
        seoTitle: "",
        seoDescription: "",
        tags: "",
        adminNotes: "",
        status: "active",
        variants: [],
        comboOffers: [],
      };

      if (initialData) {
        const editData = {
          ...initialData,
          features: initialData.features?.join(", ") || "",
          materials: initialData.materials?.join(", ") || "",
          tags: initialData.tags?.join(", ") || "",
          category: initialData.category?._id || "",
          typeSpecific: {
            laptopCompatibility: initialData.typeSpecific?.laptopCompatibility || "",
            compartments: initialData.typeSpecific?.compartments || 0,
            hasWaterBottleHolder: initialData.typeSpecific?.hasWaterBottleHolder || false,
            wheelType: initialData.typeSpecific?.wheelType || "",
            lockType: initialData.typeSpecific?.lockType || "",
            isExpandable: initialData.typeSpecific?.isExpandable || false,
            closureType: initialData.typeSpecific?.closureType || "",
            handleType: initialData.typeSpecific?.handleType || "",
            strapType: initialData.typeSpecific?.strapType || "",
          },
        };
        setFormData(editData);
      } else {
        setFormData(savedData || defaultData);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleFieldChange = (field: string, value: any) => {
    const newData = {
      ...formData,
      [field]: value,
    };
    setFormData(newData);
    saveToLocalStorage(newData);

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleTypeSpecificChange = (field: string, value: any) => {
    const newData = {
      ...formData,
      typeSpecific: {
        ...formData.typeSpecific,
        [field]: value,
      },
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Product name is required";
    // if (!formData.slug) newErrors.slug = "Slug is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.category) newErrors.category = "Category is required";
    // if (!formData.productType) newErrors.productType = "Product type is required";
    if (!formData.variants || formData.variants.length === 0) {
      newErrors.variants = "At least one variant is required";
    } else if (
      formData.variants.some(
        (variant: ProductVariant) =>
          !variant.color?.images ||
          variant.color.images.length === 0 ||
          !variant?.sku ||
          !variant?.inventory ||
          variant.inventory.stock === 0 ||
          !variant?.pricing ||
          !variant.pricing.basePrice ||
          !variant?.size ||
          !variant.size.name ||
          !variant.size.code
      )
    ) {
      newErrors.variants = "All variants must have all the required fields";
    }
    // Combo Offers Validation
    if (formData.comboOffers && formData.comboOffers.length > 0) {
      const variants = formData.variants || [];
      
      for (let i = 0; i < formData.comboOffers.length; i++) {
        const offer: ComboOffer = formData.comboOffers[i];
        
        // Basic field validation
        if (!offer?.name || !offer?.description || !offer?.comboPrice || !offer.savings || !offer.savingsPercentage) {
          newErrors.comboOffers = "All combo offers must have all required fields";
          break;
        }
        
        if (!offer.includedSizes || offer.includedSizes.length === 0) {
          newErrors.comboOffers = "Each combo offer must include at least one size";
          break;
        }
        
        // Validate each included size
        for (const comboSize of offer.includedSizes) {
          if (!comboSize.quantity || !comboSize.sizeCode) {
            newErrors.comboOffers = "All included sizes must have quantity and size code";
            break;
          }
          
          // Check if size exists in variants
          const variantsWithThisSize = variants.filter((variant: ProductVariant) => 
            variant.size?.code === comboSize.sizeCode
          );
          
          if (variantsWithThisSize.length === 0) {
            newErrors.comboOffers = `Size ${comboSize.sizeCode} in combo "${offer.name}" does not exist in product variants`;
            break;
          }
          
          // Check stock availability for this size
          const totalAvailableStock = variantsWithThisSize.reduce((sum: number, variant: ProductVariant) => 
            sum + (variant.inventory?.stock || 0), 0
          );
          
          if (totalAvailableStock < comboSize.quantity) {
            newErrors.comboOffers = `Insufficient stock for size ${comboSize.sizeCode} in combo "${offer.name}". Required: ${comboSize.quantity}, Available: ${totalAvailableStock}`;
            break;
          }
        }
        
        // Validate common colors between sizes in combo
        if (offer.includedSizes.length > 1) {
          const sizeCodes = offer.includedSizes.map(size => size.sizeCode);
          const colorsBySize: { [sizeCode: string]: string[] } = {};
          
          // Group colors by size
          sizeCodes.forEach(sizeCode => {
            const variantsForSize = variants.filter((variant: ProductVariant) => 
              variant.size?.code === sizeCode
            );
            colorsBySize[sizeCode] = variantsForSize.map((variant: ProductVariant) => 
              variant.color?.code || variant.color?.name || ''
            ).filter((color: string) => color);
          });
          
          // Find common colors across all sizes in the combo
          const firstSizeColors = colorsBySize[sizeCodes[0]] || [];
          const commonColors = firstSizeColors.filter(color => 
            sizeCodes.every(sizeCode => colorsBySize[sizeCode]?.includes(color))
          );
          
          if (commonColors.length === 0) {
            const sizeNames = sizeCodes.join(' + ');
            newErrors.comboOffers = `Combo "${offer.name}" with sizes ${sizeNames} has no common colors. All sizes in a combo must share at least one common color.`;
            break;
          }
        }
        
        if (newErrors.comboOffers) break;
      }
    }

    const errMsg = Object.values(newErrors).join(", ");
    if (errMsg) {
      toast.error(errMsg);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCategorySlug = (catId: string) => {
    const category = categories.find((cat) => cat._id === catId);
    return category ? category.slug.toLowerCase() || category.name.toLowerCase() :  "";
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Upload pending files first
      const updatedVariants = [...(formData.variants || [])];

      for (const [variantIndex, files] of Object.entries(pendingUploads)) {
        if (files.length > 0) {
          const result = await uploadMutation.mutateAsync({ files });
          console.log("Upload result:", result);
          const uploadedUrls = result.data.response?.data?.urls;

          // Replace blob URLs with actual URLs
          const variantIdx = parseInt(variantIndex);
          const currentImages = updatedVariants[variantIdx]?.color?.images || [];
          const updatedImages = currentImages.map((url: string) => {
            if (url.startsWith("blob:")) {
              return uploadedUrls.shift() || url;
            }
            return url;
          });

          if (updatedVariants[variantIdx]) {
            updatedVariants[variantIdx] = {
              ...updatedVariants[variantIdx],
              color: {
                ...updatedVariants[variantIdx].color,
                images: updatedImages,
              },
            };
          }
        }
      }

      const processedData: CreateProductRequest = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        brand: formData.brand,
        category: formData.category,
        productType: getCategorySlug(formData.category),
        features: formData.features
          ? formData.features
              .split(",")
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [],
        materials: formData.materials
          ? formData.materials
              .split(",")
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [],
        typeSpecific: formData.typeSpecific,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [],
        adminNotes: formData.adminNotes,
        status: formData.status,
        variants: updatedVariants,
        comboOffers: formData.comboOffers || [],
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const addVariant = () => {
    const newVariant: Partial<ProductVariant> = {
      sku: "",
      size: {
        name: "",
        code: "",
        dimensions: { length: 0, width: 0, height: 0 },
        capacity: "",
        weight: 0,
      },
      color: {
        name: "",
        code: "",
        hexCode: "",
        images: [],
      },
      pricing: {
        basePrice: 0,
        salePrice: undefined,
        currency: "INR",
        costPrice: undefined,
        marginPercentage: undefined,
      },
      inventory: {
        stock: 0,
        lowStockThreshold: 5,
        reservedStock: 0,
      },
      isActive: true,
      displayOrder: (formData.variants?.length || 0) + 1,
    };

    const newData = {
      ...formData,
      variants: [...(formData.variants || []), newVariant],
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const removeVariant = (index: number) => {
    const newData = {
      ...formData,
      variants: formData.variants.filter((_: any, i: number) => i !== index),
    };
    setFormData(newData);
    saveToLocalStorage(newData);

    // Clean up pending uploads for this variant
    setPendingUploads((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newData = {
      ...formData,
      variants: formData.variants.map((variant: any, i: number) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const updateVariantNested = (index: number, parentField: string, childField: string, value: any) => {
    const newData = {
      ...formData,
      variants: formData.variants.map((variant: any, i: number) =>
        i === index
          ? {
              ...variant,
              [parentField]: {
                ...variant[parentField],
                [childField]: value,
              },
            }
          : variant
      ),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const addImageToVariant = (variantIndex: number, imageUrl: string) => {
    const newData = {
      ...formData,
      variants: formData.variants.map((variant: any, i: number) =>
        i === variantIndex
          ? {
              ...variant,
              color: {
                ...variant.color,
                images: [...(variant.color?.images || []), imageUrl],
              },
            }
          : variant
      ),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const removeImageFromVariant = (variantIndex: number, imageIndex: number) => {
    const newData = {
      ...formData,
      variants: formData.variants.map((variant: any, i: number) =>
        i === variantIndex
          ? {
              ...variant,
              color: {
                ...variant.color,
                images: variant.color?.images?.filter((_: string, idx: number) => idx !== imageIndex) || [],
              },
            }
          : variant
      ),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const handleImageUpload = (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setPendingUploads((prev) => ({
      ...prev,
      [variantIndex]: [...(prev[variantIndex] || []), ...Array.from(files)],
    }));

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      addImageToVariant(variantIndex, url);
    });

    toast.success(`${files.length} image(s) added for upload`);
  };

  const addManualImageUrl = (variantIndex: number) => {
    if (!manualImageUrl.trim()) return;

    addImageToVariant(variantIndex, manualImageUrl.trim());
    setManualImageUrl("");
    setShowManualInput((prev) => ({ ...prev, [variantIndex]: false }));
    toast.success("Image URL added successfully");
  };

  const clearAllFormData = () => {
    clearLocalStorage();
    const defaultData = {
      name: "",
      slug: "",
      description: "",
      brand: "",
      category: "",
      productType: "",
      features: "",
      materials: "",
      typeSpecific: {
        laptopCompatibility: "",
        compartments: 0,
        hasWaterBottleHolder: false,
        wheelType: "",
        lockType: "",
        isExpandable: false,
        closureType: "",
        handleType: "",
        strapType: "",
      },
      seoTitle: "",
      seoDescription: "",
      tags: "",
      adminNotes: "",
      status: "active",
      variants: [],
      comboOffers: [],
    };
    setFormData(defaultData);
    toast.success("Form data cleared");
  };

  const addComboOffer = () => {
    const newOffer: Partial<ComboOffer> = {
      name: "",
      description: "",
      includedSizes: [],
      comboPrice: 0,
      savings: undefined,
      savingsPercentage: undefined,
      displayOrder: (formData.comboOffers?.length || 0) + 1,
      badgeText: "",
      isActive: true,
    };

    const newData = {
      ...formData,
      comboOffers: [...(formData.comboOffers || []), newOffer],
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const removeComboOffer = (index: number) => {
    const newData = {
      ...formData,
      comboOffers: formData.comboOffers.filter((_: any, i: number) => i !== index),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const updateComboOffer = (index: number, field: string, value: any) => {
    const newData = {
      ...formData,
      comboOffers: formData.comboOffers.map((offer: any, i: number) =>
        i === index ? { ...offer, [field]: value } : offer
      ),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const addIncludedSize = (offerIndex: number) => {
    const newSize = { sizeCode: "", quantity: 1 };
    const newData = {
      ...formData,
      comboOffers: formData.comboOffers.map((offer: any, i: number) =>
        i === offerIndex
          ? {
              ...offer,
              includedSizes: [...(offer.includedSizes || []), newSize],
            }
          : offer
      ),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const removeIncludedSize = (offerIndex: number, sizeIndex: number) => {
    const newData = {
      ...formData,
      comboOffers: formData.comboOffers.map((offer: any, i: number) =>
        i === offerIndex
          ? {
              ...offer,
              includedSizes: offer.includedSizes.filter((_: any, idx: number) => idx !== sizeIndex),
            }
          : offer
      ),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const updateIncludedSize = (offerIndex: number, sizeIndex: number, field: string, value: any) => {
    const newData = {
      ...formData,
      comboOffers: formData.comboOffers.map((offer: any, i: number) =>
        i === offerIndex
          ? {
              ...offer,
              includedSizes: offer.includedSizes.map((size: any, idx: number) =>
                idx === sizeIndex ? { ...size, [field]: value } : size
              ),
            }
          : offer
      ),
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            minHeight: "85vh",
            maxHeight: "95vh",
            width: "98vw",
            maxWidth: "1400px",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={clearAllFormData}
            disabled={isLoading}
            sx={{ borderRadius: 1 }}
          >
            Clear All
          </Button>
          <IconButton onClick={handleClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        {/* Basic Information Section */}
        <Card sx={{ mb: 3, boxShadow: 2, mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Basic Information
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                disabled={isLoading}
              />

              {/* <TextField
                fullWidth
                label="Slug"
                value={formData.slug || ""}
                onChange={(e) => handleFieldChange("slug", e.target.value)}
                error={!!errors.slug}
                helperText={errors.slug}
                required
                disabled={isLoading}
              /> */}

              <TextField
                fullWidth
                label="Brand"
                value={formData.brand || ""}
                onChange={(e) => handleFieldChange("brand", e.target.value)}
                error={!!errors.brand}
                helperText={errors.brand}
                required
                disabled={isLoading}
              />

              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category || ""}
                  label="Category"
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  required
                  disabled={isLoading}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* <FormControl fullWidth error={!!errors.productType}>
                <InputLabel>Product Type</InputLabel>
                <Select
                  value={formData.productType || "bag"}
                  label="Product Type"
                  required
                  onChange={(e) => handleFieldChange("productType", e.target.value)}
                  disabled={isLoading}
                >
                  <MenuItem value="bag">Bag</MenuItem>
                  <MenuItem value="backpack">Backpack</MenuItem>
                  <MenuItem value="luggage">Luggage</MenuItem>
                </Select>
              </FormControl> */}

              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || "active"}
                  label="Status"
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  disabled={isLoading}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                  <MenuItem value="discontinued">Discontinued</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Features (comma-separated)"
                value={formData.features || ""}
                onChange={(e) => handleFieldChange("features", e.target.value)}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Materials (comma-separated)"
                value={formData.materials || ""}
                onChange={(e) => handleFieldChange("materials", e.target.value)}
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                required
                multiline
                rows={3}
                disabled={isLoading}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Type-Specific Features Section */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Type-Specific Features
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
              {/* Backpack Features */}
              <TextField
                fullWidth
                label="Laptop Compatibility"
                value={formData.typeSpecific?.laptopCompatibility || ""}
                onChange={(e) => handleTypeSpecificChange("laptopCompatibility", e.target.value)}
                disabled={isLoading}
                placeholder="e.g., 15-inch MacBook Pro"
              />

              <TextField
                fullWidth
                label="Compartments"
                type="number"
                value={formData.typeSpecific?.compartments || 0}
                onChange={(e) => handleTypeSpecificChange("compartments", Number(e.target.value))}
                disabled={isLoading}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.typeSpecific?.hasWaterBottleHolder || false}
                    onChange={(e) => handleTypeSpecificChange("hasWaterBottleHolder", e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Has Water Bottle Holder"
              />

              {/* Luggage Features */}
              <TextField
                fullWidth
                label="Wheel Type"
                value={formData.typeSpecific?.wheelType || ""}
                onChange={(e) => handleTypeSpecificChange("wheelType", e.target.value)}
                disabled={isLoading}
                placeholder="spinner, roller, none"
              />

              <TextField
                fullWidth
                label="Lock Type"
                value={formData.typeSpecific?.lockType || ""}
                onChange={(e) => handleTypeSpecificChange("lockType", e.target.value)}
                disabled={isLoading}
                placeholder="TSA, combination, key"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.typeSpecific?.isExpandable || false}
                    onChange={(e) => handleTypeSpecificChange("isExpandable", e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Is Expandable"
              />

              {/* Bag Features */}
              <TextField
                fullWidth
                label="Closure Type"
                value={formData.typeSpecific?.closureType || ""}
                onChange={(e) => handleTypeSpecificChange("closureType", e.target.value)}
                disabled={isLoading}
                placeholder="zipper, magnetic, drawstring"
              />

              <TextField
                fullWidth
                label="Handle Type"
                value={formData.typeSpecific?.handleType || ""}
                onChange={(e) => handleTypeSpecificChange("handleType", e.target.value)}
                disabled={isLoading}
                placeholder="leather, plastic, fabric"
              />

              <TextField
                fullWidth
                label="Strap Type"
                value={formData.typeSpecific?.strapType || ""}
                onChange={(e) => handleTypeSpecificChange("strapType", e.target.value)}
                disabled={isLoading}
                placeholder="adjustable, fixed, removable"
              />
            </Box>
          </CardContent>
        </Card>

        {/* SEO & Marketing Section */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              SEO & Marketing
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <TextField
                fullWidth
                label="SEO Title"
                value={formData.seoTitle || ""}
                onChange={(e) => handleFieldChange("seoTitle", e.target.value)}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={formData.tags || ""}
                onChange={(e) => handleFieldChange("tags", e.target.value)}
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="SEO Description"
                value={formData.seoDescription || ""}
                onChange={(e) => handleFieldChange("seoDescription", e.target.value)}
                multiline
                rows={2}
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Admin Notes"
                value={formData.adminNotes || ""}
                onChange={(e) => handleFieldChange("adminNotes", e.target.value)}
                multiline
                rows={2}
                disabled={isLoading}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Variants Section */}
        <Accordion defaultExpanded={false} sx={{ mb: 2, boxShadow: 2 }}>
          <AccordionSummary expandIcon={<ChevronDown />} sx={{ backgroundColor: "#f8fafc", borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Product Variants ({formData.variants?.length || 0})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={addVariant}
                disabled={isLoading}
                sx={{ borderRadius: 2 }}
              >
                Add New Variant
              </Button>
            </Box>

            {formData.variants?.map((variant: any, index: number) => (
              <Card key={index} sx={{ mb: 3, border: "2px solid #e2e8f0", borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#3b82f6" }}>
                      Variant #{index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeVariant(index)}
                      disabled={isLoading}
                      color="error"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>

                  {/* Basic Variant Info */}
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                    <TextField
                      label="SKU"
                      value={variant.sku || ""}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Display Order"
                      type="number"
                      value={variant.displayOrder || 0}
                      onChange={(e) => updateVariant(index, "displayOrder", Number(e.target.value))}
                      disabled={isLoading}
                      size="small"
                    />
                    <Box></Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={variant.isActive !== false}
                          onChange={(e) => updateVariant(index, "isActive", e.target.checked)}
                          disabled={isLoading}
                        />
                      }
                      label="Active"
                    />
                  </Box>

                  {/* Size Information */}
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                    Size Information
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                    <TextField
                      label="Size Name"
                      value={variant.size?.name || ""}
                      onChange={(e) => updateVariantNested(index, "size", "name", e.target.value)}
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Size Code"
                      value={variant.size?.code || ""}
                      onChange={(e) => updateVariantNested(index, "size", "code", e.target.value)}
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Capacity"
                      value={variant.size?.capacity || ""}
                      onChange={(e) => updateVariantNested(index, "size", "capacity", e.target.value)}
                      disabled={isLoading}
                      size="small"
                      placeholder="45L, 20-30L"
                    />
                    <TextField
                      label="Weight (kg)"
                      type="number"
                      value={variant.size?.weight || 0}
                      onChange={(e) => updateVariantNested(index, "size", "weight", Number(e.target.value))}
                      disabled={isLoading}
                      size="small"
                    />
                  </Box>

                  {/* Dimensions */}
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                    Dimensions (cm)
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                    <TextField
                      label="Length"
                      type="number"
                      value={variant.size?.dimensions?.length || 0}
                      onChange={(e) =>
                        updateVariantNested(index, "size", "dimensions", {
                          ...variant.size?.dimensions,
                          length: Number(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      size="small"
                    />
                    <TextField
                      label="Width"
                      type="number"
                      value={variant.size?.dimensions?.width || 0}
                      onChange={(e) =>
                        updateVariantNested(index, "size", "dimensions", {
                          ...variant.size?.dimensions,
                          width: Number(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      size="small"
                    />
                    <TextField
                      label="Height"
                      type="number"
                      value={variant.size?.dimensions?.height || 0}
                      onChange={(e) =>
                        updateVariantNested(index, "size", "dimensions", {
                          ...variant.size?.dimensions,
                          height: Number(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      size="small"
                    />
                  </Box>

                  {/* Color Information */}
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                    Color Information
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                    <TextField
                      label="Color Name"
                      value={variant.color?.name || ""}
                      onChange={(e) => updateVariantNested(index, "color", "name", e.target.value)}
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Color Code"
                      value={variant.color?.code || ""}
                      onChange={(e) => updateVariantNested(index, "color", "code", e.target.value)}
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Hex Code"
                      value={variant.color?.hexCode || ""}
                      onChange={(e) => updateVariantNested(index, "color", "hexCode", e.target.value)}
                      disabled={isLoading}
                      required
                      size="small"
                      placeholder="#000000"
                    />
                  </Box>

                  {/* Images Section */}
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                    Product Images (Atleast one image is required)
                  </Typography>
                  <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Upload size={16} />}
                      disabled={isLoading}
                      sx={{ borderRadius: 1 }}
                    >
                      Upload Images
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files)}
                      />
                    </Button>
                    <Typography variant="body2" color="textSecondary">
                      or
                    </Typography>
                    <Button
                      variant="text"
                      onClick={() => setShowManualInput((prev) => ({ ...prev, [index]: !prev[index] }))}
                      disabled={isLoading}
                      sx={{ textTransform: "none" }}
                    >
                      Enter URL manually
                    </Button>
                  </Box>

                  {showManualInput[index] && (
                    <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Image URL"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        disabled={isLoading}
                        size="small"
                        placeholder="https://example.com/image.jpg"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => addManualImageUrl(index)}
                        disabled={isLoading || !manualImageUrl.trim()}
                        sx={{ minWidth: 80 }}
                      >
                        Add
                      </Button>
                    </Box>
                  )}

                  {variant.color?.images && variant.color.images.length > 0 && (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                      {variant.color.images.map((imageUrl: string, imgIndex: number) => (
                        <Box key={imgIndex} sx={{ position: "relative" }}>
                          <img
                            src={imageUrl}
                            alt={`Variant ${index + 1} Image ${imgIndex + 1}`}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "2px solid #e2e8f0",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeImageFromVariant(index, imgIndex)}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              backgroundColor: "#dc2626",
                              color: "white",
                              "&:hover": { backgroundColor: "#b91c1c" },
                            }}
                          >
                            <X size={12} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Pricing Information */}
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                    Pricing Information
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2 }}>
                    <TextField
                      label="Base Price"
                      type="number"
                      value={variant.pricing?.basePrice || 0}
                      onChange={(e) =>
                        updateVariantNested(index, "pricing", "basePrice", Number(e.target.value))
                      }
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Sale Price"
                      type="number"
                      value={variant.pricing?.salePrice || ""}
                      onChange={(e) =>
                        updateVariantNested(
                          index,
                          "pricing",
                          "salePrice",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      disabled={isLoading}
                      size="small"
                    />
                    <TextField
                      label="Currency"
                      value={variant.pricing?.currency || "INR"}
                      onChange={(e) => updateVariantNested(index, "pricing", "currency", e.target.value)}
                      disabled={isLoading}
                      size="small"
                    />
                    <TextField
                      label="Cost Price"
                      type="number"
                      value={variant.pricing?.costPrice || ""}
                      onChange={(e) =>
                        updateVariantNested(
                          index,
                          "pricing",
                          "costPrice",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      disabled={isLoading}
                      size="small"
                    />
                    <TextField
                      label="Margin %"
                      type="number"
                      value={variant.pricing?.marginPercentage || ""}
                      onChange={(e) =>
                        updateVariantNested(
                          index,
                          "pricing",
                          "marginPercentage",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      disabled={isLoading}
                      size="small"
                    />
                  </Box>

                  {/* Inventory Information */}
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                    Inventory Information
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                    <TextField
                      label="Stock"
                      type="number"
                      value={variant.inventory?.stock || 0}
                      onChange={(e) =>
                        updateVariantNested(index, "inventory", "stock", Number(e.target.value))
                      }
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Low Stock Threshold"
                      type="number"
                      value={variant.inventory?.lowStockThreshold || 5}
                      onChange={(e) =>
                        updateVariantNested(index, "inventory", "lowStockThreshold", Number(e.target.value))
                      }
                      disabled={isLoading}
                      size="small"
                    />
                    <TextField
                      label="Reserved Stock"
                      type="number"
                      value={variant.inventory?.reservedStock || 0}
                      onChange={(e) =>
                        updateVariantNested(index, "inventory", "reservedStock", Number(e.target.value))
                      }
                      disabled={isLoading}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Combo Offers Section */}
        <Accordion defaultExpanded={false} sx={{ mb: 2, boxShadow: 2 }}>
          <AccordionSummary expandIcon={<ChevronDown />} sx={{ backgroundColor: "#f8fafc", borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Combo Offers ({formData.comboOffers?.length || 0})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={addComboOffer}
                disabled={isLoading}
                sx={{ borderRadius: 2 }}
              >
                Add Combo Offer
              </Button>
            </Box>

            {formData.comboOffers?.map((offer: any, index: number) => (
              <Card key={index} sx={{ mb: 3, border: "2px solid #e2e8f0", borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#10b981" }}>
                      Combo Offer #{index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeComboOffer(index)}
                      disabled={isLoading}
                      color="error"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 2 }}>
                    <TextField
                      label="Offer Name"
                      value={offer.name || ""}
                      onChange={(e) => updateComboOffer(index, "name", e.target.value)}
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Combo Price"
                      type="number"
                      value={offer.comboPrice || 0}
                      onChange={(e) => updateComboOffer(index, "comboPrice", Number(e.target.value))}
                      disabled={isLoading}
                      required
                      size="small"
                    />
                    <TextField
                      label="Savings Amount"
                      type="number"
                      value={offer.savings || ""}
                      required
                      onChange={(e) =>
                        updateComboOffer(
                          index,
                          "savings",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      disabled={isLoading}
                      size="small"
                    />
                    <TextField
                      label="Savings %"
                      type="number"
                      value={offer.savingsPercentage || ""}
                      required
                      onChange={(e) =>
                        updateComboOffer(
                          index,
                          "savingsPercentage",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      disabled={isLoading}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 2 }}>
                    <TextField
                      label="Badge Text"
                      value={offer.badgeText || ""}
                      onChange={(e) => updateComboOffer(index, "badgeText", e.target.value)}
                      disabled={isLoading}
                      size="small"
                      placeholder="Best Deal, Popular"
                    />
                    <TextField
                      label="Display Order"
                      type="number"
                      value={offer.displayOrder || 0}
                      onChange={(e) => updateComboOffer(index, "displayOrder", Number(e.target.value))}
                      disabled={isLoading}
                      size="small"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={offer.isActive !== false}
                          onChange={(e) => updateComboOffer(index, "isActive", e.target.checked)}
                          disabled={isLoading}
                        />
                      }
                      label="Active"
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Description"
                    value={offer.description || ""}
                    onChange={(e) => updateComboOffer(index, "description", e.target.value)}
                    disabled={isLoading}
                    required
                    size="small"
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />

                  {/* Included Sizes */}
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                    Included Sizes
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Plus size={14} />}
                      onClick={() => addIncludedSize(index)}
                      disabled={isLoading}
                    >
                      Add Size
                    </Button>
                  </Box>

                  {offer.includedSizes?.map((size: any, sizeIndex: number) => (
                    <Box key={sizeIndex} sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
                      <TextField
                        label="Size Code"
                        value={size.sizeCode || ""}
                        onChange={(e) => updateIncludedSize(index, sizeIndex, "sizeCode", e.target.value)}
                        disabled={isLoading}
                        required
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      {/* <TextField
                        label="Quantity"
                        type="number"
                        value={size.quantity || 1}
                        required
                        onChange={(e) =>
                          updateIncludedSize(index, sizeIndex, "quantity", Number(e.target.value))
                        }
                        disabled={isLoading}
                        size="small"
                        sx={{ width: 100 }}
                      /> */}
                      <IconButton
                        size="small"
                        onClick={() => removeIncludedSize(index, sizeIndex)}
                        disabled={isLoading}
                        color="error"
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            ))}
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={handleClose} disabled={isLoading} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 4 }}
        >
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormModal;
