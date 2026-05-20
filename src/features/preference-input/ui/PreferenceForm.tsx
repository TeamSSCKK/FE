"use client";

import { usePreferenceInputStore } from "../model/store";
import {
  DEFAULT_PREFERENCE_TAGS,
  DEFAULT_RESTRICTION_TAGS,
} from "@/entities/room";
import { PreferenceChip } from "./PreferenceChip";
import { RestrictionChip } from "./RestrictionChip";
import { Button } from "@/shared/ui/button";

interface Props {
  onSubmit: () => Promise<void> | void;
  submitLabel?: string;
}

export function PreferenceForm({ onSubmit, submitLabel = "다음" }: Props) {
  const tagStates = usePreferenceInputStore((s) => s.tagStates);
  const restrictionStates = usePreferenceInputStore(
    (s) => s.restrictionStates,
  );
  const cycleTagState = usePreferenceInputStore((s) => s.cycleTagState);
  const toggleRestriction = usePreferenceInputStore((s) => s.toggleRestriction);
  const isSubmitting = usePreferenceInputStore((s) => s.isSubmitting);
  const error = usePreferenceInputStore((s) => s.error);

  return (
    <div className="flex flex-col gap-6 pb-28">
      <section>
        <p className="mb-3 text-xs text-gray-500">선호 / 비선호</p>
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
        <p className="mb-3 text-xs text-gray-500">제한 사항</p>
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

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t bg-white px-5 py-4">
        <Button
          className="w-full bg-purple-600 text-white hover:bg-purple-700"
          size="lg"
          disabled={isSubmitting}
          onClick={() => void onSubmit()}
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
