export interface Category {
    _id: string;
    name: string;
    slug: string;
    parent?: Category | null;
    level: number;
    description?: string;
    image?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface CreateCategoryRequest {
    name: string;
    slug: string;
    parent?: string;
    level?: number;
    description?: string;
    image?: string;
    isActive?: boolean;
    displayOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
    _id: string;
}