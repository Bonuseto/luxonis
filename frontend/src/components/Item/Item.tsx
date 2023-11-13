// Item.tsx
import React from 'react';
import './Item.css';

interface ItemProps {
  title: string;
  href: string;
}

const Item: React.FC<ItemProps> = ({ title, href }) => {
  return (
    <div className="card">
      <img src={href} alt="Apartment image" width="240px" />
      <div className="container">
        <h4>{title}</h4>
      </div>
    </div>
  );
};

export default Item;