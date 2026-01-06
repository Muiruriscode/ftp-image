'use client'

import { useState } from 'react';
import { FiServer, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

export default function FTPTestPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testFTPConnection = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/upload');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data);
      }
    } catch (err) {
      setError({
        error: 'Network error',
        details: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FTP Connection Test</h1>
          <p className="text-gray-600">Test your FTP server connection and configuration</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiServer className="text-2xl text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">FTP Server Configuration</h2>
                <p className="text-gray-600 text-sm">Current server settings</p>
              </div>
            </div>
            
            <button
              onClick={testFTPConnection}
              disabled={testing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {testing ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <FiServer />
                  Test Connection
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">FTP Host</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono">
                {process.env.NEXT_PUBLIC_FTP_HOST || 'Not configured'}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">FTP User</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono">
                {process.env.NEXT_PUBLIC_FTP_USER || 'Not configured'}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">FTP Port</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono">
                {process.env.NEXT_PUBLIC_FTP_PORT || '21'}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Base URL</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono">
                {process.env.NEXT_PUBLIC_BASE_URL || 'Not configured'}
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheck className="text-xl text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-900">FTP Connection Successful!</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-green-700">Successfully connected to FTP server and listed directory contents.</p>
              
              <div className="mt-4">
                <h4 className="font-medium text-green-900 mb-2">Directory Listing:</h4>
                <div className="bg-white rounded-lg border border-green-200 p-4">
                  <pre className="text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(result.files, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="text-sm text-green-600 mt-4">
                Path: <code className="bg-green-100 px-2 py-1 rounded">{result.path}</code>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FiX className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-900">FTP Connection Failed</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-red-700"><strong>Error:</strong> {error.error}</p>
              
              {error.details && (
                <p className="text-red-600 text-sm">
                  <strong>Details:</strong> {error.details}
                </p>
              )}
              
              {error.config && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-900 mb-2">Current Configuration:</h4>
                  <div className="bg-white rounded-lg border border-red-200 p-4">
                    <pre className="text-sm text-gray-700">
                      {JSON.stringify(error.config, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="font-medium text-red-900 mb-2">Troubleshooting Steps:</h4>
                <ul className="list-disc pl-5 text-red-700 space-y-1">
                  <li>Verify FTP credentials are correct</li>
                  <li>Ensure FTP server is running on port 21</li>
                  <li>Check if firewall allows connections</li>
                  <li>Verify the FTP user has write permissions</li>
                  <li>Test with an FTP client like FileZilla</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">Important Notes</h3>
          <ul className="space-y-2 text-yellow-700">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Your FTP base path should be: <code className="bg-yellow-100 px-2 py-1 rounded">/domains/hammingbconnection.co.ke/public_html/uploads</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Files will be uploaded to: <code className="bg-yellow-100 px-2 py-1 rounded">/originals/</code> and <code className="bg-yellow-100 px-2 py-1 rounded">/optimized/</code> subdirectories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Ensure your FTP user has write permissions to these directories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>The public URLs will be accessible at: <code className="bg-yellow-100 px-2 py-1 rounded">https://hammingbconnection.co.ke/uploads/</code></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}