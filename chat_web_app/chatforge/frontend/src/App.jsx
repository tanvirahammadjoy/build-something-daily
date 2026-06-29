import { useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import Spinner from './components/common/Spinner.jsx';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // The socket connection only needs to exist once we know who the user is,
  // since the handshake itself is what authenticates it.
  return (
    <SocketProvider>
      <ChatPage />
    </SocketProvider>
  );
}
