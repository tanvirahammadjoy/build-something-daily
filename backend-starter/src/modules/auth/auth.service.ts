import { AppError } from '../../utils/AppError';
import { signToken } from '../../lib/jwt';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.schema';

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const user = await authRepository.create(input);
    const token = signToken({ id: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmailWithPassword(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken({ id: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  async getProfile(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { id: user.id, name: user.name, email: user.email };
  },
};
