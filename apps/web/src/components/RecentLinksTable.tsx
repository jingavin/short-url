import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentLinks } from "@/lib/api";

export type RecentLink = {
  id: string | number;
  original: string;
  short: string;
  createdAt?: string;
};

type RecentLinksHandlers = {
  onClear?: () => void;
  onCopy?: (short: string) => void;
  onDelete?: (id: RecentLink["id"]) => void;
};

type RecentLinksTableProps = RecentLinksHandlers & {
  links: RecentLink[];
};

export function RecentLinksContainer({ onCopy, onDelete, onClear }: RecentLinksHandlers) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["recentLinks"],
    queryFn: fetchRecentLinks,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load links</div>;

  return <RecentLinksTable links={data} onCopy={onCopy} onDelete={onDelete} onClear={onClear} />;
}

export function RecentLinksTable({ links, onClear, onCopy, onDelete }: RecentLinksTableProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 mt-16 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Links</h2>
        <Button variant="link" className="text-blue-600 p-0" onClick={onClear} disabled={links.length === 0}>
          Clear History
        </Button>
      </div>

      <Card>
        <CardContent className="p-2">
          <Table>
            <TableHeader>
              <TableRow className="p-10">
                <TableHead>Original Link</TableHead>
                <TableHead>Shortened Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    No links yet. Paste a URL above to create one.
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="truncate max-w-75">{link.original}</TableCell>

                    <TableCell>
                      <a href={link.short} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                        {link.short}
                      </a>
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCopy?.(link.short)}
                        aria-label="Copy shortened link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button variant="ghost" size="icon" onClick={() => onDelete?.(link.id)} aria-label="Delete link">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
