import { useState } from 'react';
import { useLoginApi } from '../../api/api-hooks/useAuthApi';
import { useDispatch } from 'react-redux';
import { setIsLoggedIn, setUser } from '../../store/userSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LoginCredentials {
  email: string;
  password: string;
}

export const useLogin = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginMutation = useLoginApi();

  const updateCredentials = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await loginMutation.mutateAsync(credentials);
      
      if (response?.data?.response) {
        const userData = response.data.response.user;
        dispatch(setUser(userData));
        dispatch(setIsLoggedIn(true));
        toast.success('Login successful');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.response?.data?.message || 'Login failed');
    }
  };

  const resetForm = () => {
    setCredentials({
      email: '',
      password: '',
    });
  };

  return {
    credentials,
    updateCredentials,
    handleLogin,
    resetForm,
    isLoading: loginMutation.isPending,
  };
};