import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import '../config/firebase-config'; // Importa la configuración de Firebase
import axios from 'axios';

const auth = getAuth();

export const registerUser = async (email: string, password: string) => {
  try {
    // Registrar al usuario en Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Llamar al backend para registrar al usuario
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
      username: email.split('@')[0],
      email: user.email,
      uid: user.uid,
    });

    if (response.status === 201) {
      return { success: true, message: 'Erregistratu zara arrakastaz!' };
    } else {
      return { success: false, message: 'Errorea backend-ean: Erabiltzailea ezin izan da erregistratu.' };
    }
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, message: 'Email hau dagoeneko erregistratuta dago.' };
    } else if (error.code === 'auth/invalid-email') {
      return { success: false, message: 'Email helbide baliogabea.' };
    } else if (error.code === 'auth/weak-password') {
      return { success: false, message: 'Pasahitza ahulegia da. Gutxienez 6 karaktere izan behar ditu.' };
    } else if (error.response?.status === 400) {
      return { success: false, message: `Errorea backend-ean: ${error.response.data.message}` };
    } else {
      return { success: false, message: error?.message || 'Errore ezezaguna erregistratzean.' };
    }
  }
};
