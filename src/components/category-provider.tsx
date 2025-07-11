'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, addDoc, writeBatch, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import type { Category } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { defaultCategories } from '@/lib/categories';

/**
 * A forma do contexto de categoria.
 */
interface CategoryContextType {
  /** Um array de todas as categorias (padrão e personalizadas). */
  categories: Category[];
  /** Um booleano indicando se as categorias estão sendo carregadas. */
  loading: boolean;
  /** Função para adicionar uma nova categoria personalizada. */
  addCategory: (values: Omit<Category, 'id' | 'isCustom'>) => Promise<void>;
  /** Função para atualizar uma categoria personalizada existente. */
  updateCategory: (id: string, values: Omit<Category, 'id' | 'isCustom'>) => Promise<void>;
  /** Função para deletar uma categoria personalizada. */
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType>({
  categories: defaultCategories,
  loading: true,
  addCategory: async () => {},
  updateCategory: async () => {},
  deleteCategory: async () => {},
});

/**
 * `CategoryProvider` é um componente que fornece dados de categoria e funções de gerenciamento
 * para seus filhos. Ele busca categorias personalizadas do Firestore e as mescla com
 * as categorias padrão.
 *
 * @param {object} props - As props do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos que terão acesso ao contexto.
 * @returns {JSX.Element} O componente provedor de categoria.
 */
export function CategoryProvider({ children }: { children: ReactNode }) {
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !db) {
      setCustomCategories([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'categories'), orderBy('name'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userCategories: Category[] = [];
       if (querySnapshot.empty) {
        setLoading(false);
      }
      querySnapshot.forEach((doc) => {
        userCategories.push({ id: doc.id, ...doc.data(), isCustom: true } as Category);
      });
      setCustomCategories(userCategories);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      toast({ variant: 'destructive', title: 'Erro ao buscar categorias', description: 'Não foi possível carregar as categorias.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const addCategory = async (values: Omit<Category, 'id' | 'isCustom'>) => {
    if (!user || !db) {
      toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Você precisa estar logado para adicionar uma categoria.' });
      return;
    }
    try {
      await addDoc(collection(db, 'users', user.uid, 'categories'), values);
      toast({
          title: 'Categoria adicionada!',
          description: 'Sua nova categoria foi salva com sucesso.',
      });
    } catch (error) {
      console.error("Error adding category: ", error);
      toast({ variant: 'destructive', title: 'Erro ao adicionar categoria', description: 'Não foi possível salvar a nova categoria.' });
    }
  };
  
  const updateCategory = async (id: string, values: Omit<Category, 'id'| 'isCustom'>) => {
    if (!user || !db) return;
    const categoryDocRef = doc(db, 'users', user.uid, 'categories', id);
    try {
      await updateDoc(categoryDocRef, values);
      toast({
          title: 'Categoria atualizada!',
          description: 'As informações da sua categoria foram atualizadas.',
      });
    } catch (error) {
       console.error("Error updating category: ", error);
       toast({ variant: 'destructive', title: 'Erro ao atualizar categoria', description: 'Não foi possível salvar as alterações.' });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user || !db) return;
    
    const categoryDocRef = doc(db, 'users', user.uid, 'categories', id);
    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(transactionsRef, where('category', '==', id));

    try {
        const batch = writeBatch(db);
        const otherCategory = defaultCategories.find(c => c.id === 'outros');
        if (!otherCategory) {
            toast({ variant: 'destructive', title: 'Erro Crítico', description: 'A categoria padrão "Outros" não foi encontrada.' });
            return;
        }
        
        // Atualiza as transações órfãs
        const transactionsToUpdate = await getDocs(q);
        transactionsToUpdate.forEach(document => {
            const docRef = doc(db, 'users', user.uid, 'transactions', document.id);
            batch.update(docRef, { category: otherCategory.id });
        });

        // Deleta o documento da categoria
        batch.delete(categoryDocRef);
        
        await batch.commit();

        toast({ title: 'Categoria excluída!', description: 'A categoria foi removida e as transações associadas foram movidas para "Outros".' });
    } catch (error) {
        console.error("Error deleting category: ", error);
        toast({ variant: 'destructive', title: 'Erro ao excluir categoria', description: 'Não foi possível remover a categoria.' });
    }
  };

  const allCategories = useMemo(() => {
    return [...defaultCategories, ...customCategories].sort((a, b) => a.name.localeCompare(b.name));
  }, [customCategories]);

  return (
    <CategoryContext.Provider value={{ categories: allCategories, loading, addCategory, updateCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de categoria.
 *
 * @returns {CategoryContextType} O valor do contexto de categoria.
 */
export const useCategories = () => useContext(CategoryContext);
