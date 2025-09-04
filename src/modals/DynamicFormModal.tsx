import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { X } from 'lucide-react';

export interface FormField {
  field: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'boolean' | 'date' | 'custom';
  required?: boolean;
  options?: { value: any; label: string }[];
  customRenderer?: (value: any, onChange: (value: any) => void, error?: string) => React.ReactNode;
  validation?: (value: any) => string | null;
}

interface DynamicFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
}

const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  open,
  onClose,
  title,
  fields,
  initialData = {},
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      const defaultData: Record<string, any> = {};
      fields.forEach(field => {
        defaultData[field.field] = initialData[field.field] || 
          (field.type === 'boolean' ? false : 
           field.type === 'number' ? 0 : '');
      });
      setFormData(defaultData);
      setErrors({});
    }
  }, [open, initialData, fields]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.field];
      
      // Required field validation
      if (field.required && (!value || value === '')) {
        newErrors[field.field] = `${field.label} is required`;
      }
      
      // Custom validation
      if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.field] = validationError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.field] || '';
    const error = errors[field.field];

    switch (field.type) {
      case 'select':
        return (
          <FormControl fullWidth margin="normal" error={!!error}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleFieldChange(field.field, e.target.value)}
              disabled={isLoading}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && (
              <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {error}
              </Box>
            )}
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => handleFieldChange(field.field, e.target.checked)}
                disabled={isLoading}
              />
            }
            label={field.label}
            sx={{ mt: 2, mb: 1 }}
          />
        );

      case 'custom':
        if (field.customRenderer) {
          return (
            <Box key={field.field} sx={{ mt: 2, mb: 1 }}>
              {field.customRenderer(
                value,
                (newValue) => handleFieldChange(field.field, newValue),
                error
              )}
            </Box>
          );
        }
        return null;

      default:
        return (
          <TextField
            fullWidth
            margin="normal"
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.field, e.target.value)}
            error={!!error}
            helperText={error}
            required={field.required}
            disabled={isLoading}
          />
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: '300px' }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {fields.map((field) => (
            <Box key={field.field} sx={{ mb: 2 }}>
              {renderField(field)}
            </Box>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DynamicFormModal;