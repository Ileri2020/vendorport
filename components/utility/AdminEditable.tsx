"use client"
import React, { useState } from 'react'
import { useIsBusinessAdmin } from '@/hooks/useIsBusinessAdmin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Check, X } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'

interface AdminEditableProps {
  value: string
  model: string // e.g., 'section', 'business'
  id: string
  field: string // e.g., 'data.title', 'name'
  data?: any   // The whole data object if field is nested in data
  onSave?: (newValue: string) => void
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  children?: React.ReactNode
}

export const AdminEditable = ({ 
  value, 
  model, 
  id, 
  field, 
  data,
  onSave, 
  className = "", 
  as: Component = 'span',
  children
}: AdminEditableProps) => {
  const isAdmin = useIsBusinessAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData: any = { id };
      if (field.startsWith('data.')) {
        const key = field.replace('data.', '');
        updateData.data = { ...data, [key]: currentValue };
      } else {
        updateData[field] = currentValue;
      }
      
      await axios.put(`/api/dbhandler?model=${model}`, updateData);
      
      if (onSave) onSave(currentValue);
      setIsEditing(false);
      toast.success("Updated successfully");
      // Optional: window.location.reload() if we want to ensure context sync
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return <Component className={className}>{children || value}</Component>;
  }

  return (
    <div className={`group relative inline-flex items-center gap-2 ${className}`}>
      {isEditing ? (
        <div className="flex items-center gap-1 w-full">
          <Input 
            value={currentValue} 
            onChange={(e) => setCurrentValue(e.target.value)}
            className="h-8 py-0 px-2 min-w-[200px]"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSave} disabled={isLoading}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => { setIsEditing(false); setCurrentValue(value); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <Component className={className}>{children || value}</Component>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 opacity-100 transition-opacity bg-accent/10 hover:bg-accent/20"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  )
}
