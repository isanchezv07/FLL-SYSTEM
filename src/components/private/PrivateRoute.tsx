import * as ReactRouter from 'react-router-dom';
const { Redirect } = ReactRouter;

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  // Check if we're in a browser environment
  const isClient = typeof window !== 'undefined';
  
  if (!isClient) {
    return <div>Loading...</div>;
  }

  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const role = localStorage.getItem("role");

  // Si no está autenticado → redirige
  if (!isAuthenticated || isAuthenticated !== "true") {
    return <Redirect to="/login" />;
  }

  // Opcional: validar que sea admin
  if (role !== "admin") {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}