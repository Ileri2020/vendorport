"use client"
import info from "@/data/cont"
import { motion } from "framer-motion"
import contact from "@/data/cont"
import Social from "@/components/utility/social"
import ContactForm from "@/components/utility/contactForm"
import MessageHistory from "@/components/utility/MessageHistory"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import axios from "axios"

const Contact = () => {
  const { data: session } = useSession();
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    const fetchUnseenCount = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await axios.get("/api/dbhandler?model=message");
        const userMessages = res.data.filter(
          (msg: any) => msg.senderEmail === session.user.email && !msg.isSeen && msg.adminResponse
        );
        setUnseenCount(userMessages.length);
      } catch (error) {
        console.error("Failed to fetch unseen count:", error);
      }
    };

    fetchUnseenCount();
    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchUnseenCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.5, duration: 0.6, ease: "easeIn" }
      }}
      className="w-[100vw] overflow-clip py-6 relative"
    >
      {/* Unseen Messages Badge */}
      {unseenCount > 0 && (
        <div className="fixed top-20 right-4 z-50 md:top-24 md:right-8">
          <Badge variant="destructive" className="text-sm px-3 py-1 shadow-lg animate-pulse">
            {unseenCount} New Message{unseenCount > 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      <div className="container mx-auto">
        <div className="flex flex-col xl:flex-row gap-[30px]">
          <div className="xl:h-[54%] order-2 xl:order-none">
            <ContactForm />
          </div>
          <div className="flex flex-col flex-1 max-w-[480px] mx-3">
            <div className="text-2xl font-semibold my-3 text-center md:text-start">Let's talk</div>
            <div className="my-5">{contact.description}</div>
            <div className="flex flex-col">
              {contact.contact.map((contact, index) => {
                return (
                  <div className="flex flex-row m-2" key={index}>
                    <div className="p-2 text-3xl">{contact.icon}</div>
                    <div className="flex flex-col mx-5">
                      <div className="text-lg my-1">{contact.text}</div>
                      <div>{contact.value}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="w-full mx-2 my-10 flex justify-center items-center">
              <Social
                containerStyles='flex gap-4 md:gap-6 mx-auto'
                iconStyles='w-9 h-9 border border-accent rounded-full flex justify-center items-center text-accent text-base hover:bg-accent hover:text-background/80 hover:transition-all duration-500'
              />
            </div>
          </div>
        </div>

        {/* Message History Section */}
        {session && (
          <div className="mt-12">
            <MessageHistory />
          </div>
        )}
      </div>
    </motion.section>
  )
}

export default Contact
