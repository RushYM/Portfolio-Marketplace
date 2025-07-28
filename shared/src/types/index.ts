// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  location?: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  location?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Product Types
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  condition: ProductCondition;
  status: ProductStatus;
  location: string;
  sellerId: string;
  seller: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  condition: ProductCondition;
  location: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: ProductStatus;
}

// Enums
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  FASHION = 'fashion',
  HOME = 'home',
  BOOKS = 'books',
  SPORTS = 'sports',
  BEAUTY = 'beauty',
  TOYS = 'toys',
  OTHER = 'other'
}

export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export enum ProductStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  DELETED = 'deleted'
}

// Chat Types
export interface ChatRoom {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: ChatMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  message: string;
  messageType: MessageType;
  createdAt: Date;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SYSTEM = 'system'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search & Filter Types
export interface ProductSearchParams {
  query?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'title';
  sortOrder?: 'asc' | 'desc';
} 