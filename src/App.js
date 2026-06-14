import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginPopup from './LoginPopup';
import Home from './Home';
import Games from './Games';
import GamePage from './GamePage';
import CreateAccount from './CreateAccount';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LoginPopup />
      <div className="App">
        <nav style={{ padding: 12 }}>
          <Link to="/" style={{ marginRight: 12 }}>Home</Link>
          <Link to="/games">Games</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:slug" element={<GamePage />} />
                  <Route path="/create-account" element={<CreateAccount />} />
        </Routes>
      </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
