/**
 * @file Este arquivo inicializa e configura os serviços do Firebase usados na aplicação.
 * Ele inicializa o Firebase condicionalmente, apenas se todas as variáveis de ambiente necessárias estiverem presentes,
 * evitando erros durante o desenvolvimento ou build se a configuração estiver incompleta.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Objeto de configuração do Firebase, preenchido a partir de variáveis de ambiente.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verifica se todos os valores de configuração do Firebase estão presentes.
const areAllConfigValuesPresent = Object.values(firebaseConfig).every(value => !!value);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Inicializa o Firebase apenas se todos os valores de configuração estiverem presentes.
if (areAllConfigValuesPresent) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
    // Adverte o desenvolvedor em ambientes que não são de produção se a configuração estiver faltando.
    if (process.env.NODE_ENV !== 'production') {
        console.warn("A configuração do Firebase está incompleta. Os serviços do Firebase serão desativados.");
    }
}

/**
 * Serviços do Firebase exportados.
 * Nota: Eles podem ser nulos se a configuração estiver faltando.
 * A aplicação deve lidar com isso de forma apropriada.
 */
export { app, auth, db };
