interface BackendResponse<T> {
  data: T;
  message: string;
  status: string;
}

interface PaginationResponse<T> {
  docs: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface Params {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
