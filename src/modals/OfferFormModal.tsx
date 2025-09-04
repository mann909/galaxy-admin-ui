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
  Chip,
} from "@mui/material";
import { X, Plus, Trash2 } from "lucide-react";
import { Offer, CreateOfferRequest } from "../pages/offers/interface";
import toast from "react-hot-toast";

interface OfferFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initialData?: Offer | null;
  onSubmit: (data: CreateOfferRequest) => Promise<void>;
  isSuccess?: boolean;
  isError?: boolean;
}

const OfferFormModal: React.FC<OfferFormModalProps> = ({
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
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("offerFormData");
    return saved ? JSON.parse(saved) : null;
  };

  // Save to localStorage
  const saveToLocalStorage = (data: any) => {
    if (initialData) return; // Don't save in editing mode
    localStorage.setItem("offerFormData", JSON.stringify(data));
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("offerFormData");
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
        offerName: "",
        offerDesc: "",
        couponCode: "",
        discountType: "percentage",
        value: "",
        discountedItemsType: "allItems",
        uptoAmountLimit: "",
        minCartValue: "",
        limit: "",
        startDateTime: "",
        expiryDateTime: "",
        isActive: true,
        isPrivate: false,
        termsAndConditions: [""],
        highlights: [""],
      };

      if (initialData) {
        setFormData({
          offerName: initialData.offerName || "",
          offerDesc: initialData.offerDesc || "",
          couponCode: initialData.couponCode || "",
          discountType: initialData.discountType || "percentage",
          value: initialData.value || "",
          discountedItemsType: initialData.discountedItemsType || "allItems",
          uptoAmountLimit: initialData.uptoAmountLimit || "",
          minCartValue: initialData.minCartValue || "",
          limit: initialData.limit || "",
          startDateTime: initialData.startDateTime ? new Date(initialData.startDateTime).toISOString().slice(0, 16) : "",
          expiryDateTime: initialData.expiryDateTime ? new Date(initialData.expiryDateTime).toISOString().slice(0, 16) : "",
          isActive: initialData.isActive !== false,
          isPrivate: initialData.isPrivate || false,
          termsAndConditions: initialData.termsAndConditions || [""],
          highlights: initialData.highlights || [""],
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

  const handleArrayFieldChange = (field: "termsAndConditions" | "highlights", index: number, value: string) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    handleFieldChange(field, newArray);
  };

  const addArrayField = (field: "termsAndConditions" | "highlights") => {
    const newArray = [...(formData[field] || []), ""];
    handleFieldChange(field, newArray);
  };

  const removeArrayField = (field: "termsAndConditions" | "highlights", index: number) => {
    const newArray = (formData[field] || []).filter((_: any, i: number) => i !== index);
    handleFieldChange(field, newArray);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.offerName?.trim()) newErrors.offerName = "Offer name is required";
    if (!formData.couponCode?.trim()) newErrors.couponCode = "Coupon code is required";
    if (!formData.discountType) newErrors.discountType = "Discount type is required";
    if (!formData.value || formData.value <= 0) newErrors.value = "Discount value is required and must be greater than 0";
    if (!formData.discountedItemsType) newErrors.discountedItemsType = "Discount items type is required";

    if (formData.discountType === "percentage" && formData.value > 100) {
      newErrors.value = "Percentage discount cannot exceed 100%";
    }

    if (formData.startDateTime && formData.expiryDateTime) {
      if (new Date(formData.startDateTime) >= new Date(formData.expiryDateTime)) {
        newErrors.expiryDateTime = "Expiry date must be after start date";
      }
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
      // Clean up array fields - remove empty strings
      const cleanedTermsAndConditions = (formData.termsAndConditions || []).filter((term: string) => term.trim());
      const cleanedHighlights = (formData.highlights || []).filter((highlight: string) => highlight.trim());

      const processedData: CreateOfferRequest = {
        offerName: formData.offerName?.trim(),
        offerDesc: formData.offerDesc?.trim(),
        couponCode: formData.couponCode?.trim(),
        discountType: formData.discountType,
        value: Number(formData.value),
        discountedItemsType: formData.discountedItemsType,
        uptoAmountLimit: formData.uptoAmountLimit ? Number(formData.uptoAmountLimit) : undefined,
        minCartValue: formData.minCartValue ? Number(formData.minCartValue) : undefined,
        limit: formData.limit ? Number(formData.limit) : undefined,
        startDateTime: formData.startDateTime || undefined,
        expiryDateTime: formData.expiryDateTime || undefined,
        isActive: formData.isActive,
        isPrivate: formData.isPrivate,
        termsAndConditions: cleanedTermsAndConditions.length > 0 ? cleanedTermsAndConditions : undefined,
        highlights: cleanedHighlights.length > 0 ? cleanedHighlights : undefined,
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const clearAllFormData = () => {
    clearLocalStorage();
    const defaultData = {
      offerName: "",
      offerDesc: "",
      couponCode: "",
      discountType: "percentage",
      value: "",
      discountedItemsType: "allItems",
      uptoAmountLimit: "",
      minCartValue: "",
      limit: "",
      startDateTime: "",
      expiryDateTime: "",
      isActive: true,
      isPrivate: false,
      termsAndConditions: [""],
      highlights: [""],
    };
    setFormData(defaultData);
    toast.success("Form data cleared");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            minHeight: "80vh",
            maxHeight: "95vh",
            width: "95vw",
            maxWidth: "1000px",
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
                label="Offer Name"
                value={formData.offerName || ""}
                onChange={(e) => handleFieldChange("offerName", e.target.value)}
                error={!!errors.offerName}
                helperText={errors.offerName}
                required
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Coupon Code"
                value={formData.couponCode || ""}
                onChange={(e) => handleFieldChange("couponCode", e.target.value.toUpperCase())}
                error={!!errors.couponCode}
                helperText={errors.couponCode}
                required
                disabled={isLoading}
                placeholder="SAVE20"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Offer Description"
                value={formData.offerDesc || ""}
                onChange={(e) => handleFieldChange("offerDesc", e.target.value)}
                multiline
                rows={3}
                disabled={isLoading}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Discount Configuration Section */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Discount Configuration
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.discountType || ""}
                  label="Discount Type"
                  onChange={(e) => handleFieldChange("discountType", e.target.value)}
                  error={!!errors.discountType}
                  disabled={isLoading}
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="amount">Fixed Amount (₹)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={formData.discountType === 'percentage' ? "Discount Percentage" : "Discount Amount"}
                type="number"
                value={formData.value || ""}
                onChange={(e) => handleFieldChange("value", e.target.value)}
                error={!!errors.value}
                helperText={errors.value}
                required
                disabled={isLoading}
                inputProps={{ min: 0, max: formData.discountType === 'percentage' ? 100 : undefined }}
              />

              <FormControl fullWidth required>
                <InputLabel>Applies To</InputLabel>
                <Select
                  value={formData.discountedItemsType || ""}
                  label="Applies To"
                  onChange={(e) => handleFieldChange("discountedItemsType", e.target.value)}
                  error={!!errors.discountedItemsType}
                  disabled={isLoading}
                >
                  <MenuItem value="allItems">All Items</MenuItem>
                  <MenuItem value="totalCartValue">Total Cart Value</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Maximum Discount Amount (₹)"
                type="number"
                value={formData.uptoAmountLimit || ""}
                onChange={(e) => handleFieldChange("uptoAmountLimit", e.target.value)}
                disabled={isLoading}
                inputProps={{ min: 0 }}
                helperText="Optional: Maximum discount amount limit"
              />

              <TextField
                fullWidth
                label="Minimum Cart Value (₹)"
                type="number"
                value={formData.minCartValue || ""}
                onChange={(e) => handleFieldChange("minCartValue", e.target.value)}
                disabled={isLoading}
                inputProps={{ min: 0 }}
                helperText="Optional: Minimum cart value required"
              />

              <TextField
                fullWidth
                label="Usage Limit"
                type="number"
                value={formData.limit || ""}
                onChange={(e) => handleFieldChange("limit", e.target.value)}
                disabled={isLoading}
                inputProps={{ min: 0 }}
                helperText="Optional: Maximum number of uses"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Date & Status Configuration */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Date & Status Configuration
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                value={formData.startDateTime || ""}
                onChange={(e) => handleFieldChange("startDateTime", e.target.value)}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Expiry Date & Time"
                type="datetime-local"
                value={formData.expiryDateTime || ""}
                onChange={(e) => handleFieldChange("expiryDateTime", e.target.value)}
                error={!!errors.expiryDateTime}
                helperText={errors.expiryDateTime}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 3 }}>
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

              {/* <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPrivate || false}
                    onChange={(e) => handleFieldChange("isPrivate", e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Private Offer"
              /> */}
            </Box>
          </CardContent>
        </Card>

        {/* Terms and Conditions Section */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                Terms & Conditions
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => addArrayField("termsAndConditions")}
                disabled={isLoading}
              >
                Add Term
              </Button>
            </Box>

            {(formData.termsAndConditions || []).map((term: string, index: number) => (
              <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Term ${index + 1}`}
                  value={term}
                  onChange={(e) => handleArrayFieldChange("termsAndConditions", index, e.target.value)}
                  disabled={isLoading}
                  size="small"
                />
                {(formData.termsAndConditions || []).length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => removeArrayField("termsAndConditions", index)}
                    disabled={isLoading}
                    sx={{ color: "#dc2626" }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Highlights Section */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                Offer Highlights
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => addArrayField("highlights")}
                disabled={isLoading}
              >
                Add Highlight
              </Button>
            </Box>

            {(formData.highlights || []).map((highlight: string, index: number) => (
              <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Highlight ${index + 1}`}
                  value={highlight}
                  onChange={(e) => handleArrayFieldChange("highlights", index, e.target.value)}
                  disabled={isLoading}
                  size="small"
                />
                {(formData.highlights || []).length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => removeArrayField("highlights", index)}
                    disabled={isLoading}
                    sx={{ color: "#dc2626" }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </Box>
            ))}
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
          {isLoading ? "Saving..." : "Save Offer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OfferFormModal;