import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type AuthError,
} from "firebase/auth";
import { auth } from "./firebase";

// Re-export User type for use in other files
export type { User };

export interface AuthErrorWithCode extends Error {
  code?: string;
  message: string;
}

const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Email уже используется";
    case "auth/invalid-email":
      return "Неверный формат email";
    case "auth/operation-not-allowed":
      return "Операция не разрешена";
    case "auth/weak-password":
      return "Пароль слишком слабый";
    case "auth/user-disabled":
      return "Пользователь заблокирован";
    case "auth/user-not-found":
      return "Пользователь не найден";
    case "auth/wrong-password":
      return "Неверный пароль";
    case "auth/invalid-credential":
      return "Неверные учетные данные";
    case "auth/too-many-requests":
      return "Слишком много попыток. Попробуйте позже";
    default:
      return error.message || "Произошла ошибка";
  }
};

export const register = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const authError = error as AuthError;
    const errorWithMessage: AuthErrorWithCode = {
      ...new Error(getErrorMessage(authError)),
      code: authError.code,
      message: getErrorMessage(authError),
    };
    throw errorWithMessage;
  }
};

export const login = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const authError = error as AuthError;
    const errorWithMessage: AuthErrorWithCode = {
      ...new Error(getErrorMessage(authError)),
      code: authError.code,
      message: getErrorMessage(authError),
    };
    throw errorWithMessage;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    const errorWithMessage: AuthErrorWithCode = {
      ...new Error(getErrorMessage(authError)),
      code: authError.code,
      message: getErrorMessage(authError),
    };
    throw errorWithMessage;
  }
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): (() => void) => {
  if (!auth) {
    console.warn('Auth not initialized, calling callback with null');
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

