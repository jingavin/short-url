import { ShortenLinkForm } from "@/components/ShortenLinkForm";
import { RecentLinksContainer } from "@/components/RecentLinksTable";

export default function Home() {
  function handleCopy(short: string) {
    // @TODO: hook up toast later (sonner)
    navigator.clipboard.writeText(short);
  }

  function handleDelete(id: string | number) {
    console.log("delete:", id);
  }

  function handleClear() {
    console.log("clear history");
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

        <ShortenLinkForm
          onCreated={(data) => {
            navigator.clipboard.writeText(data.shortUrl);
          }}
        />
      </section>

      <RecentLinksContainer onCopy={handleCopy} onDelete={handleDelete} onClear={handleClear} />
    </div>
  );
}
