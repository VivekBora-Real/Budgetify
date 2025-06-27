import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import Category from '../models/category.model';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { createError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../utils/constants';

interface TokenPayload {
  userId: string;
  email: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private generateToken(payload: TokenPayload, secret: string, expiresIn: string): string {
    const options: SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign(payload, secret, options);
  }
  
  generateAuthTokens(user: IUser): AuthTokens {
    const payload: TokenPayload = {
      userId: (user._id as any).toString(),
      email: user.email
    };
    
    const accessToken = this.generateToken(
      payload,
      process.env.JWT_SECRET!,
      process.env.JWT_EXPIRE || '15m'
    );
    
    const refreshToken = this.generateToken(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      process.env.JWT_REFRESH_EXPIRE || '30d'
    );
    
    return { accessToken, refreshToken };
  }
  
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('User already exists', 400, ERROR_CODES.ALREADY_EXISTS);
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      profile: {
        firstName,
        lastName,
        currency: 'USD',
        timezone: 'UTC'
      }
    });
    
    // Create default categories for the user
    await this.createDefaultCategories((user._id as any).toString());
    
    // Generate tokens
    const tokens = this.generateAuthTokens(user);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return { user, tokens };
  }
  
  async login(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      throw createError('Invalid credentials', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }
    
    // Generate tokens
    const tokens = this.generateAuthTokens(user);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Remove password from response
    user.password = undefined as any;
    
    return { user, tokens };
  }
  
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as TokenPayload;
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw createError('User not found', 401, ERROR_CODES.UNAUTHORIZED);
      }
      
      // Generate new tokens
      return this.generateAuthTokens(user);
    } catch (error) {
      throw createError('Invalid refresh token', 401, ERROR_CODES.TOKEN_INVALID);
    }
  }
  
  async createDefaultCategories(userId: string): Promise<void> {
    const categories = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      userId,
      isDefault: true
    }));
    
    await Category.insertMany(categories);
  }
  
  async validateUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      throw createError('User not found', 404, ERROR_CODES.NOT_FOUND);
    }
    
    return user;
  }
}

export default new AuthService();