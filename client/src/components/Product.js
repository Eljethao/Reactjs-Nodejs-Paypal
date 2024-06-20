// src/components/Product.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Product = ({ product }) => {
    const history = useNavigate();

    const handleBuy = () => {
        history(`/payment?productId=${product.id}`);
    };

    return (
        <div>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: ${product.price.toFixed(2)}</p>
            <button onClick={handleBuy}>Buy</button>
        </div>
    );
};

export default Product;
