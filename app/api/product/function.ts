import { prisma } from "@/lib/prisma";



const modelMap = { 
  //ministries: prisma.ministry,
  cart: prisma.cart,
  cartItem: prisma.cartItem,
  category: prisma.category,
  coupon: prisma.coupon,
  featuredProduct: prisma.featuredProduct,
  notification: prisma.notification,
  payment: prisma.payment,
  post: prisma.post,
  product: prisma.product,
  refund: prisma.refund,
  review: prisma.review,
  shippingAddress: prisma.shippingAddress,
  stock: prisma.stock,
  user: prisma.user,
};

async function dbHandler({
  model = null,
  id = null,
  body = null,
  method,
  profileImage = false,
}: {
  model: any;
  id?: string | null;
  body?: any;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  profileImage?: boolean;
}) {
  console.log("In product dbhandler function");

  const prismaModel = modelMap[model];

  if (!prismaModel) {
    return { status: 400, data: { message: 'Invalid model' } };
  }

  try {
    switch (method) {
      case 'GET':
        if (id) {
          const item = await prismaModel.findUnique({ where: { id } });
          if (!item) {
            return { status: 404, data: { error: 'Document not found' } };
          }
          return { status: 200, data: item };
        } else {
          const items = await prismaModel.findMany();
          return { status: 200, data: items };
        }
      case 'POST':
        // const data = body;  Spicy, pepperish and groundnut yaji spice blend
        console.log('post product body:', body)
         const productData: any = {
            description: body.description,
            name: body.name,
            categoryId: body.categoryId,
            price: Number(body.price),
            images: Array.isArray(body.urls) ? body.urls : (body.url ? [body.url] : []),
            shortDescription: body.shortDescription || undefined,
            barcode: body.barcode || undefined,
            volume: body.volume || undefined,
            tags: Array.isArray(body.tags) ? body.tags : [],
            metadata: body.metadata || undefined,
            businessId: body.businessId ? String(body.businessId) : undefined,
            costPrice: body.costPrice !== undefined && body.costPrice !== null && body.costPrice !== "" ? Number(body.costPrice) : undefined,
            weight: body.weight ? String(body.weight) : undefined,
            brand: body.brand && String(body.brand).trim() ? String(body.brand).trim() : undefined,
            scarce: body.scarce === true || body.scarce === "true",
            regulatoryClassification: body.regulatoryClassification || "OTC",
            requiresPrescription: body.requiresPrescription === true || body.requiresPrescription === "true",
            activeIngredients: Array.isArray(body.activeIngredients)
              ? body.activeIngredients.map((name: any) => String(name).trim()).filter(Boolean)
              : typeof body.activeIngredients === "string"
                ? body.activeIngredients.split(",").map((name: string) => name.trim()).filter(Boolean)
                : [],
          };

          if (Array.isArray(body.variants)) {
            productData.variants = {
              create: body.variants.filter((variant: any) => variant?.title).map((variant: any) => ({
                title: String(variant.title),
                weight: variant.weight || undefined,
                volume: variant.volume || undefined,
                metadata: variant.metadata || undefined,
                allowBackorder: Boolean(variant.allowBackorder),
                manageInventory: variant.manageInventory !== false,
                stockStatusByRegion: variant.stockStatusByRegion || undefined,
                prices: { create: (variant.prices || []).filter((price: any) => price?.amount !== undefined).map((price: any) => ({ amount: Number(price.amount) || 0, originalAmount: price.originalAmount == null ? undefined : Number(price.originalAmount), calculatedAmount: price.calculatedAmount == null ? undefined : Number(price.calculatedAmount), currencyCode: price.currencyCode || "ngn", isDiscounted: Boolean(price.isDiscounted), minQuantity: price.minQuantity == null ? undefined : Number(price.minQuantity), maxQuantity: price.maxQuantity == null ? undefined : Number(price.maxQuantity), metadata: price.metadata || undefined })) },
                inventoryItems: { create: (variant.inventoryItems || []).map((item: any) => ({ sku: item.sku || undefined, requiredQuantity: item.requiredQuantity == null ? undefined : Number(item.requiredQuantity), availableQuantity: item.availableQuantity == null ? undefined : Number(item.availableQuantity), deliverableQuantity: item.deliverableQuantity == null ? undefined : Number(item.deliverableQuantity), reservedQuantity: item.reservedQuantity == null ? undefined : Number(item.reservedQuantity), stockedQuantity: item.stockedQuantity == null ? undefined : Number(item.stockedQuantity), minStockLevel: item.minStockLevel == null ? undefined : Number(item.minStockLevel), metadata: item.metadata || undefined })) },
              }))
            };
          }
          if (Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
            productData.productCategories = { create: body.categoryIds.filter(Boolean).map((categoryId: string) => ({ category: { connect: { id: String(categoryId) } } })) };
          }

          if (Array.isArray(body.healthConcerns) && body.healthConcerns.length > 0) {
            productData.healthConcerns = {
              connectOrCreate: body.healthConcerns.map((name: string) => ({
                where: { name: String(name).trim() },
                create: { name: String(name).trim() },
              })).filter((item: any) => item.where.name)
            };
          }

          const newItem = await prismaModel.create({ data: productData });
        if (profileImage && model === 'posts') {
          try {
            console.log("about to change user profile image")
            await prisma.user.update({
              where: { id: body.userId },
              data: { image: body.url },
            });
          } catch (error) {
            console.error('Database error:', error);
            return { status: 500, data: { error: 'Failed to update user profile image' } };
          }
        }
        return { status: 200, data: newItem };
      case 'PUT':
        const { _id, ...updatedata } = body;
        const updatedItem = await prismaModel.update({
          where: { id : _id },
          data: updatedata,
        });
        return { status: 200, data: updatedItem };
      case 'DELETE':
        await prismaModel.delete({ where: { id } });
        return { status: 200, data: { success: true } };
      default:
        return { status: 405, data: { error: 'Method not allowed' } };
    }
  } catch (error) {
    console.error('Database error:', error);
    return { status: 500, data: { error: 'Failed to perform operation' } };
  }
}

