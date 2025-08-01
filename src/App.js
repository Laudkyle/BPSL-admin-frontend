// App.jsx
import { BrowserRouter } from "react-router-dom";
import Homepage from "./Homepage";
import axios from "axios";
import { createUser } from "./Api";
import { useState } from "react";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
const url =  process.env.REACT_APP_AUTH_URL;
    try {
      const response = await createUser(url);

      const data = response.data;
      console.log(data)

      if (response.status === 200 && data.access_token) {
        // Save to localStorage
        localStorage.setItem('api_token', data.access_token);
        localStorage.setItem('user_name', data.profile.fullName);
        localStorage.setItem('user_email', data.profile.email);
        localStorage.setItem('employee_id', data.profile.id);

        onLogin(); // allow switch to Homepage
      } else {
        setError('Invalid credentials or no access token received.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 text-center">Welcome Back</h2>
          <p className="mt-1 text-center text-sm text-gray-500">Please sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={credentials.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white text-sm font-medium ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-sm text-center text-gray-500 mt-2">
            <span className="font-semibold">Use Your Bestpoint Credentials</span>
          </p>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('api_token'));

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Homepage onLogout={() => {
          localStorage.clear();
          setIsAuthenticated(false);
        }} />
      ) : (
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </BrowserRouter>
  );
};

export default App;
