import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Your Navbar component
import App from './App';
import News from './components/News'; // The News component we'll create

import 'bootstrap/dist/css/bootstrap.min.css'; // Add this import

import Footer from './components/Footer';
const RouterMain = () => {













  
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<App />} /> {/* Default route (home) */}
          <Route path="/news" element={<News />} /> {/* Route for News */}
        </Routes>


        <Footer />
      </div>
    </Router>
  );
};

export default RouterMain;