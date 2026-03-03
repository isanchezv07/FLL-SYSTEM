import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import AdminDashboard from './components/displays/admin/AdminDashboard';
import PrivateRoute from './components/private/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/auth/login" />} />
        <Route path="/auth/login" component={LoginForm} />
        
        <Route
          path="/roles/admin/admin_dashboard"
          render={() => (
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          )}
        />
        
        <Route render={() => <Redirect to="/auth/login" />} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;