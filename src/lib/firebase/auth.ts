import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './config';

export const signUpWithEmail = (email: string, pass: string) => {
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const signInWithEmail = (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const sendPasswordReset = (email: string) => {
  return firebaseSendPasswordResetEmail(auth, email);
};
