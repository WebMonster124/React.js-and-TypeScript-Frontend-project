import { User, UserUpdates } from '../../types';
import axios from './axios';

export const getUsers = async (): Promise<User[]> => {
  const res = await axios.get('/users');
  if (!res.data?.success) throw res.data?.error;
  return res.data?.items || [];
};

export const addUser = async (data: {
  password: string;
  group: string;
  userAttributes: {
    [key: string]: string;
  };
}): Promise<void> => {
  const res = await axios.post('/users', data);
  if (!res.data?.success) throw res.data?.error;
};

export const updateUser = async (data: UserUpdates): Promise<void> => {
  const res = await axios.put('/users', data);
  if (!res.data?.success) throw res.data?.error;
};

export const deleteUser = async (email: string): Promise<void> => {
  const res = await axios.delete('/users', { params: { email } });
  if (!res.data?.success) throw res.data?.error;
};
