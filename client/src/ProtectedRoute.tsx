import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const authToken = localStorage.getItem('authToken');
    return authToken ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
