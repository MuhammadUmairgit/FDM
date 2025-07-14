import React from "react";
import ItemCard from "../ItemCard/ItemCard";
import "./ItemList.css";

const ItemList = ({ items, navigation, updateItemQuantity, theme }) => {
  return (
    <div className="item-list">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          updateItemQuantity={updateItemQuantity}
        />
      ))}
    </div>
  );
};

export default ItemList;
