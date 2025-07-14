import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItemsFromFirebase = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "inventory"));
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsData);
    } catch (error) {
      console.error("Error fetching items: ", error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (updatedItem) => {
    try {
      const itemRef = doc(db, "inventory", updatedItem.id);
      await updateDoc(itemRef, {
        quantity: updatedItem.quantity
      });
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    } catch (error) {
      console.error("Error updating item: ", error);
    }
  };

  useEffect(() => {
    fetchItemsFromFirebase();
  }, []);

  return (
    <ItemContext.Provider value={{
      items,
      loading,
      fetchItemsFromFirebase,
      updateItemQuantity
    }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => useContext(ItemContext);
