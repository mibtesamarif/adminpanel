// Performance Monitor Component - Add this to help debug API calls

import React, { useEffect, useState, useRef } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const PerformanceMonitor = () => {
  const [apiCalls, setApiCalls] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const callCountRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.MODE !== 'development') return;

    // Override fetch to monitor API calls
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const startTime = Date.now();
      callCountRef.current += 1;
      
      const callInfo = {
        id: Date.now() + Math.random(),
        url: url.toString(),
        method: options?.method || 'GET',
        startTime,
        status: 'pending'
      };

      setApiCalls(prev => [callInfo, ...prev.slice(0, 19)]); // Keep last 20 calls

      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        
        setApiCalls(prev => prev.map(call => 
          call.id === callInfo.id 
            ? { 
                ...call, 
                status: response.ok ? 'success' : 'error',
                duration: endTime - startTime,
                statusCode: response.status
              }
            : call
        ));

        return response;
      } catch (error) {
        const endTime = Date.now();
        
        setApiCalls(prev => prev.map(call => 
          call.id === callInfo.id 
            ? { 
                ...call, 
                status: 'error',
                duration: endTime - startTime,
                error: error.message
              }
            : call
        ));

        throw error;
      }
    };

    // Monitor call frequency
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const recentCalls = apiCalls.filter(call => 
        now - call.startTime < 10000 // Last 10 seconds
      );
      
      if (recentCalls.length > 10) {
        console.warn(`🚨 High API call frequency: ${recentCalls.length} calls in last 10 seconds`);
      }
    }, 5000);

    return () => {
      window.fetch = originalFetch;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [apiCalls]);

  // Don't render in production
  if (import.meta.env.MODE !== 'development') return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Activity className="h-3 w-3 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCalls = apiCalls.length;
  const pendingCalls = apiCalls.filter(call => call.status === 'pending').length;
  const errorCalls = apiCalls.filter(call => call.status === 'error').length;
  const recentCalls = apiCalls.filter(call => 
    Date.now() - call.startTime < 60000 // Last minute
  ).length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border max-w-md">
        {/* Header */}
        <div 
          className="p-3 border-b cursor-pointer hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">API Monitor</span>
              {pendingCalls > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {pendingCalls} active
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {recentCalls}/min
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center space-x-4 mt-2 text-xs">
            <span className="text-gray-600">Total: {totalCalls}</span>
            {errorCalls > 0 && (
              <span className="text-red-600">Errors: {errorCalls}</span>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="p-3 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {apiCalls.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No API calls yet
                </p>
              ) : (
                apiCalls.slice(0, 10).map((call) => (
                  <div key={call.id} className="border rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(call.status)}
                        <span className="font-mono text-xs">
                          {call.method}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </div>
                      {call.duration && (
                        <span className="text-gray-500">
                          {call.duration}ms
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 truncate" title={call.url}>
                      {call.url.replace(import.meta.env.VITE_API_URL || '', '')}
                    </div>
                    {call.error && (
                      <div className="text-red-500 text-xs mt-1">
                        {call.error}
                      </div>
                    )}
                    <div className="text-gray-400 text-xs mt-1">
                      {new Date(call.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {apiCalls.length > 10 && (
              <div className="text-center mt-2">
                <button 
                  onClick={() => setApiCalls([])}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear History
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;