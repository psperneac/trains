import { useTranslation } from 'react-i18next';

interface PlaceConnectionsOptionsProps {
  showVisible: boolean;
  onShowVisibleChange: (checked: boolean) => void;
  onCopy?: () => void;
  onDeleteAll?: () => void;
  onImport?: () => void;
  onExport?: () => void;
}

const PlaceConnectionsOptions: React.FC<PlaceConnectionsOptionsProps> = ({
  showVisible,
  onShowVisibleChange,
  onCopy,
  onDeleteAll,
  onImport,
  onExport,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <input
          type="checkbox"
          id="showVisible"
          checked={showVisible}
          onChange={(e) => onShowVisibleChange(e.target.checked)}
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

export default PlaceConnectionsOptions;