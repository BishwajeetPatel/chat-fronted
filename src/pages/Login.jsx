// pages/Login.jsx - Enhanced with Debugging
import React, { useState, useEffect } from "react";
import { UserData } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/Loading";
import { server } from "../main";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [debugInfo, setDebugInfo] = useState([]);

  const { loginUser, btnLoading } = UserData();
  const navigate = useNavigate();

  // Add debug message
  const addDebug = (message) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-4), { // Keep only last 5 messages
      time: new Date().toLocaleTimeString(),
      message
    }]);
  };

  // Test server connection on component mount
  useEffect(() => {
    testServerConnection();
  }, []);

  const testServerConnection = async () => {
    setServerStatus('checking');
    addDebug(`🔍 Testing server connection to: ${server}`);
    
    try {
      // Try a simple GET request to server root
      const response = await axios.get(server, { 
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      
      addDebug('✅ Server is reachable!');
      setServerStatus('online');
      
    } catch (error) {
      addDebug(`❌ Server connection failed: ${error.message}`);
      
      if (error.code === 'ECONNABORTED') {
        addDebug('⏰ Server timeout - might be sleeping (Render.com)');
        setServerStatus('sleeping');
      } else if (error.response?.status === 404) {
        addDebug('✅ Server is running (404 is normal for root)');
        setServerStatus('online');
      } else {
        addDebug('❌ Server appears to be offline');
        setServerStatus('offline');
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      addDebug('❌ Empty email provided');
      return;
    }

    addDebug(`📧 Attempting login for: ${email}`);
    addDebug(`🔗 Using server: ${server}`);
    
    // Test connection before trying login
    if (serverStatus === 'offline') {
      addDebug('⚠️ Server appears offline, testing connection...');
      await testServerConnection();
    }

    loginUser(email, navigate);
  };

  const getStatusColor = () => {
    switch(serverStatus) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'sleeping': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch(serverStatus) {
      case 'online': return '🟢 Server Online';
      case 'offline': return '🔴 Server Offline';
      case 'sleeping': return '🟡 Server Sleeping (Waking up...)';
      default: return '⚪ Checking Server...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold text-center">🤖 AI Chat Login</h2>
          <p className="text-center text-blue-100 mt-2">Enter your email to get started</p>
        </div>

        {/* Server Status */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            <button 
              onClick={testServerConnection}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              disabled={serverStatus === 'checking'}
            >
              {serverStatus === 'checking' ? 'Testing...' : 'Recheck'}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            Server: <code className="bg-gray-100 px-1 rounded">{server}</code>
          </div>
        </div>

        {/* Login Form */}
        <form className="p-6" onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={btnLoading || serverStatus === 'offline'}
          >
            {btnLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2">Sending OTP...</span>
              </div>
            ) : (
              '📧 Send OTP'
            )}
          </button>

          {serverStatus === 'offline' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                ⚠️ Server is currently offline. Please try again later or contact support.
              </p>
            </div>
          )}

          {serverStatus === 'sleeping' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                ⏰ Server is waking up. This may take 30-60 seconds on free hosting.
              </p>
            </div>
          )}
        </form>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
          <div className="mx-6 mb-6">
            <details className="bg-gray-50 border border-gray-200 rounded-lg">
              <summary className="p-3 cursor-pointer text-sm font-medium text-gray-700">
                🔧 Debug Information ({debugInfo.length})
              </summary>
              <div className="p-3 border-t border-gray-200 max-h-32 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-xs text-gray-600 font-mono mb-1">
                    <span className="text-gray-400">{info.time}</span> {info.message}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            You'll receive a 6-digit OTP code via email
          </p>
          
          {/* Manual Debug Tools */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-2">Debug Tools:</p>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => window.open(server, '_blank')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Test Server URL
                </button>
                <button 
                  type="button"
                  onClick={() => console.log('Server:', server, 'Status:', serverStatus)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Log Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;