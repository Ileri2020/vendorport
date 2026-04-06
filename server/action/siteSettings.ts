"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface SiteSettingsInput {
  aboutText?: string;
  addToHome?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  contactDesc?: string;
  contactEmail?: string;
  contactPhone?: string;
  helpText?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  iconMode?: string;
  iconText?: string;
  iconFontSize?: number;
  iconFontColor?: string;
  iconImageUrl?: string;
  iconImageWidth?: number;
  iconImageHeight?: number;
}

export async function getSiteSettings(businessId?: string) {
  try {
    let settings;
    if (businessId) {
      settings = await prisma.siteSettings.findFirst({ where: { businessId } });
      if (!settings) {
        settings = await prisma.siteSettings.create({
          data: {
            business: { connect: { id: businessId } },
            aboutText: "Write about your business here",
            addToHome: "Add our app to your home screen for a better experience!",
            heroTitle: "Welcome to our store",
            heroSubtitle: "Browse our products and enjoy great deals",
            contactDesc: "Contact us today for product inquiries, order support, or business collaborations.",
            contactEmail: "support@example.com",
            contactPhone: "000-000-0000",
          },
        });
      }
    } else {
      settings = await prisma.siteSettings.findFirst();
      if (!settings && businessId) {
        settings = await prisma.siteSettings.create({
          data: {
            businessId,
            aboutText: "Write about your business here",
            addToHome: "Add our app to your home screen for a better experience!",
            heroTitle: "Welcome to our store",
            heroSubtitle: "Browse our products and enjoy great deals",
            contactDesc: "Contact us today for product inquiries, order support, or business collaborations.",
            contactEmail: "support@example.com",
            contactPhone: "000-000-0000",
          },
        });
      }
    }
    return settings;
  } catch (error) {
    console.error("Failed to get site settings:", error);
    return null;
  }
}

export async function updateSiteSettings(
  data: SiteSettingsInput,
  businessId?: string
) {
  try {
    const whereClause = businessId ? { businessId } : {};
    const settings = businessId
      ? await prisma.siteSettings.findFirst({ where: { businessId } })
      : await prisma.siteSettings.findFirst();
    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      const createData: any = { ...data };
      if (businessId) {
        createData.business = { connect: { id: businessId } };
      }
      // fill missing defaults
      createData.aboutText = createData.aboutText || "Write about your business here";
      createData.addToHome = createData.addToHome || "Add our app to your home screen for a better experience!";
      createData.heroTitle = createData.heroTitle || "Welcome to our store";
      createData.heroSubtitle = createData.heroSubtitle || "Browse our products and enjoy great deals";
      createData.contactDesc = createData.contactDesc || "Contact us today for product inquiries, order support, or business collaborations.";
      createData.contactEmail = createData.contactEmail || "support@example.com";
      createData.contactPhone = createData.contactPhone || "000-000-0000";
      createData.helpText = createData.helpText || "How can we assist you?";
      createData.iconMode = createData.iconMode || "text";
      createData.iconText = createData.iconText || undefined;
      createData.iconFontSize = createData.iconFontSize ?? 20;
      createData.iconFontColor = createData.iconFontColor || "#000000";
      createData.iconImageUrl = createData.iconImageUrl || undefined;
      createData.iconImageWidth = createData.iconImageWidth ?? 40;
      createData.iconImageHeight = createData.iconImageHeight ?? 40;

      await prisma.siteSettings.create({ data: createData });
    }
    // revalidate home and about/contact pages globally
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return { success: true };
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
