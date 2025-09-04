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
} from "@mui/material";
import { X, Plus, Trash2, Upload } from "lucide-react";
import { Banner, CreateBannerRequest } from "../pages/banners/interface";
import { useUploadFilesApi } from "../api/api-hooks/useUploadApi";
import toast from "react-hot-toast";

interface BannerFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initialData?: Banner | null;
  onSubmit: (data: CreateBannerRequest) => Promise<void>;
  isSuccess?: boolean;
  isError?: boolean;
}

const BannerFormModal: React.FC<BannerFormModalProps> = ({
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
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const uploadMutation = useUploadFilesApi();
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("bannerFormData");
    return saved ? JSON.parse(saved) : null;
  };

  // Save to localStorage
  const saveToLocalStorage = (data: any) => {
    if (initialData) return; // Don't save in editing mode
    localStorage.setItem("bannerFormData", JSON.stringify(data));
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("bannerFormData");
    setPendingUploads([]);
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
        bannerImages: [],
      };

      if (initialData) {
        setFormData({
          bannerImages: initialData.bannerImages || [],
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

    if (!formData.bannerImages || formData.bannerImages.length === 0) {
      newErrors.bannerImages = "At least one banner image is required";
    }

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
      // Upload pending files first
      let updatedImages = [...(formData.bannerImages || [])];

      if (pendingUploads.length > 0) {
        const result = await uploadMutation.mutateAsync({ files: pendingUploads });
        const uploadedUrls = result.data.response?.data?.urls || [];

        // Replace blob URLs with actual URLs
        updatedImages = updatedImages.map((url: string) => {
          if (url.startsWith("blob:")) {
            return uploadedUrls.shift() || url;
          }
          return url;
        });
      }

      const processedData: CreateBannerRequest = {
        bannerImages: updatedImages,
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setPendingUploads((prev) => [...prev, ...Array.from(files)]);

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      handleFieldChange("bannerImages", [...(formData.bannerImages || []), url]);
    });

    toast.success(`${files.length} image(s) added for upload`);
  };

  const addManualImageUrl = () => {
    if (!manualImageUrl.trim()) return;

    handleFieldChange("bannerImages", [...(formData.bannerImages || []), manualImageUrl.trim()]);
    setManualImageUrl("");
    setShowManualInput(false);
    toast.success("Image URL added successfully");
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.bannerImages.filter((_: string, i: number) => i !== index);
    handleFieldChange("bannerImages", updatedImages);
  };

  const clearAllFormData = () => {
    clearLocalStorage();
    const defaultData = {
      bannerImages: [],
    };
    setFormData(defaultData);
    toast.success("Form data cleared");
  };

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
        {/* Banner Images Section */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Banner Images
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
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
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
                  placeholder="https://example.com/banner.jpg"
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
            {formData.bannerImages && formData.bannerImages.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
                {formData.bannerImages.map((imageUrl: string, index: number) => (
                  <Box key={index} sx={{ position: "relative" }}>
                    <img
                      src={imageUrl}
                      alt={`Banner ${index + 1}`}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "2px solid #e2e8f0",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
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
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        color: "white",
                        px: 1,
                        borderRadius: 1,
                      }}
                    >
                      #{index + 1}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {(!formData.bannerImages || formData.bannerImages.length === 0) && (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  border: "2px dashed #cbd5e1",
                  borderRadius: 2,
                  color: "#64748b",
                }}
              >
                <Typography variant="body1">No banner images added yet</Typography>
                <Typography variant="body2">Upload images or add URLs to get started</Typography>
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
          {isLoading ? "Saving..." : "Save Banner"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BannerFormModal;