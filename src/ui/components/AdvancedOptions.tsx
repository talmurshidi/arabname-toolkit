import type { UIStrings } from '@ui/i18n/index.js';
import type { BracketFixOptions } from '@core/transliteration/index.js';

interface Props {
  strings: UIStrings;
  options: BracketFixOptions;
  onChange: (next: BracketFixOptions) => void;
}

export function AdvancedOptions({ strings: s, options, onChange }: Props) {
  return (
    <div className="bg-surface-container/60 border border-gray-200 rounded-xl p-4 space-y-4 text-sm">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={options.enabled}
          onChange={(e) => onChange({ ...options, enabled: e.target.checked })}
          className="mt-0.5 accent-scholargreen"
        />
        <span>
          <span className="font-semibold text-gray-800 block">
            {s.converter.bracketFixEnabledLabel}
          </span>
          <span className="text-gray-500 text-xs">{s.converter.bracketFixEnabledHint}</span>
        </span>
      </label>

      <div>
        <label className="font-semibold text-gray-800 text-xs block mb-1.5">
          {s.converter.wellFormedBracketsLabel}
        </label>
        <select
          value={options.wellFormedBrackets}
          onChange={(e) =>
            onChange({
              ...options,
              wellFormedBrackets: e.target.value as BracketFixOptions['wellFormedBrackets']
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="preserve">{s.converter.wellFormedPreserve}</option>
          <option value="strip-brackets-keep-content">{s.converter.wellFormedStrip}</option>
          <option value="remove-content-and-brackets">{s.converter.wellFormedRemove}</option>
        </select>
      </div>
    </div>
  );
}
