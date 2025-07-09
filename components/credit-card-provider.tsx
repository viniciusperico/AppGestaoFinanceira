'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import type { CreditCard } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CreditCardContextType {
  creditCards: CreditCard[];
  loading: boolean;
  addCreditCard: (values: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (id: string, values: Omit<CreditCard, 'id'>) => void;
  deleteCreditCard: (id: string) => void;
}

const CreditCardContext = createContext<CreditCardContextType>({
  creditCards: [],
  loading: true,
  addCreditCard: () => {},
  updateCreditCard: () => {},
  deleteCreditCard: () => {},
});

export function CreditCardProvider({ children }: { children: React.ReactNode }) {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCreditCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'users', user.uid, 'creditCards'), orderBy('name'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cardsData: CreditCard[] = [];
      querySnapshot.forEach((doc) => {
        cardsData.push({ id: doc.id, ...doc.data() } as CreditCard);
      });
      setCreditCards(cardsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching credit cards:", error);
      toast({ variant: 'destructive', title: 'Erro ao buscar cartões', description: 'Não foi possível carregar os cartões de crédito.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const addCreditCard = async (values: Omit<CreditCard, 'id'>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Você precisa estar logado para adicionar um cartão.' });
      return;
    }
    try {
      await addDoc(collection(db, 'users', user.uid, 'creditCards'), values);
      toast({
          title: 'Cartão adicionado!',
          description: 'Seu novo cartão de crédito foi salvo com sucesso.',
      });
    } catch (error) {
      console.error("Error adding credit card: ", error);
      toast({ variant: 'destructive', title: 'Erro ao adicionar cartão', description: 'Não foi possível salvar o novo cartão.' });
    }
  };
  
  const updateCreditCard = async (id: string, values: Omit<CreditCard, 'id'>) => {
    if (!user) return;
    const cardDocRef = doc(db, 'users', user.uid, 'creditCards', id);
    try {
      await updateDoc(cardDocRef, values);
      toast({
          title: 'Cartão atualizado!',
          description: 'As informações do seu cartão foram atualizadas.',
      });
    } catch (error) {
       console.error("Error updating credit card: ", error);
       toast({ variant: 'destructive', title: 'Erro ao atualizar cartão', description: 'Não foi possível salvar as alterações.' });
    }
  };

  const deleteCreditCard = async (id: string) => {
    if (!user) return;
    const cardDocRef = doc(db, 'users', user.uid, 'creditCards', id);
    try {
      await deleteDoc(cardDocRef);
      toast({ title: 'Cartão excluído!', description: 'O cartão foi removido com sucesso.' });
    } catch (error) {
      console.error("Error deleting credit card: ", error);
      toast({ variant: 'destructive', title: 'Erro ao excluir cartão', description: 'Não foi possível remover o cartão.' });
    }
  };

  return (
    <CreditCardContext.Provider value={{ creditCards, loading, addCreditCard, updateCreditCard, deleteCreditCard }}>
      {children}
    </CreditCardContext.Provider>
  );
}

export const useCreditCards = () => useContext(CreditCardContext);
