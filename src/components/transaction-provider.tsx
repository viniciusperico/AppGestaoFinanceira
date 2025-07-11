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
  writeBatch,
  where,
  getDocs
} from 'firebase/firestore';

/**
 * A forma do contexto de transação.
 */
interface TransactionContextType {
  /** Um array das transações do usuário. */
  transactions: Transaction[];
  /** Um booleano indicando se as transações estão sendo carregadas. */
  loading: boolean;
  /** Função para adicionar uma nova transação (ou grupo de transações). */
  addTransaction: (values: any) => void;
  /** Função para atualizar uma única transação existente. */
  updateTransaction: (id: string, values: any) => void;
  /** Função para deletar uma única transação. */
  deleteTransaction: (id: string) => void;
  /** Função para atualizar todas as transações em um grupo (parceladas/recorrentes). */
  updateTransactionGroup: (groupId: string, values: any) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  loading: true,
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  updateTransactionGroup: async () => {},
});

/**
 * `TransactionProvider` é um componente que fornece dados de transação e funções de gerenciamento
 * para seus filhos. Ele lida com todas as interações do Firestore para transações, incluindo a criação
 * de transações únicas, recorrentes e parceladas.
 *
 * @param {object} props - As props do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos que terão acesso ao contexto.
 * @returns {JSX.Element} O componente provedor de transação.
 */
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
          // Converte Timestamp do Firestore para string ISO para consistência
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
      // Gera um ID único para o grupo de transações
      const groupId = doc(collection(db, 'users')).id; 
      
      if (values.type === 'expense' && values.isRecurring && values.recurringEndDate) {
          // Lida com despesas recorrentes
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
                  paymentMethod: 'cash', // Recorrente padroniza para dinheiro
                  groupId: groupId,
                  isOriginal: i === 0,
              });
              currentDate = addMonths(currentDate, 1);
              i++;
          }
           toast({
              title: 'Despesa recorrente adicionada!',
              description: `${i} lançamentos foram criados com sucesso.`,
          });
      } else if (values.type === 'expense' && values.installments && values.installments > 1) {
          // Lida com despesas parceladas
          const totalAmount = values.amount;
          const numInstallments = values.installments;
          const installmentAmount = Math.floor((totalAmount / numInstallments) * 100) / 100;
          let accumulatedAmount = 0;

          for (let i = 0; i < numInstallments; i++) {
              const installmentDate = addMonths(values.date, i);
              let currentInstallmentAmount;
              
              // Ajusta a última parcela para compensar diferenças de arredondamento
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
                  paymentMethod: values.paymentMethod,
                  creditCardId: values.creditCardId,
                  groupId: groupId,
                  isOriginal: i === 0,
              });
          }
          toast({
              title: 'Parcelas adicionadas!',
              description: `${numInstallments} parcelas foram adicionadas com sucesso.`,
          });
      } else {
          // Lida com transação única
          newTransactionsList.push({
              description: values.description,
              amount: amount,
              type: values.type,
              category: values.category,
              date: values.date.toISOString(),
              paymentMethod: values.paymentMethod,
              creditCardId: values.creditCardId,
          });
          toast({
              title: 'Transação adicionada!',
              description: 'Seu novo registro foi salvo com sucesso.',
          });
      }
      
      // Usa uma escrita em lote para adicionar todas as transações atomicamente
      const batch = writeBatch(db);
      const transactionsCollection = collection(db, 'users', user.uid, 'transactions');
      
      newTransactionsList.forEach(transaction => {
        const docRef = doc(transactionsCollection);
        // Limpa campos indefinidos antes de salvar
        const dataToSave = Object.fromEntries(Object.entries(transaction).filter(([_, v]) => v !== undefined));
        
        const dataWithTimestamp = {
          ...dataToSave,
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
      const dataToUpdate: Partial<Transaction> & { date: Date } = {
        description: values.description,
        amount: amount,
        type: values.type,
        category: values.category,
        date: new Date(values.date),
        paymentMethod: values.paymentMethod,
        creditCardId: values.creditCardId,
        groupId: values.groupId,
      };

      // Limpa campos com base no tipo de transação e método de pagamento
      if (values.type === 'income') {
        dataToUpdate.paymentMethod = undefined;
        dataToUpdate.creditCardId = undefined;
      } else if (values.paymentMethod === 'cash') {
        dataToUpdate.creditCardId = undefined;
      }

      // Limpa todos os campos indefinidos antes de salvar no Firestore
      const cleanedDataToUpdate = Object.fromEntries(Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined));

      await updateDoc(transactionDocRef, cleanedDataToUpdate);
      toast({
          title: 'Transação atualizada!',
          description: 'Seu registro foi atualizado com sucesso.',
      });
    } catch (error) {
       console.error("Error updating transaction: ", error);
       toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Não foi possível salvar as alterações.' });
    }
  };

  const updateTransactionGroup = async (groupId: string, values: any) => {
    if (!user) return;

    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(transactionsRef, where('groupId', '==', groupId));
    
    try {
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        
        querySnapshot.forEach(document => {
            const docRef = doc(db, 'users', user.uid, 'transactions', document.id);
            const dataToUpdate: Partial<Transaction> = {
                category: values.category,
                paymentMethod: values.paymentMethod,
                creditCardId: values.creditCardId,
            };

            if (values.paymentMethod === 'cash') {
                dataToUpdate.creditCardId = undefined;
            }

            const cleanedDataToUpdate = Object.fromEntries(Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined));

            batch.update(docRef, cleanedDataToUpdate);
        });

        await batch.commit();

        toast({
            title: 'Grupo de transações atualizado!',
            description: 'Todas as transações do grupo foram atualizadas com sucesso.',
        });
    } catch (error) {
        console.error("Error updating transaction group: ", error);
        toast({ variant: 'destructive', title: 'Erro ao atualizar grupo', description: 'Não foi possível atualizar todas as transações do grupo.' });
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
    <TransactionContext.Provider value={{ transactions, loading, addTransaction, updateTransaction, deleteTransaction, updateTransactionGroup }}>
      {children}
    </TransactionContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de transação.
 *
 * @returns {TransactionContextType} O valor do contexto de transação.
 */
export const useTransactions = () => useContext(TransactionContext);
