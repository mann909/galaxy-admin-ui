import { useState, useEffect } from "react";
import { GridParams } from "../components/data-grid/DynamicDataGrid";

export const useGridSettings = (pageKey: string, defaultPageSize: number = 10, onParamsChange?: (params: GridParams) => void) => {
  const [currentParams, setCurrentParams] = useState<GridParams>({
    page: 0,
    pageSize: defaultPageSize,
    sortModel: [],
    filterModel: { items: [] },
  });

  // Load pageSize from localStorage on mount
  useEffect(() => {
    const savedPageSize = localStorage.getItem(`grid_pageSize_${pageKey}`);
    if (savedPageSize) {
      const pageSize = parseInt(savedPageSize, 10);
      if (pageSize > 0) {
        setCurrentParams(prev => ({ ...prev, pageSize }));
      }
    }
  }, [pageKey]);

  // Save pageSize to localStorage when it changes
  const handleParamsChange = (params: GridParams) => {
    if (params.pageSize !== currentParams.pageSize) {
      localStorage.setItem(`grid_pageSize_${pageKey}`, params.pageSize.toString());
    }
    setCurrentParams(params);
    onParamsChange?.(params);
  };

  return { currentParams, setCurrentParams, handleParamsChange };
};