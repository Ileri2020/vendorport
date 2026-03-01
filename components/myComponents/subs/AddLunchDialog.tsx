"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getUserLunches, createLunch, addToLunch } from "@/action/lunch"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AddLunchDialogProps {
  isOpen: boolean
  onClose: () => void
  productId: string
}

export function AddLunchDialog({ isOpen, onClose, productId }: AddLunchDialogProps) {
  const [lunches, setLunches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedLunchId, setSelectedLunchId] = useState<string>("")
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newLunchName, setNewLunchName] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchLunches()
      setIsCreatingNew(false)
      setSelectedLunchId("")
      setNewLunchName("")
    }
  }, [isOpen])

  const fetchLunches = async () => {
    setLoading(true)
    try {
      const data = await getUserLunches()
      setLunches(data.templates || [])
    } catch (error) {
      console.error("Failed to fetch lunches", error)
      toast.error("Failed to load your lunch lists")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      if (isCreatingNew) {
        if (!newLunchName.trim()) {
           toast.error("Please enter a name for the new lunch")
           setSubmitting(false)
           return
        }
        const res = await createLunch(newLunchName, productId)
        if (res.success) {
            toast.success(`Created "${newLunchName}" and added product`)
            onClose()
        } else {
            toast.error("Failed to create lunch")
        }
      } else {
        if (!selectedLunchId) {
            toast.error("Please select a lunch list")
             setSubmitting(false)
            return
        }
        const res = await addToLunch(selectedLunchId, productId)
        if (res.success) {
            toast.success("Added to lunch list")
            onClose()
        } else {
            toast.error("Failed to add to lunch")
        }
      }
    } catch (error) {
        console.error(error)
        toast.error("An error occurred")
    } finally {
        setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Lunch List</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {lunches.length > 0 && !isCreatingNew ? (
                <div className="space-y-3">
                   <Label>Select a Lunch List</Label>
                   <RadioGroup value={selectedLunchId} onValueChange={setSelectedLunchId}>
                      {lunches.map((lunch) => (
                        <div key={lunch.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent/50 cursor-pointer">
                          <RadioGroupItem value={lunch.id} id={lunch.id} />
                          <Label htmlFor={lunch.id} className="cursor-pointer flex-1 cursor-pointer">
                            {lunch.name} <span className="text-muted-foreground text-xs">({lunch.products?.length || 0} items)</span>
                          </Label>
                        </div>
                      ))}
                   </RadioGroup>
                   
                   <div className="pt-2">
                     <Button variant="outline" size="sm" className="w-full" onClick={() => setIsCreatingNew(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Lunch
                     </Button>
                   </div>
                </div>
              ) : (
                <div className="space-y-3">
                    <Label>{lunches.length === 0 ? "You don't have any lunch lists yet" : "Create New Lunch List"}</Label>
                    <Input 
                        placeholder="e.g. Work Lunch, Weekend Treat" 
                        value={newLunchName}
                        onChange={(e) => setNewLunchName(e.target.value)}
                    />
                    
                    {lunches.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setIsCreatingNew(false)}>
                            Cancel
                        </Button>
                    )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={submitting || loading || (!isCreatingNew && !selectedLunchId)}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
