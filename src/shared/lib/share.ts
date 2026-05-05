export type ShareResult = "shared" | "copied" | "failed";

export async function shareLink(
  url: string,
  title = "모여 모임 초대",
): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
