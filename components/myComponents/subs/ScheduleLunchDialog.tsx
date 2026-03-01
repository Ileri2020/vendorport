"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { scheduleLunch } from "@/action/lunch"
import { toast } from "sonner"
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ScheduleLunchDialogProps {
    isOpen: boolean
    onClose: () => void
    templateId: string
    templateName: string
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function ScheduleLunchDialog({ isOpen, onClose, templateId, templateName }: ScheduleLunchDialogProps) {
    const [name, setName] = useState(`Schedule for ${templateName}`)
    const [frequency, setFrequency] = useState("daily")
    const [startDate, setStartDate] = useState<Date>(new Date())
    const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>([])
    const [timesInDay, setTimesInDay] = useState<string[]>(["12:00"])
    const [deliveryFeeTotal, setDeliveryFeeTotal] = useState(1000)
    const [loading, setLoading] = useState(false)

    const handleSchedule = async () => {
        if (!name) return toast.error("Please enter a name")
        if (frequency === 'weekly' && daysOfWeek.length === 0) return toast.error("Please select at least one day")
        
        setLoading(true)
        try {
            const res = await scheduleLunch({
                templateId,
                name,
                frequency,
                daysOfWeek,
                timesInDay,
                startDate,
                endDate,
                deliveryFeeTotal
            })
            if (res.success) {
                toast.success("Lunch scheduled successfully!")
                onClose()
            } else {
                toast.error(res.error || "Failed to schedule lunch")
            }
        } catch (e) {
            toast.error("Error scheduling lunch")
        } finally {
            setLoading(false)
        }
    }

    const toggleDay = (day: string) => {
        setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
    }

    const addTime = () => setTimesInDay([...timesInDay, "12:00"])
    const updateTime = (index: number, val: string) => {
        const newTimes = [...timesInDay]
        newTimes[index] = val
        setTimesInDay(newTimes)
    }
    const removeTime = (index: number) => {
        if (timesInDay.length > 1) {
            setTimesInDay(timesInDay.filter((_, i) => i !== index))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Schedule Periodic Lunch</DialogTitle>
                    <DialogDescription>
                        Set up a recurring delivery schedule for this lunch list.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Schedule Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Frequency</Label>
                            <Select value={frequency} onValueChange={setFrequency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="once">Once</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Total Delivery Fee (Spread)</Label>
                            <Input type="number" value={deliveryFeeTotal} onChange={(e) => setDeliveryFeeTotal(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {frequency === "weekly" && (
                        <div className="grid gap-2">
                            <Label>Days of Week</Label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map(day => (
                                    <div key={day} className="flex items-center space-x-2 bg-muted px-2 py-1 rounded-md">
                                        <Checkbox id={day} checked={daysOfWeek.includes(day)} onCheckedChange={() => toggleDay(day)} />
                                        <Label htmlFor={day} className="capitalize cursor-pointer text-xs">{day.slice(0,3)}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                            <Label>Delivery Times in Day</Label>
                            <Button variant="ghost" size="sm" onClick={addTime}><Plus className="h-4 w-4 mr-1"/> Add</Button>
                        </div>
                        <div className="space-y-2">
                            {timesInDay.map((time, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input type="time" value={time} onChange={(e) => updateTime(idx, e.target.value)} className="flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => removeTime(idx)} disabled={timesInDay.length === 1}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSchedule} disabled={loading}>
                        {loading ? "Scheduling..." : "Schedule Lunch"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
