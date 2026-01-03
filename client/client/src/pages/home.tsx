import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Send, Mail, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { useSendEmail, useEmailHistory } from "@/hooks/use-email";
import { sendEmailSchema, type SendEmailInput } from "@shared/schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: history, isLoading: isLoadingHistory } = useEmailHistory();
  const { mutate: sendEmail, isPending } = useSendEmail();

  const form = useForm<SendEmailInput>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      to: "",
      subject: "",
      body: "",
    },
  });

  function onSubmit(data: SendEmailInput) {
    sendEmail(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
            SMTP Mailer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Send transactional emails reliably. View your delivery history in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Send Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border/50 shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>Compose Email</CardTitle>
                <CardDescription>
                  Enter the recipient details and message content below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient (To)</FormLabel>
                          <FormControl>
                            <Input placeholder="user@example.com" {...field} className="bg-muted/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Welcome to our platform" {...field} className="bg-muted/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Body</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Type your message here..." 
                              className="min-h-[150px] bg-muted/30 resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    >
                      {isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-full"
          >
            <Card className="h-full border-border/50 shadow-xl shadow-black/5 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Real-time log of email delivery attempts.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    {history?.length || 0} Sent
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-[520px]">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-3">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p>Loading history...</p>
                    </div>
                  ) : history && history.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {history.map((log) => (
                        <div 
                          key={log.id} 
                          className="p-4 hover:bg-muted/30 transition-colors duration-200 group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="font-medium text-sm text-foreground truncate max-w-[200px] sm:max-w-xs">
                              {log.to}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                              <Clock className="w-3 h-3 mr-1" />
                              {log.sentAt ? format(new Date(log.sentAt), "MMM d, h:mm a") : "Just now"}
                            </div>
                          </div>
                          
                          <p className="text-sm font-semibold text-foreground/90 mb-2 truncate">
                            {log.subject}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground line-clamp-1 flex-1 pr-4">
                              {log.body}
                            </p>
                            <Badge 
                              variant={log.status === 'sent' ? 'default' : 'destructive'}
                              className={`
                                text-[10px] px-2 py-0.5 h-6 font-medium border-0
                                ${log.status === 'sent' 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                                }
                              `}
                            >
                              {log.status === 'sent' ? (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {log.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4 px-4 text-center">
                      <div className="p-4 bg-muted/50 rounded-full">
                        <Mail className="w-8 h-8 opacity-50" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">No emails sent yet</p>
                        <p className="text-sm">Use the form to send your first email.</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
