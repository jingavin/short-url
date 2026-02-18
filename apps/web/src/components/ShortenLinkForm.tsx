import { useState } from "react";
import { Link2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createLink } from "@/lib/api";

type ShortenLinkFormProps = {
  onCreated?: (data: { code: string; longUrl: string; shortUrl: string }) => void;
};

export function ShortenLinkForm({ onCreated }: ShortenLinkFormProps) {
  const [url, setUrl] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createLink,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["recentLinks"] });

      // add toast later
      onCreated?.(data);

      setUrl("");
    },
  });

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    mutation.mutate(trimmed);
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

          <Button
            type="submit"
            size="lg"
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Shortening..." : "Shorten"}
          </Button>
        </form>

        {mutation.isError ? <p className="mt-2 text-sm text-red-600">{(mutation.error as Error).message}</p> : null}
      </CardContent>
    </Card>
  );
}
