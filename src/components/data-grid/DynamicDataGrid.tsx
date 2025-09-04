import React, { useState, useCallback, useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridFilterModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  TextField,
} from '@mui/material';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export interface DynamicColumn extends Omit<GridColDef, 'field'> {
  field: string;
  headerName: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'actions';
  editable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  flex?: number;
  renderEditCell?: (params: any) => React.ReactNode;
  renderAddCell?: (params: any) => React.ReactNode;
}

export interface GridData {
  rows: any[];
  totalCount: number;
}

export interface GridParams {
  page: number;
  pageSize: number;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
  quickFilterValue?: string;
}

interface DynamicDataGridProps {
  id: string;
  title: string;
  columns: DynamicColumn[];
  data: GridData;
  loading?: boolean;
  onParamsChange: (params: GridParams) => void;
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onView?: (row: any) => void;
  onDelete?: (id: string | number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  height?: number; // Added height prop for flexibility
}

function CustomToolbar({
  title,
  onAdd,
  quickFilterValue,
  onQuickFilterChange,
}: {
  title: string;
  onAdd?: () => void;
  quickFilterValue?: string;
  onQuickFilterChange?: (value: string) => void;
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      p: 2,
      py:1,
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      borderRadius: '12px 12px 0 0',
      minHeight: '60px', // Fixed height for toolbar
    }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
          {title}
        </Typography>
        {onAdd && (
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={onAdd}
            size="medium"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              px: 2,
            }}
          >
            Add New
          </Button>
        )}
      </Box>
      {/* {onQuickFilterChange && (
        <TextField
          size="small"
          placeholder="Search..."
          value={quickFilterValue || ''}
          onChange={(e) => onQuickFilterChange?.(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      )} */}
    </Box>
  );
}

