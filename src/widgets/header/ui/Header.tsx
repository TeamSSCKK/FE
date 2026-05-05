import { MapPin } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
      <div className="flex items-center gap-2 font-semibold">
        <MapPin className="h-5 w-5" aria-hidden />
        모여
      </div>
    </header>
  );
}
