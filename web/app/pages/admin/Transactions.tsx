import { useEffect } from 'react';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { useAuthStore } from '../../store/authStore';
import { usePlayersStore } from '../../store/playersStore';
import { EntityType, TransactionType } from '../../types/player';

export default function Transactions() {
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    page,
    limit,
    totalCount
  } = usePlayersStore();
  const { currentGameId, isAdmin } = useAuthStore();

  useEffect(() => {
    fetchTransactions(page, limit);
  }, [fetchTransactions, page, limit]);

  const handlePageChange = (newPage: number) => {
    fetchTransactions(newPage, limit);
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.GOLD_GEMS_TRANSFER:
        return 'Gold & Gems Transfer';
      case TransactionType.ITEM_TRANSFER:
        return 'Item Transfer';
      case TransactionType.GAME_ACTION:
        return 'Game Action';
      default:
        return type;
    }
  };

  const getEntityTypeLabel = (type: EntityType) => {
    switch (type) {
      case EntityType.USER:
        return 'User';
      case EntityType.PLAYER:
        return 'Player';
      case EntityType.GAME:
        return 'Game';
      case EntityType.PLACE:
        return 'Place';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && transactions.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading transactions...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <div className="text-sm text-gray-500">
            Total: {totalCount} transactions
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {transaction.sourceId}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getEntityTypeLabel(transaction.sourceType)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {transaction.targetId}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getEntityTypeLabel(transaction.targetType)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.description}
                    {transaction.payload && (
                      <div className="mt-1 text-xs text-gray-400">
                        Payload: {JSON.stringify(transaction.payload)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.created)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No transactions found.
          </div>
        )}

        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalCount / limit)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </Layout>
  );
}
