"use client"
import React from 'react'
import { useAppContext } from '@/hooks/useAppContext'

interface PriceDisplayProps {
  amount: number
  className?: string
}

export const PriceDisplay = ({ amount, className = "" }: PriceDisplayProps) => {
  const { currentBusiness } = useAppContext();
  
  const currency = currentBusiness?.settings?.currency || "NGN";
  const exchangeRate = currentBusiness?.settings?.exchangeRate || 1.0;
  
  const convertedAmount = amount * exchangeRate;
  
  // Format based on currency
  let formattedPrice = "";
  try {
    formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'NGN',
    }).format(convertedAmount);
  } catch (e) {
    formattedPrice = `${currency || 'NGN'} ${convertedAmount.toLocaleString()}`;
  }

  return (
    <span className={className}>
      {formattedPrice}
    </span>
  )
}
