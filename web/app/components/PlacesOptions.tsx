import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useOptionsStore } from '../store/optionsStore';

const PlacesOptions: React.FC = () => {
  const { showLabels, setShowLabels } = useOptionsStore();
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
      
      <div className="text-xs text-gray-500 px-1">
        <p>{t('placesOptions.description')}</p>
      </div>
    </div>
  );
};

export default PlacesOptions;
