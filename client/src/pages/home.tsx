import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Send, Mail, Clock, AlertCircle, CheckCircle2, Code } from "lucide-react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Home() {
  const { data: history, isLoading: isLoadingHistory } = useEmailHistory();
  const { mutate: sendEmail, isPending } = useSendEmail();
  const [isHtmlMode, setIsHtmlMode] = useState(false);

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
            Email Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compose and send emails with ease. Supports plain text and HTML designs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Send Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border/50 shadow-xl shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                  <CardTitle>Compose Email</CardTitle>
                  <CardDescription>
                    Send designed messages to your users.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsHtmlMode(!isHtmlMode)}
                  className={`gap-2 ${isHtmlMode ? 'bg-primary/10 border-primary/50' : ''}`}
                >
                  <Code className="w-4 h-4" />
                  {isHtmlMode ? 'HTML Mode' : 'Text Mode'}
                </Button>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Email</FormLabel>
                          <FormControl>
                            <Input placeholder="recipient@example.com" {...field} className="bg-muted/30" />
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
                            <Input placeholder="Type subject here..." {...field} className="bg-muted/30" />
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
                          <FormLabel>Message Content</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea 
                                placeholder={isHtmlMode ? "Enter HTML code here..." : "Type your message here..."}
                                className={`min-h-[200px] bg-muted/30 resize-none font-mono ${isHtmlMode ? 'text-primary' : ''}`}
                                {...field} 
                              />
                              {isHtmlMode && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="secondary" className="bg-primary/20 text-[10px] uppercase">
                                    HTML
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            {isHtmlMode ? 'Use HTML tags for a professional design.' : 'Plain text messages will be sent as simple paragraphs.'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                      {isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-full"
          >
            <Card className="h-full border-border/50 shadow-xl shadow-black/5 flex flex-col min-h-[600px]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Delivery History</CardTitle>
                    <CardDescription>
                      Monitor your message status.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="px-3 py-1 bg-muted/50">
                    {history?.length || 0} Total
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-[520px]">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-3">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p>Fetching history...</p>
                    </div>
                  ) : history && history.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {history.map((log) => (
                        <div 
                          key={log.id} 
                          className="p-5 hover:bg-muted/30 transition-colors duration-200"
                        >
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="font-semibold text-sm text-foreground truncate max-w-[200px]">
                              {log.to}
                            </div>
                            <div className="flex items-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                              <Clock className="w-3 h-3 mr-1" />
                              {log.sentAt ? format(new Date(log.sentAt), "MMM d, h:mm a") : "Just now"}
                            </div>
                          </div>
                          
                          <p className="text-sm font-medium text-foreground/80 mb-3 truncate">
                            {log.subject}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={log.status === 'sent' ? 'default' : 'destructive'}
                              className={`
                                text-[10px] px-2 py-0.5 font-bold border-0
                                ${log.status === 'sent' 
                                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
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
                            {log.status === 'failed' && log.error && (
                              <p className="text-[10px] text-red-500 font-medium truncate max-w-[150px]">
                                {log.error}
                              </p>
                            )}
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
                        <p className="font-medium text-foreground">No messages found</p>
                        <p className="text-sm">Sent messages will appear here.</p>
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
