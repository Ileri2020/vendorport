"use client"
import React, { useState, useEffect } from 'react'
import { useAppContext } from '@/hooks/useAppContext'
import { useParams } from 'next/navigation'

export const useIsBusinessAdmin = () => {
  const { user, currentBusiness } = useAppContext();
  const { storeName } = useParams();
  
  if (!user || user.id === "nil" || !currentBusiness) return false;
  
  // Check if current user is the owner of the business
  const isOwner = user.id === currentBusiness.ownerId;
  
  // Check if the business slug matches the storeName in URL
  const currentSlug = currentBusiness.name.toLowerCase().replace(/\s+/g, '-');
  const isCorrectDomain = currentSlug === storeName;
  
  return isOwner && isCorrectDomain;
}
