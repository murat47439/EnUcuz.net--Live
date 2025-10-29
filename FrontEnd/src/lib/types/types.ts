

export interface Message{
    success: boolean,
    message: string,
    data?: unknown,
}
export interface Category{
    id : number,
    name: string,
    parent_id: number,
    created_at: string
}
export interface Favorite{
    id: number,
    user_id: number,
    product_id: number,
    product: Product,
    created_at:string,
    deleted_at : string
}
export type Features = { key: FeatureKey; value: string; }[];
export type FeatureKey = {
    label : string,
     value: number
}
export interface Product{
    id?: number,
    name:string,
    description:string,
    stock:number,
    price: number,
    brand_name?: string,
    brand_id: number,
    seller_id?: number,
    seller_name?: string,
    seller_phone?: string,
    features?: Features,
    image_url: string,
    category_id: number,
    category_name?: string,
    status?: number,
    created_at?: { Time: string; Valid: boolean; };
    updated_at?: { Time: string; Valid: boolean; };
}
export interface Favorites{
    success: boolean,
    message: string,
    data: {
        products: Product[],
        pagination?: { 
            page: number,
        }
    }
}
export interface UserProducts{
    success: boolean,
    message: string,
    data: {
        products: Product[],
    }
}
export interface Brand{
    id: number,
    name: string,
    deleted_at: string,
    created_at: string
}
export interface Brands{
    success: boolean,
    message: string,
    data: {
        brands: Brand[],
        pagination?: {
            page: number,
            search?: string,
        }
    }
}
export interface Chat{
    id: number,
    sender: number,
    recipient: number,
    channel_id: number,
    product_id: number
}
export interface Chats{
    success: boolean,
    message: string,
    data: {
        chats: Chat[],
        pagination?: {
            page: number,
        }
    }
}
export interface ChatResponse{
    success: boolean,
    message: string,
    data: {
        chat: Chat,
        message: string
    }
}
export interface ChatMessage{
    id: number,
    chat_id: number,
    content: string,
    sender: number
}
export interface ChatMessages{
    success: boolean,
    message: string,
    data: {
        messages: ChatMessage[]
    }
}
export interface NewChat{
    chat: Chat,
    message: ChatMessage,
} 
export interface Review{
    id: number,
    user_id: number,
    product_id: number,
    content: string,
    rating: number,
    created_at: string,
    updated_at: string
}
export interface IdParam{
    id : number 
}
export interface CreateCategoryRequest{
    name: string,
    parent_id: number,
}
export interface CompareProductsRequest{
    id: number,
    id2: number
}
export interface CreateCategoryResponse{
    success: boolean,
    message: string,
    data: {
        category: Category
    }
}
export interface CategoriesListResponse{
    success: boolean,
    message: string,
    data: {
        categories: Category[],
        pagination?: {
            page: number,
            search?: string,
        }
    }
}
export interface ProductsListResponse{
    success: boolean,
    message: string,
    data: {
        products: Product[],
        pagination?: {
            page: number,
            search?: string,
            brand?: number,
            category?: number,
        }
    }
}
export interface PaginationRequest{
    page?: number,
    search?: string,
    brand?:number,
    category?:number,
}
export interface UpdateCategoryRequest{
    id: number,
    name: string,
    parent_id: number
}
export interface AddFavoriteRequest{
    id: number
}
export interface ProductDetail{    
data: {Product: Product,
Attribute: ProductAttribute[]
}
    }

export interface Attribute{
    id: number,
    name: string,
}
export interface AddAttributeRes{
    success: boolean,
    message: string,
    data: {
        attribute: Attribute
    }
}
export interface AddProdAttribute{
    product: Product,
    category_attribute: CategoryAttribute,
    Value: string,
}
export interface ProdAttributeRes{
    success: boolean,
    message: string,
    data: {
        attribute: ProductAttribute
    }
}
export interface ProductAttribute{
    id: number,
    attribute_id:number,
    attribute_name: string,
    product_id:number,
    value: string,
}
export interface CategoryAttribute{
    category_id: number,
    category_name: string,
    attribute_id: number,
    attribute_name: string,
    allow_custom: boolean,
    required: boolean,
    varianter: boolean,
    slicer: boolean,
}
export interface CategoryAttributeRes{
    success: boolean,
    message: string,
    data: {
        category_attributes: CategoryAttribute[]
    }
}
export interface ProductDetailResponse{
    success: boolean,
    message: string,
    data: {
        product: ProductDetail,
    }
}
export interface UpdateProductRequest{
    id : number,
    name: string,
    image_url: string,
    brand_id: number,
    category_id: number,
}
export interface UpdateProductResponse{
    success: boolean,
    message: string,
    data: {
        product: Product
    }
}
export interface CreateReviewRequest{
    product_id : number,
    content : string,
    rating: number
}
export interface UpdateReviewStatusRequest{
    id: number,
    status: number 
}
export interface ReviewsListResponse{
    success: boolean,
    message: string,
    data: {
        reviews: Review[],
        pagination?: {
            page: number,
            product_id?: number,
        }
    }
}
export interface ReviewDetailResponse{
    success: boolean,
    message: string,
    data: {
        review: Review
    }
}
export interface UpdateReviewRequest{
    id : number,
    product_id: number,
    content: string,
    rating: number
}
export interface LoginRequest{
    email : string,
    password : string,
}
export interface UserProfileResponse{
    success: boolean,
    message: string,
    data: {
        user: {
            id: number,
            email: string,
            phone: string,
            name: string,
            surname: string,
            gender: number,
        }
    }
}
export interface RegisterRequest{
    name : string,
    surname: string,
    email: string,
    phone: string,
    password: string
}
export interface RegisterResponse{
    success: boolean,
    message: string,
    data?: unknown
}
export interface UpdateUserRequest{
    id: number,
    email : string,
    name : string,
    surname : string,
    phone: string,
    gender?: number,
}

export interface UpdateUserResponse{
    success: boolean,
    message: string,
    data: {
        user: {
            email: string,
            id: number,
            name: string,
            phone: string,
            surname: string,
        }
    }
}

// Additional response types for modernized API
export interface LoginResponse{
    success: boolean,
    message: string,
    data: {
        user: {
            id: number,
            email: string,
            phone: string,
            name: string,
            surname: string,
            gender: number,
        }
    }
}

export interface LogoutResponse{
    success: boolean,
    message: string,
    data?: unknown
}

export interface RefreshTokenResponse{
    success: boolean,
    message: string,
    data?: unknown
}

export interface BrandResponse{
    success: boolean,
    message: string,
    data: {
        brand: Brand
    }
}

export interface CategoryResponse{
    success: boolean,
    message: string,
    data: {
        category: Category
    }
}

export interface ProductResponse{
    success: boolean,
    message: string,
    data: {
        product: Product
    }
}

export interface ChatExistsResponse{
    success: boolean,
    message: string,
    data: {
        chat_exists: boolean
    }
}

export interface NewMessageResponse{
    success: boolean,
    message: string,
    data: {
        message: string
    }
}

export interface FavoriteResponse{
    success: boolean,
    message: string,
    data?: unknown
}

export interface ReviewResponse{
    success: boolean,
    message: string,
    data?: unknown
}

export interface AttributeResponse{
    success: boolean,
    message: string,
    data: {
        attributes: Attribute[]
    }
}

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    duration?: number;
}

export interface ToastContextType {
    showNotification: (message: string, type: NotificationType, duration?: number) => void;
}