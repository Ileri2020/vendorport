"use client"
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

const AddSectionTrigger = ({ onAdd }: { onAdd: (type: string, layout: string) => void }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="border-2 border-accent text-accent font-black hover:bg-accent hover:text-white transition-all scale-90 hover:scale-100 shadow-sm px-4">
           <PlusCircle className="h-4 w-4 mr-2" /> Add Section Here
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="space-y-2">
              <Label>Section Type</Label>
              <Select onValueChange={(v) => onAdd(v, `UI of ${v}`)}>
                 <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="products">Products Display</SelectItem>
                    <SelectItem value="categories">Categories Grid</SelectItem>
                    <SelectItem value="description">Text/About Section</SelectItem>
                    <SelectItem value="features">Trust Features</SelectItem>
                    <SelectItem value="chat">Chat Button</SelectItem>
                    <SelectItem value="notifications">Announcement Bar</SelectItem>
                    <SelectItem value="contact-form">Contact Form</SelectItem>
                    <SelectItem value="chat-interface">Chat Interface</SelectItem>
                    <SelectItem value="blog-posts">Blog Posts</SelectItem>
                    <SelectItem value="product-list">Product List</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="cart">Cart Details</SelectItem>
                    <SelectItem value="product-details">Product Details</SelectItem>
                    <SelectItem value="staff">Staff/Team</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddSectionTrigger

