import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useOptionsStore } from '../store/optionsStore';

interface PlacesOptionsProps {
  onCopy?: () => void;
  onDeleteAll?: () => void;
  onImport?: () => void;
  onExport?: () => void;
}

const PlacesOptions: React.FC<PlacesOptionsProps> = ({
  onCopy,
  onDeleteAll,
  onImport,
  onExport,
}) => {
  const { showLabels, setShowLabels, showVisible, setShowVisible } = useOptionsStore();
  const userId = useAuthStore((state) => state.userId);
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <input
          type="checkbox"
          id="showLabels"
          checked={showLabels}
          onChange={(e) => setShowLabels(e.target.checked, userId)}
          className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="showLabels" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
          {t('placesOptions.showLabels')}
        </label>
      </div>
      <div className="text-xs text-gray-500 px-1 -mt-2">
        <p>{t('placesOptions.showLabelsDescription')}</p>
      </div>

      <hr className="border-gray-200" />

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <input
          type="checkbox"
          id="showVisible"
          checked={showVisible}
          onChange={(e) => setShowVisible(e.target.checked)}
          className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="showVisible" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
          {t('placesOptions.showVisible')}
        </label>
      </div>
      <div className="text-xs text-gray-500 px-1 -mt-2">
        <p>{t('placesOptions.showVisibleDescription')}</p>
      </div>
      
      <hr className="border-gray-200" />
      
      <div className="flex flex-col gap-2">
        <button
          onClick={onCopy}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          {t('common.copy')}
        </button>
        <div className="text-xs text-gray-500 px-1">
          <p>{t('placesOptions.copyDescription')}</p>
        </div>

        <button
          onClick={onDeleteAll}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          {t('common.deleteAll')}
        </button>
        <div className="text-xs text-gray-500 px-1">
          <p>{t('placesOptions.deleteAllDescription')}</p>
        </div>

        <button
          onClick={onImport}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
        >
          {t('common.import')}
        </button>
        <div className="text-xs text-gray-500 px-1">
          <p>{t('placesOptions.importDescription')}</p>
        </div>

        <button
          onClick={onExport}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
        >
          {t('common.export')}
        </button>
        <div className="text-xs text-gray-500 px-1">
          <p>{t('placesOptions.exportDescription')}</p>
        </div>
      </div>
    </div>
  );
};

export default PlacesOptions;