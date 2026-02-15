import { ShortenLinkForm } from "@/components/ShortenLinkForm";
import { RecentLinksTable, type RecentLink } from "@/components/RecentLinksTable";

export default function Home() {
  const mockLinks: RecentLink[] = [
    {
      id: 1,
      original: "https://dribbble.com/shots/2349812-clean-ui-design",
      short: "shrt.co/xyz892",
    },
    {
      id: 2,
      original: "https://amazon.com/dp/B08X9Y5Z7Q/ref=something",
      short: "shrt.co/amz22",
    },
    {
      id: 3,
      original: "https://medium.com/@username/how-to-build-a-saas",
      short: "shrt.co/med99",
    },
  ];

  function handleShorten(longUrl: string) {
    // @TODO: hook up TanStack Query mutation later
    console.log("shorten:", longUrl);
  }

  function handleCopy(short: string) {
    // @TODO: hook up toast later (sonner)
    navigator.clipboard.writeText(`https://${short}`);
  }

  function handleDelete(id: RecentLink["id"]) {
    console.log("delete:", id);
  }

  function handleClear() {
    console.log("clear history");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="max-w-4xl mx-auto px-4 pt-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Shorten your links.
          <br />
          <span className="text-blue-600">Share with ease.</span>
        </h1>

        <p className="mt-4 text-muted-foreground text-lg">
          Clean up your messy URLs.
          <br />
          Paste a long link to shorten it instantly.
        </p>

        <ShortenLinkForm onShorten={handleShorten} />
      </section>

      <RecentLinksTable links={mockLinks} onClear={handleClear} onCopy={handleCopy} onDelete={handleDelete} />
    </div>
  );
}
