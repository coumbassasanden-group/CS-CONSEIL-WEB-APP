// TypeScript interfaces generated from Prisma schema

// For Decimal type, you can use Prisma's Decimal or number in DTOs
type Decimal = any; // Will be replaced by Prisma's Decimal type at runtime

// ==================== ENUMS ====================

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum NewsStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// ==================== MODELS ====================

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithSubscriptions extends User {
  subscriptions: Subscription[];
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: Decimal;
  duration: number; // Duration in days
  features: any | null; // JSON type - can be typed more specifically based on your feature structure
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanWithSubscriptions extends Plan {
  subscriptions: Subscription[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date | null;
  endDate: Date | null;
  autoRenew: boolean;
  paymentMethod: string | null;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionWithRelations extends Subscription {
  user: User;
  plan: Plan;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string | null;
  author: string | null;
  imageUrl: string | null;
  status: NewsStatus;
  publishedAt: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== DTOs (Data Transfer Objects) ====================

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Plan DTOs
export interface CreatePlanDto {
  name: string;
  description?: string;
  price: number | string | Decimal;
  duration: number;
  features?: any;
  isActive?: boolean;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
  price?: number | string | Decimal;
  duration?: number;
  features?: any;
  isActive?: boolean;
}

// Subscription DTOs
export interface CreateSubscriptionDto {
  userId: string;
  planId: string;
  paymentMethod?: string;
  transactionId?: string;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionDto {
  status?: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
  autoRenew?: boolean;
  paymentMethod?: string;
  transactionId?: string;
}

export interface RenewSubscriptionDto {
  paymentMethod?: string;
  transactionId?: string;
}

// News DTOs
export interface CreateNewsDto {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  author?: string;
  imageUrl?: string;
  status?: NewsStatus;
}

export interface UpdateNewsDto {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  author?: string;
  imageUrl?: string;
  status?: NewsStatus;
  publishedAt?: Date;
}

// ==================== PAGINATION ====================

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: UserResponseDto;
  token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends CreateUserDto {}

// ==================== SUBSCRIPTION SPECIFIC TYPES ====================

/**
 * Interface pour le formulaire d'abonnement
 */
export interface SubscriptionFormData {
  planId: number | null
  email: string
  firstName: string
  lastName: string
  company: string
  phone: string
  studentProof: File | null
  acceptTerms: boolean
  newsletter: boolean
}

/**
 * Interface pour les plans d'abonnement avec métadonnées UI
 */
export interface PlanUI extends Plan {
  nameKey?: string
  periodKey?: string
  rawFeatures?: string[]
  color?: string
  popular?: boolean
  icon?: string
  validation?: string
  requiresProof?: boolean
}

/**
 * Interface pour l'abonnement actuel
 */
export interface CurrentSubscriptionUI {
  isActive: boolean
  plan: Plan | PlanUI
  startDate: Date | null
  endDate: Date | null
  autoRenew: boolean
}

/**
 * Interface pour les témoignages
 */
export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  avatar: string
  rating: number
  comment: string
  date?: string
}

/**
 * Interface pour les FAQ
 */
export interface FAQ {
  id: number
  question: string
  answer: string
}

/**
 * Interface pour les statistiques d'abonnement
 */
export interface SubscriptionStats {
  subscribers: string
  editions: string
  satisfaction: string
  years: string
}

/**
 * Interface pour un plan normalisé (après parsing des données API)
 * Tous les champs sont correctement typés (prix en nombre, features en tableau, etc.)
 */
export interface NormalizedPlan extends Plan {
  price: number // Converti en nombre
  features: string[] // Parsé en tableau depuis JSON string
  duration: number // Converti en nombre
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Réponse de l'API pour la récupération des plans
 */
export interface PlansApiResponse {
  data: Plan[]
  meta: PaginationMeta
}

/**
 * Réponse de l'API pour un plan unique
 */
export interface PlanApiResponse {
  data: Plan
  message?: string
}

/**
 * Réponse de l'API pour les abonnements
 */
export interface SubscriptionApiResponse {
  data: Subscription | Subscription[]
  message?: string
  meta?: PaginationMeta
}

/**
 * Réponse pour vérification d'email existant
 */
export interface CheckEmailResponse {
  exists: boolean
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

/**
 * Payload pour l'enregistrement d'un nouvel utilisateur
 */
export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

/**
 * Réponse d'enregistrement d'utilisateur
 */
export interface RegisterResponse {
  user?: User
  token?: string
  success?: boolean
  message?: string
  error?: string
}
