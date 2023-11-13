import React, { useState, useEffect } from 'react';
import Item from './components/Item/Item';
import Pagination from './components/Pagination/Pagination';

interface Apartment {
  title: string;
  href: string;
}

interface User {
  id: number;
  name: string;
  // Add other properties as needed
}

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Apartment[]>([]); // Explicitly set the type here
  const itemsPerPage = 20;

  useEffect(() => {
    // Fetch your data from the server (replace with your actual fetch URL)
    fetch('http://localhost:5173/apartments')
      .then((response) => response.json())
      .then((apartmentData: Apartment[]) => {
        setData(apartmentData);
      });
  }, []);

  const renderItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    console.log(data);
    const itemsToRender = data.slice(startIndex, endIndex);

    return itemsToRender.map((item, index) => (
      <Item key={index} title={item.title} href={item.href} />
    ));
  };

  return (
    <div className="container">
      <h1>Apartments</h1>
      <div className="items-container">{renderItems()}</div>
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(data.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;
