'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

/**
 * Estrutura simplificada do objeto User para a aplicação.
 */
export interface User {
  /** O endereço de e-mail do usuário. */
  email: string | null;
  /** O ID único do usuário. */
  uid: string;
}

/**
 * A forma do contexto de autenticação.
 */
interface AuthContextType {
  /** O usuário atualmente autenticado, ou nulo se não estiver logado. */
  user: User | null;
  /** Um booleano indicando se o estado de autenticação está sendo carregado. */
  loading: boolean;
  /** Função para logar um usuário com e-mail e senha. */
  login: (email: string, pass: string) => Promise<any>;
  /** Função para registrar um novo usuário com e-mail e senha. */
  register: (email: string, pass: string) => Promise<any>;
  /** Função para deslogar o usuário atual. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

/**
 * `AuthProvider` é um componente que fornece o estado de autenticação e funções
 * para seus filhos através de um contexto React. Ele encapsula a lógica do Firebase Auth.
 *
 * @param {object} props - As props do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos que terão acesso ao contexto de autenticação.
 * @returns {JSX.Element} O componente provedor de autenticação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(false);

  useEffect(() => {
    if (!auth || !db) {
      console.error("Firebase não está configurado. Verifique suas variáveis de ambiente.");
      setFirebaseError(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase not configured."));
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const register = (email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase not configured."));
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = () => {
    if (!auth) return Promise.reject(new Error("Firebase not configured."));
    return signOut(auth);
  };

  if (firebaseError) {
    return (
      <div className="flex h-screen items-center justify-center text-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-destructive">Erro de Configuração</h1>
          <p className="text-muted-foreground">
            A conexão com o banco de dados não pôde ser estabelecida.
            <br />
            Por favor, verifique a configuração do Firebase em suas variáveis de ambiente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de autenticação.
 *
 * @returns {AuthContextType} O valor do contexto de autenticação.
 */
export const useAuth = () => useContext(AuthContext);
