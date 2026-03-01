"use client"
import React from 'react'
import { useAppContext } from '@/hooks/useAppContext'

interface PriceDisplayProps {
  amount: number
  className?: string
}

export const PriceDisplay = ({ amount, className = "" }: PriceDisplayProps) => {
  const { currentBusiness } = useAppContext();
  
  const currency = currentBusiness?.settings?.currency || "USD";
  const exchangeRate = currentBusiness?.settings?.exchangeRate || 1.0;
  
  const convertedAmount = amount * exchangeRate;
  
  // Format based on currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(convertedAmount);

  return (
    <span className={className}>
      {formattedPrice}
    </span>
  )
}