const DynamicDataGrid: React.FC<DynamicDataGridProps> = ({
  id,
  title,
  columns,
  data,
  loading = false,
  onParamsChange,
  onAdd,
  onView,
  onEdit,
  onDelete,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  height = 670, // Default height with prop override
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [quickFilterValue, setQuickFilterValue] = useState('');

  // Load persisted column widths
  const storedWidths = useMemo(() => {
    try {
      const saved = localStorage.getItem(`gridWidths_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, [id]);

  // Load persisted column visibility
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(() => {
    try {
      const saved = localStorage.getItem(`gridVisibility_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Enhanced columns with actions and persisted widths
  const [columnDefs, setColumnDefs] = useState<GridColDef[]>(() => {
    let cols = columns.map((col) => {
      const baseCol = {
        ...col,
        flex: col.flex || 1,
      };
      
      if (storedWidths[col.field]) {
        return { ...baseCol, width: storedWidths[col.field], flex: undefined };
      }
      return baseCol;
    });
    
    if (onEdit || onDelete || onView) {
      cols.push({
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        headerAlign: 'center',
        align:'center',
        flex: undefined,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box display="flex" alignContent="center" alignItems="center"  justifyContent="center" gap={0.5}>
            {onView && (
              <IconButton
                size="small"
                onClick={() => onView(params.row)}
                sx={{ 
                  color: '#3b82f6',
                  padding: '10px',
                  '&:hover': { backgroundColor: '#eff6ff' }
                }}
              >
                <Eye size={22} />
              </IconButton>
            )}
            {onEdit && (
              <IconButton
                size="small"
                onClick={() => onEdit(params.row)}
                sx={{ 
                  color: '#3b82f6',
                  padding: '10px',
                  '&:hover': { backgroundColor: '#eff6ff' }
                }}
              >
                <Edit size={22} />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(params.row.id || params.row._id)}
                sx={{ 
                  color: '#dc2626',
                  padding: '10px',
                  '&:hover': { backgroundColor: '#fef2f6' }
                }}
              >
                <Trash2 size={22} />
              </IconButton>
            )}
          </Box>
        ),
      });
    }
    
    return cols;
  });

  // Handle column resize
  const handleColumnResize = useCallback((params: { colDef: GridColDef; width: number }) => {
    setColumnDefs((prev) =>
      prev.map((col) =>
        col.field === params.colDef.field
          ? { ...col, width: params.width, flex: undefined }
          : col
      )
    );

    try {
      // Read the latest from localStorage to avoid overwriting other changes
      const currentWidths = (() => {
        try {
          const saved = localStorage.getItem(`gridWidths_${id}`);
          return saved ? JSON.parse(saved) : {};
        } catch {
          return {};
        }
      })();
      const updatedWidths = {
        ...currentWidths,
        [params.colDef.field]: params.width,
      };
      localStorage.setItem(`gridWidths_${id}`, JSON.stringify(updatedWidths));
    } catch (error) {
      console.warn('Failed to save column widths:', error);
    }
  }, [id]);

  // Handle column visibility changes
  const handleVisibilityChange = useCallback((newModel: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(newModel);
    try {
      localStorage.setItem(`gridVisibility_${id}`, JSON.stringify(newModel));
    } catch (error) {
      console.warn('Failed to save column visibility:', error);
    }
  }, [id]);

  // Debounced params change handler
  const debouncedParamsChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (params: GridParams) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onParamsChange(params);
        }, 300);
      };
    })(),
    [onParamsChange]
  );

  // Handle pagination change
  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
    debouncedParamsChange({
      page: newModel.page,
      pageSize: newModel.pageSize,
      sortModel,
      filterModel,
      quickFilterValue,
    });
  };

  // Handle sort change
  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel);
    debouncedParamsChange({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      sortModel: newModel,
      filterModel,
      quickFilterValue,
    });
  };

  // Handle filter change
  const handleFilterModelChange = (newModel: GridFilterModel) => {
    setFilterModel(newModel);
    debouncedParamsChange({
      page: 0,
      pageSize: paginationModel.pageSize,
      sortModel,
      filterModel: newModel,
      quickFilterValue,
    });
  };

  // Handle quick filter change
  const handleQuickFilterChange = (value: string) => {
    setQuickFilterValue(value);
    debouncedParamsChange({
      page: 0,
      pageSize: paginationModel.pageSize,
      sortModel,
      filterModel,
      quickFilterValue: value,
    });
  };

  // Calculate grid height (total height minus toolbar height)
  const gridHeight = height - 60; // 72px for toolbar

  const dataGridStyling = {
    height: height, // Use the height prop
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    overflow: 'hidden', // Prevent outer scrolling
    
    '& .MuiDataGrid-root': {
      border: 'none',
      borderRadius: '0 0 12px 12px', // Only bottom corners rounded
      fontSize: '14px',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      backgroundColor: '#ffffff',
      height: `${gridHeight}px`, // Set explicit height for grid area
      minHeight: `${gridHeight}px`,
      maxHeight: `${gridHeight}px`,
    },
    
    '& .MuiDataGrid-main': {
      borderRadius: '0 0 12px 12px',
    },
    
    '& .MuiDataGrid-cell': {
      display: 'flex',
      borderBottom: '1px solid #f1f5f9',
      padding: '16px 12px',
      alignItems: 'center',
      justifyContent: 'flex-start',  
      fontSize: '14px',
      fontWeight: '500',
      color: '#334155',
      transition: 'all 0.2s ease-in-out',
      '&:focus': {
        outline: 'none',
        backgroundColor: '#f8fafc',
      },
      '&:focus-within': {
        outline: '2px solid #3b82f6',
        outlineOffset: '-2px',
      },
    },
    
    '& .MuiDataGrid-row': {
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      padding: '2px 5px',
      '&:hover': {
        backgroundColor: '#f8fafc',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        cursor: 'default',
      },
      '&.Mui-selected': {
        backgroundColor: '#eff6ff',
        '&:hover': {
          backgroundColor: '#dbeafe',
        },
      },
      '&:last-child .MuiDataGrid-cell': {
        borderBottom: 'none',
      },
    },
    
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontWeight: '700',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #e2e8f0',
      minHeight: '56px !important',
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: '700',
        fontSize: '13px',
      },
      '& .MuiDataGrid-columnSeparator': {
        color: '#cbd5e1',
      },
    },
    
    '& .MuiDataGrid-columnHeader': {
      '&:focus': {
        outline: 'none',
      },
      '&:focus-within': {
        outline: 'none',
      },
    },
    
    '& .MuiDataGrid-footerContainer': {
      borderTop: '2px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      padding: '0px 3px',
      borderRadius: '0 0 12px 12px',
      '& .MuiTablePagination-root': {
        color: '#64748b',
        overflow: 'hidden',
        height:'50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
      '& .MuiTablePagination-selectLabel': {
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569',
      },
      '& .MuiTablePagination-displayedRows': {
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569',
      },
      '& .MuiSelect-select': {
        fontSize: '14px',
        padding: '6px 8px',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        '&:focus': {
          backgroundColor: '#ffffff',
          borderColor: '#3b82f6',
        },
      },
      '& .MuiIconButton-root': {
        color: '#3b82f6',
        padding: '0px',
        borderRadius: '8px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: '#eff6ff',
          transform: 'translateY(-1px)',
        },
        '&.Mui-disabled': {
          color: '#cbd5e1',
          '&:hover': {
            backgroundColor: 'transparent',
            transform: 'none',
          },
        },
      },
    },
    
    '& .MuiDataGrid-selectedRowCount': {
      display: 'none',
    },
    
    '& .MuiDataGrid-virtualScroller': {
      '&::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#f1f5f9',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#cbd5e1',
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: '#94a3b8',
        },
      },
    },
    
    '& .MuiDataGrid-overlay': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(2px)',
    },
    
    '& .MuiDataGrid-menuIcon': {
      color: '#64748b',
      '&:hover': {
        color: '#3b82f6',
      },
    },
    
    '& .MuiCheckbox-root': {
      color: '#64748b',
      '&.Mui-checked': {
        color: '#3b82f6',
      },
      '&:hover': {
        backgroundColor: '#eff6ff',
      },
    },
    
    '& .MuiDataGrid-sortIcon': {
      color: '#64748b',
      '&.MuiDataGrid-sortIcon--desc': {
        color: '#3b82f6',
      },
      '&.MuiDataGrid-sortIcon--asc': {
        color: '#3b82f6',
      },
    },
    
    '& .MuiDataGrid-filterIcon': {
      color: '#64748b',
      '&:hover': {
        color: '#3b82f6',
      },
    },
  };

  return (
    <Paper sx={dataGridStyling}>
      <CustomToolbar
        title={title}
        onAdd={onAdd}
        quickFilterValue={quickFilterValue}
        onQuickFilterChange={handleQuickFilterChange}
      />
      
      <Box sx={{ flex: 1, minHeight: 0 }}> {/* Flex container for proper sizing */}
        <DataGrid
          rows={data.rows}
          columns={columnDefs}
          getRowId={(row) => row._id || row.id}
          loading={loading}
          disableRowSelectionOnClick
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          rowCount={data.totalCount}
          pageSizeOptions={pageSizeOptions}
          onColumnWidthChange={handleColumnResize}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={handleVisibilityChange}
          sx={{
            height: '100%', // Fill the flex container
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default DynamicDataGrid;