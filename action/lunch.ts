"use server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getUserLunches() {
  const session = await auth();
  if (!session?.user?.id) {
    return { templates: [], schedules: [] };
  }

  const userId = session.user.id;

  try {
    const lunches = await prisma.cart.findMany({
      where: {
        userId,
        type: "lunch",
      },
      include: {
        products: {
            include: {
                product: true
            }
        },
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Also fetch active subscriptions/schedules
    const schedules = await prisma.lunch.findMany({
        where: { userId },
        include: {
            carts: {
                include: {
                    products: { include: { product: true } }
                }
            }
        }
    });

    return { templates: lunches, schedules };
  } catch (error) {
    console.error("Error fetching lunches:", error);
    return { templates: [], schedules: [] };
  }
}

export async function createLunch(name: string, initialProductId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const userId = session.user.id;

    try {
        const data: any = {
            userId,
            name,
            type: "lunch",
            total: 0,
            status: "active"
        };

        if (initialProductId) {
            data.products = {
                create: [
                    {
                        productId: initialProductId,
                        quantity: 1
                    }
                ]
            };
        }

        const newLunch = await prisma.cart.create({
            data
        });
        
        revalidatePath("/lunch");
        return { success: true, lunch: newLunch };
    } catch (error) {
        console.error("Error creating lunch:", error);
        return { success: false, error: "Failed to create lunch" };
    }
}

export async function addToLunch(lunchId: string, productId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        // Check if item exists in this lunch
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: lunchId,
                productId: productId
            }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + 1 }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: lunchId,
                    productId: productId,
                    quantity: 1
                }
            });
        }
        
        revalidatePath("/lunch");
        return { success: true };
    } catch (error) {
        console.error("Error adding to lunch:", error);
        return { success: false, error: "Failed to add to lunch" };
    }
}

export async function updateLunchItemQuantity(itemId: string, quantity: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    try {
        if (quantity <= 0) {
            await prisma.cartItem.delete({
                where: { id: itemId }
            });
        } else {
            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity }
            });
        }
        revalidatePath("/lunch");
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export async function renameLunch(lunchId: string, name: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.cart.update({
            where: { id: lunchId },
            data: { name }
        });
        revalidatePath("/lunch");
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export async function addLunchToCart(lunchId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    try {
        const lunch = await prisma.cart.findUnique({
            where: { id: lunchId },
            include: { products: true }
        });
        
        if (!lunch) throw new Error("Lunch not found");

        // Find or create main cart
        let mainCart = await prisma.cart.findFirst({
            where: { userId, type: "cart", status: "pending" }
        });

        if (!mainCart) {
            mainCart = await prisma.cart.create({
                data: {
                    userId,
                    type: "cart",
                    status: "pending",
                    total: 0
                }
            });
        }

        // Add items
        for (const item of lunch.products) {
            const existing = await prisma.cartItem.findFirst({
                where: { cartId: mainCart.id, productId: item.productId }
            });
            
            if (existing) {
                await prisma.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + item.quantity }
                });
            } else {
                await prisma.cartItem.create({
                    data: {
                        cartId: mainCart.id,
                        productId: item.productId,
                        quantity: item.quantity
                    }
                });
            }
        }
        
        revalidatePath("/cart"); // assumption
        return { success: true };
    } catch (error) {
        console.error("Error moving lunch to cart", error);
        return { success: false, error: "Failed to move to cart" };
    }
}

export async function scheduleLunch(data: {
    templateId: string;
    name: string;
    frequency: string;
    daysOfWeek: string[];
    timesInDay: string[];
    startDate: Date;
    endDate: Date;
    deliveryFeeTotal: number;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    try {
        const template = await prisma.cart.findUnique({
            where: { id: data.templateId },
            include: { products: { include: { product: true } } }
        });

        if (!template) throw new Error("Template not found");

        const scheduledDates = getScheduledDates(
            data.frequency,
            new Date(data.startDate),
            new Date(data.endDate),
            data.daysOfWeek,
            data.timesInDay
        );

        if (scheduledDates.length === 0) {
            return { success: false, error: "No delivery dates found for this schedule" };
        }

        const lunchRecord = await prisma.lunch.create({
            data: {
                userId,
                name: data.name,
                frequency: data.frequency,
                daysOfWeek: data.daysOfWeek,
                timesInDay: data.timesInDay,
                startDate: data.startDate,
                endDate: data.endDate,
                status: "active"
            }
        });

        const deliveryFeePerCart = data.deliveryFeeTotal / scheduledDates.length;
        const subtotalPerCart = template.products.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const totalPerCart = subtotalPerCart + deliveryFeePerCart;

        // Create carts for each date
        for (const date of scheduledDates) {
            await prisma.cart.create({
                data: {
                    userId,
                    lunchId: lunchRecord.id,
                    type: "cart",
                    status: "unconfirmed", // Requires payment
                    total: totalPerCart,
                    deliveryFee: deliveryFeePerCart,
                    deliveryDate: date,
                    name: `${data.name} - ${date.toLocaleDateString()}`,
                    products: {
                        create: template.products.map(p => ({
                            productId: p.productId,
                            quantity: p.quantity
                        }))
                    }
                }
            });
        }

        revalidatePath("/lunch");
        return { success: true, lunchId: lunchRecord.id };
    } catch (error) {
        console.error("Error scheduling lunch:", error);
        return { success: false, error: "Failed to schedule lunch" };
    }
}

function getScheduledDates(frequency: string, startDate: Date, endDate: Date, daysOfWeeks: string[], timesInDay: string[]) {
    const dates: Date[] = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    // Safety break
    let count = 0;

    while (current <= end && count < 1000) {
        count++;
        let match = false;
        if (frequency === 'daily') {
            match = true;
        } else if (frequency === 'weekly') {
            const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            // normalized check
            if (daysOfWeeks.some(d => d.toLowerCase() === dayName)) {
                match = true;
            }
        } else if (frequency === 'monthly') {
            if (current.getDate() === startDate.getDate()) {
                match = true;
            }
        } else if (frequency === 'once') {
            match = current.toDateString() === startDate.toDateString();
        }

        if (match) {
            for (const time of timesInDay) {
                const [hours, minutes] = time.split(':').map(Number);
                const d = new Date(current);
                d.setHours(hours || 12, minutes || 0, 0, 0);
                if (d >= startDate && d <= end) {
                    dates.push(d);
                }
            }
        }
        
        if (frequency === 'once') break;

        current.setDate(current.getDate() + 1);
    }
    return dates;
}