export default dbHandler;

// const result = await dbHandler({
//   model: 'posts',
//   method: 'POST',
//   body: {
//     // your post data
//   },
//   profileImage: true,
// });














// 
// const prisma = new PrismaClient();

// const modelMap = {
//   ministries: prisma.ministry,
//   departments: prisma.department,
//   books: prisma.book,
//   users: prisma.user,
//   comments: prisma.comment,
//   likes: prisma.like,
//   billboards: prisma.billboard,
//   posts: prisma.post,
// };

// async function dbHandler({
//   model = null,
//   id = null,
//   body = null,
//   method,
// }: {
//   model: any;
//   id?: string;
//   body?: any;
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
// }) {

//     console.log("In dbhandler function")
//   const prismaModel = modelMap[model];

//   if (!prismaModel) {
//     return { status: 400, data: { message: 'Invalid model' } };
//   }

//   try {
//     switch (method) {
//       case 'GET':
//         if (id) {
//           const item = await prismaModel.findUnique({ where: { id } });
//           if (!item) {
//             return { status: 404, data: { error: 'Document not found' } };
//           }
//           return { status: 200, data: item };
//         } else {
//           const items = await prismaModel.findMany();
//           return { status: 200, data: items };
//         }
//       case 'POST':
//         const data = body;
//         const newItem = await prismaModel.create({ data, });
//         return { status: 200, data: newItem };
//       case 'PUT':
//         const { id: _, ...updatedata } = body;
//         const updatedItem = await prismaModel.update({
//           where: { id },
//           data: updatedata,
//         });
//         return { status: 200, data: updatedItem };
//       case 'DELETE':
//         await prismaModel.delete({ where: { id } });
//         return { status: 200, data: { success: true } };
//       default:
//         return { status: 405, data: { error: 'Method not allowed' } };
//     }
//   } catch (error) {
//     console.error('Database error:', error);
//     return { status: 500, data: { error: 'Failed to perform operation' } };
//   }
// }



// export default dbHandler



// // const result = await dbHandler({
// //   model: 'users',
// //   method: 'GET',
// // });

// // console.log(result);
