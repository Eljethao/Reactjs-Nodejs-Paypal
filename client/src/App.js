// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Payment from './components/Payments';
import Success from './components/Success';
import Error from './components/Error';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/payment" element={<Payment/>} />
                <Route path="/success" element={<Success/>} />
                <Route path="/error" element={<Error/>} />
                <Route path="/" exact element={<Home/>} />
            </Routes>
        </Router>
    );
}

export default App;
