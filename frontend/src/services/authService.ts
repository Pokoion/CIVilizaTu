import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import '../config/firebase-config'; // Importa la configuración de Firebase
import axios from 'axios';

const url = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const auth = getAuth();

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    const response = await axios.post(`${url}/api/auth/login`, {
      email: user.email,
      id_token: idToken,
    });
    if (response.status === 200) {
      localStorage.setItem('jwt_token', response.data.token);
      return { success: true, message: 'Saioa hasi da.' };
    } else {
      return { success: false, message: 'Errorea saioa hastean.' };
    }
  } catch (error: any) {
    console.log('Login error:', error);
    return { success: false, message: handleFirebaseError(error.code || 'unknown') };
  }
};

export const registerUser = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    const response = await axios.post(`${url}/api/auth/register`, {
      username: email.split('@')[0],
      email: user.email,
      id_token: idToken,
    });

    if (response.status === 201) {
      return { success: true, message: response.data.message || 'Erregistratuta.' };
    } else {
      await user.delete();
      return { success: false, message: response.data.error || 'Errorea erregistratzean.' };
    }
  } catch (error: any) {
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
    console.log('Register error:', error);
    return { success: false, message: handleFirebaseError(error.code || 'unknown') };
  }
};

const handleFirebaseError = (errorCode: string): string => {
  console.log('Firebase error code:', errorCode); // Log the error code for debugging
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email helbidea ez da zuzena.';
    case 'auth/invalid-credential':
      return 'Email edo pasahitza okerra da.';
    case 'auth/user-disabled':
      return 'Erabiltzaile hau desgaituta dago.';
    case 'auth/user-not-found':
      return 'Erabiltzailea ez da existitzen.';
    case 'auth/wrong-password':
      return 'Pasahitza okerra da.';
    case 'auth/too-many-requests':
      return 'Saiakera gehiegi. Mesedez, itxaron eta saiatu berriro.';
    case 'auth/email-already-in-use':
      return 'Email hau dagoeneko erregistratuta dago.';
    case 'auth/weak-password':
      return 'Pasahitza ahulegia da.';
    case 'auth/operation-not-allowed':
      return 'Erregistroa ez dago gaituta.';
    default:
      return 'Errore ezezaguna gertatu da.';
  }
};