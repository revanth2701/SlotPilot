import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Communities() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Explore Communities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Communities are coming soon.
          </p>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
