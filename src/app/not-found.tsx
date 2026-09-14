import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-xl border border-border bg-card shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
          <Compass className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-extrabold tracking-tight text-primary">
            404
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            The resource or knowledge workspace you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Button variant="default" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
