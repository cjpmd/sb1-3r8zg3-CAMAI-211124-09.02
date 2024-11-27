import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/authStore";

export default function DataDeletion() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { user } = useAuthStore();

  // Handle Facebook's signed_request parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const signedRequest = urlParams.get("signed_request");
    
    if (signedRequest) {
      // Send confirmation back to Facebook
      const confirmation = {
        url: window.location.href,
        confirmation_code: "CONFIRMATION_CODE", // You can generate a unique code here
        status: "success"
      };
      
      document.write(JSON.stringify(confirmation));
    }
  }, []);

  const handleDeleteData = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete your data",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Delete user data from your database
      const response = await fetch("/api/delete-user-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete data");
      }

      setConfirmed(true);
      toast({
        title: "Success",
        description: "Your data has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting data:", error);
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-8 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Data Deletion Instructions</h1>
        
        {confirmed ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-green-600">Data Deletion Confirmed</h2>
            <p className="text-gray-600">
              Your data has been successfully deleted from our platform. This process cannot be undone.
            </p>
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">How to Delete Your Data</h2>
              <p className="text-gray-600">
                We respect your right to delete your data from our platform. This process will:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Remove all your personal information</li>
                <li>Delete your social media connections</li>
                <li>Remove your content and preferences</li>
                <li>Cancel any active subscriptions</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Important Information</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>This action cannot be undone</li>
                <li>You will lose access to all your content</li>
                <li>Your social media connections will be removed</li>
                <li>Your account will be permanently deleted</li>
              </ul>
            </section>

            <div className="pt-6">
              <Button
                onClick={handleDeleteData}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Deleting..." : "Delete My Data"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
