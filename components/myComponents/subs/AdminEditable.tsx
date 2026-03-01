"use client"

import React, { useState, useEffect } from "react"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { updateSiteSettings } from "@/server/action/siteSettings"
import { toast } from "sonner"
import { Edit2, Check, X } from "lucide-react"

interface AdminEditableProps {
  value: string
  field: "aboutText" | "addToHome"
  children: React.ReactNode
}

export const AdminEditable = ({ value, field, children }: AdminEditableProps) => {
  const isAdmin = useIsAdmin()
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  if (!isAdmin) return <>{children}</>

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateSiteSettings({ [field]: currentValue })
    if (res.success) {
      toast.success("Settings updated")
      setIsEditing(false)
    } else {
      toast.error("Failed to update settings")
    }
    setIsSaving(false)
  }

  if (isEditing) {
    return (
      <div className="relative group w-full">
        <Textarea
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="min-h-[100px] w-full p-2 border-2 border-primary focus:ring-primary"
        />
        <div className="flex gap-2 mt-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setCurrentValue(value); }}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : <><Check className="h-4 w-4 mr-1" /> Save</>}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white p-1 rounded-full shadow-lg z-10">
        <Edit2 className="h-3 w-3" />
      </div>
      <div className="group-hover:ring-2 group-hover:ring-primary/50 group-hover:rounded-md transition-all p-1">
        {children}
      </div>
    </div>
  )
}
