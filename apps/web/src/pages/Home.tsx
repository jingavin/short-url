import { ShortenLinkForm } from "@/components/ShortenLinkForm";
import { RecentLinksContainer } from "@/components/RecentLinksTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLink, clearLinks } from "@/lib/api";
import { toast } from "sonner";

export default function Home() {
  function handleCopy(short: string) {
    navigator.clipboard.writeText(short);

    toast.success("Copied to clipboard", {
      description: short,
    });
  }

  const qc = useQueryClient();

  const delMut = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recentLinks"] });

      toast.success("Removed from history", {
        description: "The link still works but is hidden from your history.",
      });
    },
    onError: () => {
      toast.error("Delete failed");
    },
  });

  const clearMut = useMutation({
    mutationFn: clearLinks,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recentLinks"] });

      toast.success("History cleared");
    },
  });

  function handleDelete(id: string | number) {
    delMut.mutate(id);
  }

  function handleClear() {
    clearMut.mutate();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="max-w-4xl mx-auto px-4 pt-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="text-blue-600">tinyr</span>
          <br />
          Shorten your links
          <br />
          Share with ease
        </h1>

        <p className="mt-4 text-muted-foreground text-lg">
          Clean up your messy URLs.
          <br />
          Paste a long link to shorten it instantly.
        </p>

        <ShortenLinkForm />
      </section>

      <RecentLinksContainer onCopy={handleCopy} onDelete={handleDelete} onClear={handleClear} />
    </div>
  );
}
