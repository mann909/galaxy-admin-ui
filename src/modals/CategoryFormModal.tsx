import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { X, Upload } from "lucide-react";
import { Category, CreateCategoryRequest } from "../pages/categories/interface";
import { useCategoriesApi } from "../api/api-hooks/useCategoryApi";
import { useUploadFilesApi } from "../api/api-hooks/useUploadApi";
import toast from "react-hot-toast";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initialData?: Category | null;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  isSuccess?: boolean;
  isError?: boolean;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  open,
  onClose,
  title,
  initialData,
  onSubmit,
  isSuccess,
  isError,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingUpload, setPendingUpload] = useState<File | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const uploadMutation = useUploadFilesApi();
  const [isLoading, setIsLoading] = useState(false);

  // Get parent categories
  const { data: parentCategoriesData } = useCategoriesApi({ limit: 1000 });

  // Load from localStorage
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("categoryFormData");
    return saved ? JSON.parse(saved) : null;
  };

  // Save to localStorage
  const saveToLocalStorage = (data: any) => {
    if (initialData) return; // Don't save in editing mode
    localStorage.setItem("categoryFormData", JSON.stringify(data));
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("categoryFormData");
    setPendingUpload(null);
    setShowManualInput(false);
  };

  const handleClose = () => {
    if (initialData) {
      clearLocalStorage();
    }
    onClose();
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
        parent: "",
        level: 1,
        image: "",
        isActive: true,
        displayOrder: 0,
      };

      if (initialData) {
        setFormData({
          name: initialData.name || "",
          slug: initialData.slug || "",
          description: initialData.description || "",
          parent: initialData.parent?._id || "",
          level: initialData.level || 1,
          image: initialData.image || "",
          isActive: initialData.isActive !== false,
          displayOrder: initialData.displayOrder || 0,
        });
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Category name is required";
    if (!formData.slug) newErrors.slug = "Slug is required";

    const errMsg = Object.values(newErrors).join(", ");
    if (errMsg) {
      toast.error(errMsg);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      let finalImageUrl = formData.image;

      // Upload pending file if exists
      if (pendingUpload) {
        const result = await uploadMutation.mutateAsync({ files: [pendingUpload] });
        const uploadedUrls = result.data.response?.data?.urls || [];
        finalImageUrl = uploadedUrls[0] || formData.image;
      }

      const processedData: CreateCategoryRequest = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parent: formData.parent || undefined,
        level: formData.level,
        image: finalImageUrl,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setPendingUpload(file);

    const url = URL.createObjectURL(file);
    handleFieldChange("image", url);
    toast.success("Image added for upload");
  };

  const addManualImageUrl = () => {
    if (!manualImageUrl.trim()) return;

    handleFieldChange("image", manualImageUrl.trim());
    setManualImageUrl("");
    setShowManualInput(false);
    toast.success("Image URL added successfully");
  };

  const removeImage = () => {
    handleFieldChange("image", "");
    setPendingUpload(null);
  };

  const clearAllFormData = () => {
    clearLocalStorage();
    const defaultData = {
      name: "",
      slug: "",
      description: "",
      parent: "",
      level: 1,
      image: "",
      isActive: true,
      displayOrder: 0,
    };
    setFormData(defaultData);
    toast.success("Form data cleared");
  };

  // Filter parent categories (exclude current category and its children when editing)
  const availableParentCategories = (parentCategoriesData?.docs || []).filter((cat: Category) => {
    if (!initialData) return true;
    return cat._id !== initialData._id;
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            minHeight: "70vh",
            maxHeight: "90vh",
            width: "90vw",
            maxWidth: "800px",
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
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Basic Information
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <TextField
                fullWidth
                label="Category Name"
                value={formData.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Slug"
                value={formData.slug || ""}
                onChange={(e) => handleFieldChange("slug", e.target.value)}
                error={!!errors.slug}
                helperText={errors.slug}
                required
                disabled={isLoading}
              />

              <FormControl fullWidth>
                <InputLabel>Parent Category</InputLabel>
                <Select
                  value={formData.parent || ""}
                  label="Parent Category"
                  onChange={(e) => handleFieldChange("parent", e.target.value)}
                  disabled={isLoading}
                >
                  <MenuItem value="">No Parent (Root Category)</MenuItem>
                  {availableParentCategories.map((cat: Category) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name} (Level {cat.level})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Level"
                type="number"
                value={formData.level || ""}
                onChange={(e) => handleFieldChange("level", Number(e.target.value))}
                disabled={isLoading}
                // inputProps={{ min: 1, max: 5 }}
              />

              <TextField
                fullWidth
                label="Display Order"
                type="number"
                value={formData.displayOrder || ""}
                onChange={(e) => handleFieldChange("displayOrder", Number(e.target.value))}
                disabled={isLoading}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive !== false}
                    onChange={(e) => handleFieldChange("isActive", e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Active"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                multiline
                rows={3}
                disabled={isLoading}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Category Image Section */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Category Image
            </Typography>

            {/* Upload Controls */}
            <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload size={16} />}
                disabled={isLoading}
                sx={{ borderRadius: 1 }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </Button>
              <Typography variant="body2" color="textSecondary">
                or
              </Typography>
              <Button
                variant="text"
                onClick={() => setShowManualInput(!showManualInput)}
                disabled={isLoading}
                sx={{ textTransform: "none" }}
              >
                Enter URL manually
              </Button>
            </Box>

            {showManualInput && (
              <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  disabled={isLoading}
                  size="small"
                  placeholder="https://example.com/category.jpg"
                />
                <Button
                  variant="outlined"
                  onClick={addManualImageUrl}
                  disabled={isLoading || !manualImageUrl.trim()}
                  sx={{ minWidth: 80 }}
                >
                  Add
                </Button>
              </Box>
            )}

            {/* Image Preview */}
            {formData.image && (
              <Box sx={{ position: "relative", width: "fit-content" }}>
                <img
                  src={formData.image}
                  alt="Category Preview"
                  style={{
                    width: 200,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "2px solid #e2e8f0",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={removeImage}
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
            )}

            {!formData.image && (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  border: "2px dashed #cbd5e1",
                  borderRadius: 2,
                  color: "#64748b",
                }}
              >
                <Typography variant="body1">No category image added yet</Typography>
                <Typography variant="body2">Upload an image or add URL</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
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
          {isLoading ? "Saving..." : "Save Category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormModal;