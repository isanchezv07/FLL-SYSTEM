import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import AdminDashboard from './components/roles/admin/AdminDashboard';
import PrivateRoute from './components/private/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/login" />} />
        <Route path="/login" component={LoginForm} />
        
        <Route
          path="/admin_dashboard"
          render={() => (
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          )}
        />
        
        <Route render={() => <Redirect to="/login" />} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;