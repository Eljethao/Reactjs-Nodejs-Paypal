// src/components/Error.js
import React from 'react';
import { useLocation } from 'react-router-dom';


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Error = () => {
    const query = useQuery();
    const message = query.get('message');
    return (
        <div>
            <h1>Payment Error</h1>
            <p>{message}</p>
            <p>There was an issue processing your payment. Please try again.</p>
        </div>
    );
};

export default Error;
