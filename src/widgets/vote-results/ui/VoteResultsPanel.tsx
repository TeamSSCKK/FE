"use client";

import { useState } from "react";
import { AlertTriangle, Check, Crown } from "lucide-react";
import { closeVote } from "@/features/vote-action";
import type { VoteResults, VoteType } from "@/entities/vote";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

interface Props {
  voteType: VoteType;
  results: VoteResults | null;
  isHost: boolean;
  meetingId: string | null;
  candidateName: (id: string) => string;
  /** 호스트가 확정에 성공했을 때 호출(부모가 후속 처리·이동). */
  onResolved: (finalCandidateId: string) => void;
}

/** 실시간 득표 현황 + 동률 주최자 중재 패널. */
export function VoteResultsPanel({
  voteType,
  results,
  isHost,
  meetingId,
  candidateName,
  onResolved,
}: Props) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!results) return null;

  const totalVotes = results.tally.reduce((sum, entry) => sum + entry.count, 0);
  const maxCount = results.tally.length
    ? Math.max(...results.tally.map((entry) => entry.count))
    : 0;

  const finalize = async (finalCandidateId?: string) => {
    if (!meetingId || isClosing) return;
    setIsClosing(true);
    setError(null);
    try {
      const res = await closeVote({ meetingId, voteType, finalCandidateId });
      if (res.resolved) {
        onResolved(res.finalCandidateId);
      } else if (res.reason === "TIE") {
        setError("확정 직전 동률이 다시 발생했어요. 후보를 다시 선택해주세요.");
      } else {
        setError("아직 투표가 없어요.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "확정에 실패했어요.");
    } finally {
      setIsClosing(false);
    }
  };

  if (results.finalized && results.finalCandidateId) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.05] p-4">
        <div className="flex items-center gap-1.5 text-primary">
          <Check className="h-4 w-4" />
          <p className="text-[13px] font-semibold">확정되었어요</p>
        </div>
        <p className="mt-1 text-[16px] font-bold text-gray-900">
          {candidateName(results.finalCandidateId)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl bg-primary/[0.04] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-gray-900">실시간 투표 현황</p>
        <p className="text-[12px] text-muted-foreground">총 {totalVotes}표</p>
      </div>

      {results.tally.length === 0 ? (
        <p className="py-2 text-center text-[13px] text-muted-foreground">
          아직 투표가 없어요. 후보에 투표해보세요.
        </p>
      ) : (
        <ul className="space-y-2">
          {results.tally.map((entry) => {
            const leading = entry.count === maxCount;
            const pct = totalVotes ? Math.round((entry.count / totalVotes) * 100) : 0;
            return (
              <li key={entry.candidateId}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="inline-flex items-center gap-1 font-medium text-gray-900">
                    {leading && <Crown className="h-3.5 w-3.5 text-primary" />}
                    {candidateName(entry.candidateId)}
                  </span>
                  <span className="text-muted-foreground">{entry.count}표</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      leading ? "bg-primary" : "bg-primary/40",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {results.isTie && (
        <div className="flex items-start gap-2 rounded-xl bg-yellow-50 p-3">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
          <p className="text-[12px] text-gray-700">
            공동 1위가 있어요.{" "}
            {isHost ? "한 곳을 선택해 확정해주세요." : "주최자가 결정 중이에요."}
          </p>
        </div>
      )}

      {error && <p className="text-[12px] text-destructive">{error}</p>}

      {isHost ? (
        results.tally.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">
            한 표 이상 모이면 확정할 수 있어요.
          </p>
        ) : results.isTie ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {results.topCandidates.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPickedId(id)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-[13px] transition",
                    pickedId === id
                      ? "border-primary bg-primary/5 font-semibold"
                      : "border-border/50",
                  )}
                >
                  {candidateName(id)}
                </button>
              ))}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!pickedId || isClosing}
                  className="h-11 w-full rounded-xl text-sm font-semibold"
                >
                  선택한 후보로 확정하기
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>이대로 확정할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {pickedId ? candidateName(pickedId) : ""}(으)로 확정합니다. 확정 후에는
                    되돌릴 수 없어요.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => pickedId && void finalize(pickedId)}>
                    확정하기
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isClosing}
                className="h-11 w-full rounded-xl text-sm font-semibold"
              >
                {results.winnerId
                  ? `'${candidateName(results.winnerId)}'(으)로 확정하기`
                  : "확정하기"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>이대로 확정할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  최다 득표 후보로 확정합니다. 확정 후에는 되돌릴 수 없어요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={() => void finalize()}>확정하기</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      ) : (
        <p className="text-[12px] text-muted-foreground">
          {results.isTie ? "주최자가 결정 중이에요." : "주최자가 결정하면 확정돼요."}
        </p>
      )}
    </div>
  );
}
