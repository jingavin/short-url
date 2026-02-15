import { useState } from "react";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type ShortenLinkFormProps = {
  onShorten?: (longUrl: string) => void;
  isLoading?: boolean;
};

export function ShortenLinkForm({ onShorten, isLoading }: ShortenLinkFormProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    onShorten?.(trimmed);
  }

  return (
    <Card className="mt-10 shadow-lg">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long link here..."
              className="pl-10 h-12"
            />
          </div>

          <Button type="submit" size="lg" className="h-12 px-6 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "Shortening..." : "Shorten"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
