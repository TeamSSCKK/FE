import { usePreferenceInputStore } from "../model/store";
import {
  DEFAULT_PREFERENCE_TAGS,
  DEFAULT_RESTRICTION_TAGS,
} from "@/entities/room/model/preference-constants";
import { PreferenceChip } from "./PreferenceChip";
import { RestrictionChip } from "./RestrictionChip";

interface Props {
  onSubmit: () => Promise<void> | void;
  submitLabel?: string;
}

export function PreferenceForm({ onSubmit, submitLabel = "다음" }: Props) {
  const tagStates = usePreferenceInputStore((s) => s.tagStates);
  const restrictionStates = usePreferenceInputStore((s) => s.restrictionStates);
  const cycleTagState = usePreferenceInputStore((s) => s.cycleTagState);
  const toggleRestriction = usePreferenceInputStore((s) => s.toggleRestriction);
  const isSubmitting = usePreferenceInputStore((s) => s.isSubmitting);
  const error = usePreferenceInputStore((s) => s.error);

  return (
    <div className="flex flex-col gap-6 pb-28">
      <section>
        <p className="text-xs text-gray-500 mb-3">선호 / 비선호</p>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_PREFERENCE_TAGS.map((tag) => (
            <PreferenceChip
              key={tag.id}
              label={tag.label}
              state={tagStates[tag.id] ?? "neutral"}
              onClick={() => cycleTagState(tag.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs text-gray-500 mb-3">제한 사항</p>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_RESTRICTION_TAGS.map((tag) => (
            <RestrictionChip
              key={tag.id}
              label={tag.label}
              selected={!!restrictionStates[tag.id]}
              onClick={() => toggleRestriction(tag.id)}
            />
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 py-4 bg-white border-t">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void onSubmit()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-4 font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
