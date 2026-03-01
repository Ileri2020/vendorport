"use client"
import React from 'react'
import { PlatformStore } from '@/components/platform/PlatformStore'
import { motion } from 'framer-motion'

export default function StorePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <PlatformStore />
    </motion.div>
  )
}
