import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { seedUserData } from '../firebase/seed';
import { User } from '../types';

export const useAuth = () => {
  return {
    user: { uid: 'mock-user-123', email: 'test@example.com' } as any,
    userData: {
      id: 'mock-user-123',
      email: 'test@example.com',
      name: 'Demo User',
      settings: {
        theme: 'light',
        language: 'es',
        notifications: true
      },
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    } as User,
    loading: false,
    error: undefined,
  };
};
