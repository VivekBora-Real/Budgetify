import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload extends JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DateRangeQuery {
  dateFrom?: string;
  dateTo?: string;
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface SuccessResponse<T = any> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}