"use client"

import { motion } from "framer-motion"
import Social from "@/components/utility/social"
import ContactForm from "@/components/utility/contactForm"
import { ChatInterface } from "@/components/myComponents/subs/ChatInterface"
import { useAppContext } from "@/hooks/useAppContext"
import { FaEnvelope } from "react-icons/fa"
import { MdOutlinePhone } from "react-icons/md"
import { CiLocationOn } from "react-icons/ci"

const Contact = () => {
  const { currentBusiness } = useAppContext();
  const settings = currentBusiness?.siteSettings || {};

  const contactDescription = settings.contactDesc !== undefined ? settings.contactDesc : "If you have any questions, inquiries, or would like to hire me, I would love to hear from you. Please feel free to reach out using the contact information provided below:";
  const contactEmail = settings.contactEmail !== undefined ? settings.contactEmail : "healthcliquespecialties@gmail.com";
  const contactPhone = settings.contactPhone !== undefined ? settings.contactPhone : "(+234) 816 968 4400";
  const contactAddress = settings.address !== undefined ? settings.address : "22 Akinagbe, Alapere, Ketu, Lagos State";

  const contactList = [
    {
      icon: <FaEnvelope />,
      text: "Email",
      value: contactEmail,
    },
    {
      icon: <MdOutlinePhone />,
      text: "Phone",
      value: contactPhone,
    },
    {
      icon: <CiLocationOn />,
      text: "Address",
      value: contactAddress,
    },
  ];

  return (
    <motion.section
      initial = {{ opacity: 0 }}
      animate = {{
        opacity : 1,
        transition : { delay: 0.5, duration: 0.6, ease: "easeIn"}
      }}
      className="w-[100vw] overflow-clip py-6"
    >
      <div className="container mx-auto">
        <div className="flex flex-col xl:flex-row gap-[30px]">
          <div className="xl:h-[54%] order-2 xl:order-none">
            <ContactForm />
          </div>
          <div className="flex flex-col flex-1 max-w-[480px] mx-3">
            <div className="text-2xl font-semibold my-3 text-center md:text-start">Let's talk</div>
            <div className="my-5">{contactDescription}</div>
            <div className="flex flex-col">
              {contactList.map((item, index)=>{
                return (
                  <div className="flex flex-row m-2" key={index}>
                    <div className="p-2 text-3xl">{item.icon}</div>
                    <div className="flex flex-col mx-5">
                      <div className="text-lg my-1">{item.text}</div>
                      <div>{item.value}</div>
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

        {/* Chat with Pharmacist Section */}
        <div className="mt-20">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-primary">Chat with our Pharmacist</h2>
            <p className="text-muted-foreground mt-2">Get instant answers to your medical questions</p>
          </div>
          <ChatInterface />
        </div>
      </div>
    </motion.section>
  )
}

export default Contact
