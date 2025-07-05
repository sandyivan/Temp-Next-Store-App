import db from '@/utils/db'
import { redirect } from 'next/navigation';


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

