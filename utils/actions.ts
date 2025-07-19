"use server"

import { auth, currentUser } from '@clerk/nextjs/server';
import db from '@/utils/db'
import { redirect } from 'next/navigation';
import { imageSchema, validateWithZodSchema, productSchema } from './schemas';
import { uploadImage} from './supabase'



// helper functions 
const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error('You must be logged in to access this route');
  }
  return user;
};

const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
  return user;
};

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : 'An error occurred',
  };
};

export const fetchFeaturedProducts = async () => {
    const products = await db.product.findMany({
        where: {
            featured: true,
        },
    });
    return products
};

export const fetchAllProducts = ({search=''}:{search:string}) => {
    return db.product.findMany({
        where: {
            OR: [
            {name: {contains: search, mode: 'insensitive'}},
            {company: {contains: search, mode:'insensitive'}}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        },
    });
};

// fetchign single product 
export const fetchSingleProduct = async (productId:string) => {
    const product = await db.product.findUnique({
        where: {
            id: productId,
        },
    });

    // product is not there redirect to products page 
    if(!product) {
        redirect('/products')
    }

    // if products are there lets return  
    return product 

}


// this must mathc the our type in utils/types.ts, its named - actionFunction
export const createProductAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get('image') as File;
    const validatedFields = validateWithZodSchema(productSchema, rawData);
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);

    await db.product.create({
      data: {
        ...validatedFields,
        image: fullPath,
        clerkId: user.id,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect('/admin/products');
};


export const fetchAdminProducts = async () => {
  await getAdminUser();
  const products = await db.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return products;
};


// delete product action 
import { revalidatePath } from 'next/cache';

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  await getAdminUser();

  try {
    await db.product.delete({
      where: {
        id: productId,
      },
    });

    revalidatePath('/admin/products');
    return { message: 'product removed' };
  } catch (error) {
    return renderError(error);
  }
};