import { User, IUser } from './auth.model';

export const authRepository = {
  findByEmail: (email: string) => User.findOne({ email }),
  findByEmailWithPassword: (email: string) => User.findOne({ email }).select('+password'),
  findById: (id: string) => User.findById(id),
  create: (data: Pick<IUser, 'name' | 'email' | 'password'>) => User.create(data),
};
