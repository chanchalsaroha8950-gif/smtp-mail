import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SendEmailInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useEmailHistory() {
  return useQuery({
    queryKey: [api.email.history.path],
    queryFn: async () => {
      const res = await fetch(api.email.history.path);
      if (!res.ok) throw new Error("Failed to fetch email history");
      return api.email.history.responses[200].parse(await res.json());
    },
    // Refresh history every 10 seconds to catch status updates if any
    refetchInterval: 10000, 
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SendEmailInput) => {
      // Validate data against schema before sending
      const validated = api.email.send.input.parse(data);
      
      const res = await fetch(api.email.send.path, {
        method: api.email.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        // Try to parse specific error message if available
        try {
          const errorData = await res.json();
          if (res.status === 400) {
            const error = api.email.send.responses[400].parse(errorData);
            throw new Error(error.message);
          }
          if (res.status === 500) {
            const error = api.email.send.responses[500].parse(errorData);
            throw new Error(error.message);
          }
        } catch (e) {
          // Fallback if parsing fails or specific schema doesn't match
          throw new Error(e instanceof Error ? e.message : "Failed to send email");
        }
        throw new Error("An unexpected error occurred");
      }

      return api.email.send.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Email Sent Successfully",
        description: data.message,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [api.email.history.path] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
