"use client"
import React, { useState, useEffect } from 'react'
import { useAppContext } from '@/hooks/useAppContext'
import { useParams } from 'next/navigation'

export const useIsBusinessAdmin = () => {
  const { user, currentBusiness } = useAppContext();
  const { storeName } = useParams();
  
  if (!user || user.id === "nil" || !currentBusiness) return false;
  
  // Check if current user is the owner of the business OR is a supreme admin
  const isOwner = user.id === currentBusiness.ownerId || user.role === 'supreme';
  
  // Check if the business slug matches the storeName in URL OR is supreme admin
  const currentSlug = currentBusiness.name.toLowerCase().replace(/\s+/g, '-');
  const isCorrectDomain = currentSlug === storeName || user.role === 'supreme';
  
  return isOwner && isCorrectDomain;
}
