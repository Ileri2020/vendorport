"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Message = {
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
    adminResponse?: string;
    isSeen: boolean;
    isResolved: boolean;
    createdAt: string;
    updatedAt: string;
};

export default function MessageHistory() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const fetchMessages = async () => {
        if (!session?.user?.email) return;

        try {
            const res = await axios.get("/api/dbhandler?model=message");
            const userMessages = res.data.filter(
                (msg: any) => msg.senderEmail === session.user.email
            );
            setMessages(userMessages);

            // Mark messages as seen
            userMessages.forEach(async (msg: Message) => {
                if (!msg.isSeen && msg.adminResponse) {
                    await axios.put(`/api/dbhandler?model=message&id=${msg.id}`, {
                        id: msg.id,
                        isSeen: true,
                    });
                }
            });
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [session]);

    const unseenCount = messages.filter(m => !m.isSeen && m.adminResponse).length;

    if (loading) {
        return <div className="p-4">Loading messages...</div>;
    }

    if (!session) {
        return (
            <Card className="m-4">
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                        Please sign in to view your messages
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Message History</h2>
                {unseenCount > 0 && (
                    <Badge variant="destructive" className="text-sm">
                        {unseenCount} New Response{unseenCount > 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {messages.length === 0 ? (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">
                            No messages yet. Send a message using the contact form above.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <Card
                                key={msg.id}
                                className={cn(
                                    "cursor-pointer transition-all hover:shadow-md",
                                    !msg.isSeen && msg.adminResponse && "border-primary"
                                )}
                                onClick={() => setSelectedMessage(msg)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{msg.subject}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(msg.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {!msg.isSeen && msg.adminResponse && (
                                                <Badge variant="destructive">New</Badge>
                                            )}
                                            {msg.isResolved && (
                                                <Badge variant="secondary">Resolved</Badge>
                                            )}
                                            {!msg.adminResponse && !msg.isResolved && (
                                                <Badge variant="outline">Pending</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm line-clamp-2">{msg.message}</p>
                                    {msg.adminResponse && (
                                        <div className="mt-3 p-3 bg-muted rounded-md">
                                            <p className="text-xs font-semibold mb-1">Admin Response:</p>
                                            <p className="text-sm line-clamp-2">{msg.adminResponse}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            )}

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedMessage(null)}
                >
                    <Card
                        className="max-w-2xl w-full max-h-[80vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardHeader>
                            <CardTitle>{selectedMessage.subject}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Sent {formatDistanceToNow(new Date(selectedMessage.createdAt), {
                                    addSuffix: true,
                                })}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold mb-2">Your Message:</p>
                                <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>
                            {selectedMessage.adminResponse && (
                                <div className="p-4 bg-muted rounded-md">
                                    <p className="text-sm font-semibold mb-2">Admin Response:</p>
                                    <p className="text-sm whitespace-pre-wrap">
                                        {selectedMessage.adminResponse}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Responded {formatDistanceToNow(new Date(selectedMessage.updatedAt), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </div>
                            )}
                            <Button
                                onClick={() => setSelectedMessage(null)}
                                className="w-full"
                                variant="outline"
                            >
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
