import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import WalletDisplay from '../../components/WalletDisplay';
import { useAdminUserStore } from '../../store/adminUserStore';
import type { AdminUserDto, SendGoldAndGemsToUserDto } from '../../types/user';

export default function Users() {
  const { t } = useTranslation();
  const {
    users,
    totalCount,
    page,
    limit,
    loading,
    error,
    fetchUsers,
    resetPassword,
    sendGoldAndGems
  } = useAdminUserStore();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [giveModalOpen, setGiveModalOpen] = useState(false);
  const [goldAmount, setGoldAmount] = useState(0);
  const [gemsAmount, setGemsAmount] = useState(0);
  const [partsAmount, setPartsAmount] = useState(0);
  const [giveError, setGiveError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers(page, limit);
  }, [fetchUsers]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, limit);
  };

  const openGiveModal = (user: AdminUserDto) => {
    setSelectedUser(user);
    setGoldAmount(0);
    setGemsAmount(0);
    setPartsAmount(0);
    setGiveError(null);
    setGiveModalOpen(true);
  };

  const handleGiveSubmit = async () => {
    if (!selectedUser) return;
    try {
      await sendGoldAndGems({
        userId: selectedUser.id,
        gold: goldAmount,
        gems: gemsAmount,
        parts: partsAmount,
      });
      await fetchUsers(page, limit);
      setGiveModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setGiveError(err.message || 'Failed to send resources');
    }
  };

  const openResetModal = (user: AdminUserDto) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setResetError(null);
    setResetSuccess(false);
    setResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    if (newPassword.length < 7) {
      setResetError('Password must be at least 7 characters');
      return;
    }
    try {
      await resetPassword(selectedUser.id, newPassword);
      setResetSuccess(true);
      setTimeout(() => {
        setResetModalOpen(false);
        setSelectedUser(null);
        setResetSuccess(false);
      }, 1500);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password');
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <Layout title={t('navigation.users')}>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg flex flex-col h-admin-content">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('navigation.users')} ({totalCount})
          </h3>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Games / Players
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.scope === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {user.scope}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.players && user.players.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {user.players.map((player, pIdx) => (
                            <div key={player.id || pIdx} className="text-xs">
                              <span className="font-semibold">{player.game?.name || 'Unknown Game'}:</span>{' '}
                              <span>{player.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-xs text-gray-400">No games</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <WalletDisplay wallet={user.wallet} showHidden={true} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openGiveModal(user)}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm w-fit"
                        >
                          Give
                        </button>
                        {user.scope !== 'ADMIN' && (
                          <button
                            onClick={() => openResetModal(user)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Reset Password
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">
                  {totalCount === 0 ? 0 : (page - 1) * limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(page * limit, totalCount)}
                </span>{' '}
                of <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Reset Password for {selectedUser.username}
            </h3>
            
            {resetSuccess ? (
              <div className="text-center py-4">
                <p className="text-green-600 dark:text-green-400">Password reset successfully!</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Confirm new password"
                  />
                </div>

                {resetError && (
                  <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded">
                    {resetError}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Reset Password
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Give Modal */}
      {giveModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Give Resources to {selectedUser.username}
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="gold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gold
                </label>
                <input
                  type="number"
                  id="gold"
                  min="0"
                  value={String(goldAmount)}
                  onChange={(e) => setGoldAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter gold amount"
                />
              </div>

              <div>
                <label htmlFor="gems" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gems
                </label>
                <input
                  type="number"
                  id="gems"
                  min="0"
                  value={String(gemsAmount)}
                  onChange={(e) => setGemsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter gems amount"
                />
              </div>

              <div>
                <label htmlFor="parts" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parts
                </label>
                <input
                  type="number"
                  id="parts"
                  min="0"
                  value={String(partsAmount)}
                  onChange={(e) => setPartsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter parts amount"
                />
              </div>
            </div>

            {giveError && (
              <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded">
                {giveError}
              </div>
            )}

            <div className="flex justify-between space-x-4 mt-6">
              <button
                onClick={() => setGiveModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleGiveSubmit}
                disabled={goldAmount === 0 && gemsAmount === 0 && partsAmount === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
