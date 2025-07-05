import { fetchFeaturedProducts } from "@/utils/actions"
import EmptyList from "../global/EmptyList"
import SectionTitle from '../global/SectionTitle';
import ProductsGrid from "../products/ProductsGrid";


async function FeaturedProducts() {
  const products = await fetchFeaturedProducts()
  
  // if no products return emptylist component 
  if(products.length === 0 ) <EmptyList/>
  // console.log('checking', products)


  return (
    <section className="pt-24">
      <SectionTitle text="featured products" />
      <ProductsGrid products={products} /> 
    </section>
  )
}
export default FeaturedProducts