import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import '../config/firebase-config'; // Importa la configuración de Firebase
import axios from 'axios';

const auth = getAuth();

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true, message: 'Saioa hasi da.' };
  } catch (error: any) {
    const errorMessage = handleFirebaseError(error.code || 'unknown');
    return { success: false, message: errorMessage };
  }
};

export const registerUser = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log(userCredential); // Log the user credential for debugging
    /*
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
      username: email.split('@')[0],
      email: user.email,
      uid: user.uid,
    });
    */
    const response = {status: 200}; // Mock response for testing

    if (response.status === 200) {
      return { success: true, message: 'Erregistratuta.' };
    } else {
      return { success: false, message: 'Errorea erregistratzean.' };
    }

  } catch (error: any) {
    const errorMessage = handleFirebaseError(error.code || 'unknown');
    return { success: false, message: errorMessage };
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