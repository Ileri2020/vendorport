"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

export function useMessageNotifications() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session?.user?.email) return;

        let lastCheckedTime = new Date();

        const checkForNewMessages = async () => {
            try {
                const res = await axios.get("/api/dbhandler?model=message");
                const userMessages = res.data.filter(
                    (msg: any) =>
                        msg.senderEmail === session.user.email &&
                        !msg.isSeen &&
                        msg.adminResponse &&
                        new Date(msg.updatedAt) > lastCheckedTime
                );

                userMessages.forEach((msg: any) => {
                    toast.info(`New response to: ${msg.subject}`, {
                        description: "Click to view your message",
                        action: {
                            label: "View",
                            onClick: () => router.push("/contact"),
                        },
                        duration: 10000,
                    });
                });

                if (userMessages.length > 0) {
                    lastCheckedTime = new Date();
                }
            } catch (error) {
                console.error("Failed to check for new messages:", error);
            }
        };

        // Check immediately on mount
        checkForNewMessages();

        // Then check every 60 seconds
        const interval = setInterval(checkForNewMessages, 60000);

        return () => clearInterval(interval);
    }, [session, router]);
}
