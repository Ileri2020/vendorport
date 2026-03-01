"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          aboutText: "Welcome to our store. We provide high-quality products to our customers.",
          addToHome: "Add our app to your home screen for a better experience!",
        },
      });
    }
    return settings;
  } catch (error) {
    console.error("Failed to get site settings:", error);
    return null;
  }
}

export async function updateSiteSettings(data: { aboutText?: string; addToHome?: string }) {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          aboutText: data.aboutText || "Welcome to our store. We provide high-quality products to our customers.",
          addToHome: data.addToHome || "Add our app to your home screen for a better experience!",
        },
      });
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
