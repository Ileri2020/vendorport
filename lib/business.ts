import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getCachedBusiness = cache(async (slug: string) => {
  return prisma.business.findUnique({
    where: { name: slug },
    include: {
      siteSettings: true,
      categories: true,
      products: {
        include: {
          category: true,
          stock: true,
          reviews: true
        }
      },
      featuredProducts: {
        include: {
          product: {
            include: {
              category: true,
              stock: true
            }
          }
        }
      }
    }
  })
})