'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import type { FutureExpense } from '@/types';
import { useToast } from '@/hooks/use-toast';

/**
 * A forma do contexto de despesa futura.
 */
interface FutureExpenseContextType {
  /** Um array das despesas futuras do usuário. */
  futureExpenses: FutureExpense[];
  /** Um booleano indicando se as despesas futuras estão sendo carregadas. */
  loading: boolean;
  /** Função para adicionar uma nova despesa futura. */
  addFutureExpense: (values: Omit<FutureExpense, 'id'>) => Promise<void>;
  /** Função para atualizar uma despesa futura existente. */
  updateFutureExpense: (id: string, values: Omit<FutureExpense, 'id'>) => Promise<void>;
  /** Função para deletar uma despesa futura. */
  deleteFutureExpense: (id: string) => Promise<void>;
}

const FutureExpenseContext = createContext<FutureExpenseContextType>({
  futureExpenses: [],
  loading: true,
  addFutureExpense: async () => {},
  updateFutureExpense: async () => {},
  deleteFutureExpense: async () => {},
});

/**
 * `FutureExpenseProvider` é um componente que fornece dados e funções de gerenciamento para "Contas a Pagar"
 * para seus filhos. Ele lida com todas as interações do Firestore para despesas futuras.
 *
 * @param {object} props - As props do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos que terão acesso ao contexto.
 * @returns {JSX.Element} O componente provedor de despesa futura.
 */
export function FutureExpenseProvider({ children }: { children: ReactNode }) {
  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setFutureExpenses([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'futureExpenses'), orderBy('description'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData: FutureExpense[] = [];
       if (querySnapshot.empty) {
        setLoading(false);
      }
      querySnapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() } as FutureExpense);
      });
      setFutureExpenses(expensesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching future expenses:", error);
      toast({ variant: 'destructive', title: 'Erro ao buscar contas', description: 'Não foi possível carregar as contas a pagar.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const addFutureExpense = async (values: Omit<FutureExpense, 'id'>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Você precisa estar logado para adicionar uma conta.' });
      return;
    }
    try {
      await addDoc(collection(db, 'users', user.uid, 'futureExpenses'), values);
      toast({
          title: 'Conta a pagar adicionada!',
          description: 'Sua nova conta foi salva com sucesso.',
      });
    } catch (error) {
      console.error("Error adding future expense: ", error);
      toast({ variant: 'destructive', title: 'Erro ao adicionar conta', description: 'Não foi possível salvar a nova conta.' });
    }
  };
  
  const updateFutureExpense = async (id: string, values: Omit<FutureExpense, 'id'>) => {
    if (!user) return;
    const expenseDocRef = doc(db, 'users', user.uid, 'futureExpenses', id);
    try {
      await updateDoc(expenseDocRef, values);
      toast({
          title: 'Conta atualizada!',
          description: 'As informações da sua conta foram atualizadas.',
      });
    } catch (error) {
       console.error("Error updating future expense: ", error);
       toast({ variant: 'destructive', title: 'Erro ao atualizar conta', description: 'Não foi possível salvar as alterações.' });
    }
  };

  const deleteFutureExpense = async (id: string) => {
    if (!user) return;
    const expenseDocRef = doc(db, 'users', user.uid, 'futureExpenses', id);
    try {
      await deleteDoc(expenseDocRef);
      toast({ title: 'Conta excluída!', description: 'A conta a pagar foi removida com sucesso.' });
    } catch (error) {
        console.error("Error deleting future expense: ", error);
        toast({ variant: 'destructive', title: 'Erro ao excluir conta', description: 'Não foi possível remover a conta.' });
    }
  };

  return (
    <FutureExpenseContext.Provider value={{ futureExpenses, loading, addFutureExpense, updateFutureExpense, deleteFutureExpense }}>
      {children}
    </FutureExpenseContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de despesa futura.
 *
 * @returns {FutureExpenseContextType} O valor do contexto de despesa futura.
 */
export const useFutureExpenses = () => useContext(FutureExpenseContext);
