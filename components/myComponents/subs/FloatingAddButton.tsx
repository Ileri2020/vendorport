"use client"

import React, { useState } from "react"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ProductForm from "@/prisma/forms/ProductForm"

export const FloatingAddButton = () => {
  const isAdmin = useIsAdmin()
  const [isOpen, setIsOpen] = useState(false)

  if (!isAdmin) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-2xl bg-primary text-white hover:scale-110 transition-transform"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm hideList={true} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
