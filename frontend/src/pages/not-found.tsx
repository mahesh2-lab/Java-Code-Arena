import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-slate-100">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Did you forget to add the page to the router?
          </p>
          
          <div className="mt-6 flex justify-end">
             <Link href="/">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    Return Home
                </Button>
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
