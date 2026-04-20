import { useEffect, useState } from 'react';
import type { PlaceInstanceDto } from '../types/placeInstance';
import type { JobOffer } from '../types/job';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../config/api';
import Toast from './Toast';

interface JobBoardProps {
  placeInstance: PlaceInstanceDto;
  onAcceptJob: () => void;
  onClose: () => void;
}

export default function JobBoard({ placeInstance, onAcceptJob, onClose }: JobBoardProps) {
  const { authToken, currentPlayer } = useAuthStore();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    fetchJobs();
  }, [placeInstance.id]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = typeof authToken === 'string' ? authToken : undefined;
      const result = await apiRequest<JobOffer[]>(
        `/api/place-instances/${placeInstance.id}/jobs`,
        { method: 'GET', authToken: token }
      );
      setJobs(result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobOffer: JobOffer) => {
    if (!currentPlayer) return;

    setAcceptingJobId(jobOffer.id);
    setError('');

    try {
      const token = typeof authToken === 'string' ? authToken : undefined;
      const result = await apiRequest<{ success: boolean; error?: string; jobId?: string }>(
        `/api/place-instances/${placeInstance.id}/accept-job`,
        {
          method: 'POST',
          authToken: token,
          body: JSON.stringify({ jobOfferId: jobOffer.id }),
        }
      );

      if (result.success) {
        setToastMessage(`Job accepted! Loading onto vehicle.`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          onAcceptJob();
        }, 1500);
      } else {
        setError(result.error || 'Failed to accept job');
        setToastMessage(result.error || 'Failed to accept job');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept job');
      setToastMessage(err.message || 'Failed to accept job');
      setToastType('error');
      setShowToast(true);
    } finally {
      setAcceptingJobId(null);
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Jobs at {placeInstance.place?.name || 'Place'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Accept a job to transport cargo to another owned place
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading jobs...</div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No jobs available at this place.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Jobs appear when you own 2+ connected places
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div
                    key={job.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">{job.cargoType}</span>
                          <span className="text-sm text-gray-500">
                            {job.load} units
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          📍 {job.originName || job.startPlaceId} → {job.destinationName || job.endPlaceId}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          job.payType === 'GEMS' ? 'text-purple-600' : 'text-amber-600'
                        }`}>
                          {job.payType === 'GEMS' ? '💎' : '💰'} {job.pay}
                        </div>
                        <div className="text-xs text-gray-400">{job.payType}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptJob(job)}
                      disabled={acceptingJobId === job.id}
                      className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {acceptingJobId === job.id ? 'Accepting...' : 'Accept Job'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}