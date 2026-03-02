"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useAppContext } from "@/hooks/useAppContext"
import { getSiteSettings } from "@/server/action/siteSettings"
import { AdminEditable } from "@/components/myComponents/subs/AdminEditable"

const Help = () => {
  const { currentBusiness } = useAppContext();
  const [settings, setSettings] = useState<any>(null);
  useEffect(() => {
    getSiteSettings(currentBusiness?.id).then(setSettings);
  }, [currentBusiness]);
  const helpText = settings?.helpText || "help";
  return (
    <motion.section
      initial = {{ opacity: 0 }}
      animate = {{
        opacity : 1,
        transition : { delay: 0.5, duration: 0.6, ease: "easeIn"}
      }}
      className="w-[100vw] overflow-clip"
    >
      <AdminEditable value={helpText} field="helpText">
        <div className="p-4">{helpText}</div>
      </AdminEditable>
    </motion.section>
  )
}

export default Help
