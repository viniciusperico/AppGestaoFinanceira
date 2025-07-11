'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import type { CreditCard } from '@/types';
import { useToast } from '@/hooks/use-toast';

/**
 * A forma do contexto de cartão de crédito.
 */
interface CreditCardContextType {
  /** Um array dos cartões de crédito do usuário. */
  creditCards: CreditCard[];
  /** Um booleano indicando se os cartões de crédito estão sendo carregados. */
  loading: boolean;
  /** Função para adicionar um novo cartão de crédito. */
  addCreditCard: (values: Omit<CreditCard, 'id'>) => void;
  /** Função para atualizar um cartão de crédito existente. */
  updateCreditCard: (id: string, values: Omit<CreditCard, 'id'>) => void;
  /** Função para deletar um cartão de crédito. */
  deleteCreditCard: (id: string) => void;
}

const CreditCardContext = createContext<CreditCardContextType>({
  creditCards: [],
  loading: true,
  addCreditCard: () => {},
  updateCreditCard: () => {},
  deleteCreditCard: () => {},
});

/**
 * `CreditCardProvider` é um componente que fornece dados de cartão de crédito e funções de gerenciamento
 * para seus filhos. Ele busca os cartões de crédito do usuário no Firestore e fornece
 * métodos para operações CRUD.
 *
 * @param {object} props - As props do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos que terão acesso ao contexto.
 * @returns {JSX.Element} O componente provedor de cartão de crédito.
 */
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

/**
 * Hook personalizado para acessar o contexto de cartão de crédito.
 *
 * @returns {CreditCardContextType} O valor do contexto de cartão de crédito.
 */
export const useCreditCards = () => useContext(CreditCardContext);
