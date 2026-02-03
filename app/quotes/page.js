'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { getMyQuotes } from '../lib/quoteService';

function StatusBadge({ status }) {
  const styles = {
    final: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    revised: 'bg-blue-100 text-blue-800',
    accepted: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(price) {
  return `RM ${Number(price).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTankSize(tankConfig) {
  if (!tankConfig) return '—';
  const { length, width, height } = tankConfig;
  if (!length || !width || !height) return '—';
  return `${length}m × ${width}m × ${height}m`;
}

function MyQuotesContent() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuotes() {
      if (!user?.id) return;
      setLoading(true);
      const { quotes: data, error: err } = await getMyQuotes(user.id);
      if (err) {
        setError(err.message || 'Failed to load quotes');
      } else {
        setQuotes(data);
      }
      setLoading(false);
    }
    fetchQuotes();
  }, [user?.id]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Quotes</h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage your saved quotations
              </p>
            </div>
            <Link
              href="/calculator"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              &larr; Back to Calculator
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your quotes...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && quotes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No quotes yet.</p>
            <p className="text-gray-400 mt-2">
              Go to the{' '}
              <Link href="/calculator" className="text-blue-600 hover:text-blue-800 underline">
                calculator
              </Link>{' '}
              to create your first quote.
            </p>
          </div>
        )}

        {/* Quotes Table */}
        {!loading && !error && quotes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tank Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Material
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final Price
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                        {quote.serial_number}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(quote.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {quote.customer_company || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatTankSize(quote.tank_config)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {quote.tank_config?.material || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {formatPrice(quote.final_price)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <StatusBadge status={quote.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
              {quotes.length} quote{quotes.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyQuotesPage() {
  return (
    <ProtectedRoute>
      <MyQuotesContent />
    </ProtectedRoute>
  );
}
