import { useState } from 'react';
import { useAccount } from 'wagmi';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import UsersPage from './components/UsersPage';

function App() {
    const [currentPage, setCurrentPage] = useState('landing');
    const { isConnected } = useAccount();

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    if (!isConnected && currentPage !== 'landing') {
        setCurrentPage('landing');
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'register':
                return <RegisterPage onNavigate={handleNavigate} />;
            case 'users':
                return <UsersPage onNavigate={handleNavigate} />;
            default:
                return <LandingPage onNavigate={handleNavigate} />;
        }
    };

    return <div className="App">{renderPage()}</div>;
}

export default App;
