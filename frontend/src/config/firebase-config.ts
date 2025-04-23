import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCr2pxN5G1xnohKzwRtI1qtUNCvuDAB1ko",
    authDomain: "t3praktika.firebaseapp.com",
    projectId: "t3praktika",
    storageBucket: "t3praktika.firebasestorage.app",
    messagingSenderId: "807000460053",
    appId: "1:807000460053:web:a0f7c9e66e1e771882771c",
    measurementId: "G-VS06MC55X4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default app;
