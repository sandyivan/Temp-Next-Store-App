"use server"

import { auth, currentUser } from '@clerk/nextjs/server';
import db from '@/utils/db'
import { redirect } from 'next/navigation';


// helper functions 
const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : 'An error occurred',
  };
};

const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error('You must be logged in to access this route');
  }
  return user;
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
    const name = formData.get('name') as string;
    const company = formData.get('company') as string;
    const price = Number(formData.get('price') as string);
    const image = formData.get('image') as File;
    const description = formData.get('description') as string;
    const featured = Boolean(formData.get('featured') as string);

    await db.product.create({
      data: {
        name,
        company,
        price,
        image: '/images/product-1.jpg',
        description,
        featured,
        clerkId: user.id,
      },
    });
    return { message: 'product created' };
  } catch (error) {
    return renderError(error);
  }
};