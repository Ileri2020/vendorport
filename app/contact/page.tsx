"use client"
import info from "@/data/cont"
import { motion } from "framer-motion"
import contact from "@/data/cont"
import { getSiteSettings } from "@/server/action/siteSettings"
import { AdminEditable } from "@/components/myComponents/subs/AdminEditable"
import { useAppContext } from "@/hooks/useAppContext"
import { useEffect, useState } from "react"
import Social from "@/components/utility/social"
import ContactForm from "@/components/utility/contactForm"
import { useSession } from "next-auth/react"
import { FaEnvelope } from "react-icons/fa"
import { MdOutlinePhone } from "react-icons/md"
import { ChatInterface } from "@/components/myComponents/subs/ChatInterface"

const Contact = () => {
  const { data: session } = useSession();
  const { currentBusiness } = useAppContext();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getSiteSettings(currentBusiness?.id).then(setSettings);
  }, [currentBusiness]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.5, duration: 0.6, ease: "easeIn" }
      }}
      className="w-full overflow-hidden py-12 relative"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Box: Contact Form */}
            <div className="order-2 lg:order-1 bg-card rounded-[2.5rem] shadow-2xl overflow-hidden border">
              <ContactForm />
            </div>

            {/* Right Box: Info */}
            <div className="order-1 lg:order-2 flex flex-col space-y-8 p-6">
              <div>
                <h1 className="text-5xl font-black tracking-tighter mb-4">Let's Connect</h1>
                <AdminEditable value={settings?.contactDesc || contact.description} field="contactDesc">
                  <p className="text-xl text-muted-foreground leading-relaxed italic">
                    {settings?.contactDesc || contact.description}
                  </p>
                </AdminEditable>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                 <div className="flex gap-6 items-center p-4 bg-accent/5 rounded-3xl border border-accent/10">
                    <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-2xl shadow-inner"><FaEnvelope/></div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Us</p>
                       <AdminEditable value={settings?.contactEmail || "support@vendorport.com"} field="contactEmail">
                          <p className="font-bold text-lg">{settings?.contactEmail || "support@vendorport.com"}</p>
                       </AdminEditable>
                    </div>
                 </div>
                 <div className="flex gap-6 items-center p-4 bg-accent/5 rounded-3xl border border-accent/10">
                    <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-2xl shadow-inner"><MdOutlinePhone/></div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Call Us</p>
                       <AdminEditable value={settings?.contactPhone || "+234 800 000 0000"} field="contactPhone">
                          <p className="font-bold text-lg">{settings?.contactPhone || "+234 800 000 0000"}</p>
                       </AdminEditable>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-dashed">
                <p className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-center lg:text-left">Follow Our Journey</p>
                <Social
                  containerStyles='flex gap-4'
                  iconStyles='w-12 h-12 border-2 border-accent rounded-2xl flex justify-center items-center text-accent text-xl hover:bg-accent hover:text-white transition-all duration-500 shadow-lg shadow-accent/10'
                />
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="pt-16 border-t">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-black tracking-tight mb-2">Live Support</h2>
                <p className="text-muted-foreground">Chat with our dedicated support team in real-time.</p>
             </div>
             <ChatInterface />
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default Contact
