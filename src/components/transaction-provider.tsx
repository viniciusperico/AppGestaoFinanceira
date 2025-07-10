'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { addMonths } from 'date-fns';
import { useAuth } from './auth-provider';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';


interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (values: any) => void;
  updateTransaction: (id: string, values: any) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  loading: true,
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
});

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = [];
      if (querySnapshot.empty) {
        setLoading(false);
      }
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate().toISOString(),
        } as Transaction);
      });
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions: ", error);
      toast({ variant: 'destructive', title: 'Erro ao buscar transações', description: 'Não foi possível carregar os registros.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);


  const addTransaction = async (values: any) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Você precisa estar logado para adicionar uma transação.' });
      return;
    }

    const newTransactionsList: Omit<Transaction, 'id'>[] = [];
    const amount = values.type === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount);

    try {
      if (values.type === 'expense' && values.isRecurring && values.recurringEndDate) {
          const startDate = values.date;
          const endDate = values.recurringEndDate;
          let currentDate = startDate;
          let i = 0;

          while (currentDate <= endDate) {
              newTransactionsList.push({
                  description: `${values.description} (Recorrente)`,
                  amount: -Math.abs(values.amount),
                  type: values.type,
                  category: values.category,
                  date: currentDate.toISOString(),
              });
              currentDate = addMonths(currentDate, 1);
              i++;
          }
           toast({
              title: 'Despesa recorrente adicionada!',
              description: `${i} lançamentos foram criados com sucesso.`,
          });
      } else if (values.type === 'expense' && values.installments && values.installments > 1) {
          const totalAmount = values.amount;
          const numInstallments = values.installments;
          const installmentAmount = Math.floor((totalAmount / numInstallments) * 100) / 100;
          let accumulatedAmount = 0;

          for (let i = 0; i < numInstallments; i++) {
              const installmentDate = addMonths(values.date, i);
              let currentInstallmentAmount;

              if (i === numInstallments - 1) {
                  currentInstallmentAmount = totalAmount - accumulatedAmount;
              } else {
                  currentInstallmentAmount = installmentAmount;
                  accumulatedAmount += installmentAmount;
              }

              newTransactionsList.push({
                  description: `${values.description} (${i + 1}/${numInstallments})`,
                  amount: -Math.abs(currentInstallmentAmount),
                  type: values.type,
                  category: values.category,
                  date: installmentDate.toISOString(),
              });
          }
          toast({
              title: 'Parcelas adicionadas!',
              description: `${numInstallments} parcelas foram adicionadas com sucesso.`,
          });
      } else {
          newTransactionsList.push({
              description: values.description,
              amount: amount,
              type: values.type,
              category: values.category,
              date: values.date.toISOString(),
          });
          toast({
              title: 'Transação adicionada!',
              description: 'Seu novo registro foi salvo com sucesso.',
          });
      }
      
      const batch = writeBatch(db);
      const transactionsCollection = collection(db, 'users', user.uid, 'transactions');
      
      newTransactionsList.forEach(transaction => {
        const docRef = doc(transactionsCollection);
        const dataWithTimestamp = {
          ...transaction,
          date: new Date(transaction.date)
        };
        batch.set(docRef, dataWithTimestamp);
      });
      
      await batch.commit();

    } catch (error) {
       console.error("Error adding transaction(s): ", error);
       toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Não foi possível salvar os registros.' });
    }
  };
  
  const updateTransaction = async (id: string, values: any) => {
    if (!user) return;
    const amount = values.type === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount);
    const transactionDocRef = doc(db, 'users', user.uid, 'transactions', id);
    
    try {
      await updateDoc(transactionDocRef, {
        description: values.description,
        amount: amount,
        type: values.type,
        category: values.category,
        date: values.date,
      });
      toast({
          title: 'Transação atualizada!',
          description: 'Seu registro foi atualizado com sucesso.',
      });
    } catch (error) {
       console.error("Error updating transaction: ", error);
       toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Não foi possível salvar as alterações.' });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const transactionDocRef = doc(db, 'users', user.uid, 'transactions', id);
    try {
      await deleteDoc(transactionDocRef);
      toast({ title: 'Transação excluída!', description: 'O registro foi removido com sucesso.' });
    } catch (error) {
      console.error("Error deleting transaction: ", error);
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: 'Não foi possível remover o registro.' });
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, loading, addTransaction, updateTransaction, deleteTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);
