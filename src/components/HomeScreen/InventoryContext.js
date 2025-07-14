import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../Auth/AuthContext";

export const InventoryContext = React.createContext();

export const useInventory = () => React.useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const fetchItems = async () => {
    if (!currentUser) return [];

    const q = query(
      collection(db, "inventory"),
      where("userId", "==", currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory", currentUser?.uid],
    queryFn: fetchItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!currentUser, // Only fetch when user is available
  });

  // Calculate global inventory metrics including profit
  const totalItems = items.length;
  const totalValue = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      0
    );
  }, [items]);

  const totalCostValue = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        (parseFloat(item.costPrice) || 0) * (parseInt(item.quantity) || 1),
      0
    );
  }, [items]);

  const totalPotentialProfit = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        ((parseFloat(item.price) || 0) - (parseFloat(item.costPrice) || 0)) *
          (parseInt(item.quantity) || 1),
      0
    );
  }, [items]);

  const profitMargin = useMemo(() => {
    return totalValue > 0
      ? ((totalValue - totalCostValue) / totalValue) * 100
      : 0;
  }, [totalValue, totalCostValue]);

  const categories = useMemo(() => {
    const categorySet = new Set();
    items.forEach((item) => {
      if (item.category) {
        categorySet.add(item.category);
      }
    });
    return categorySet.size;
  }, [items]);

  const value = {
    items,
    isLoading,
    totalItems,
    totalValue,
    totalCostValue,
    totalPotentialProfit,
    profitMargin,
    categories,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
