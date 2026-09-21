import Slide from "../app/_components/Slider/Slider";
import imag1 from "../assets/images/showroom.webp";
import imag2 from "../assets/images/DALL·E-2024-11-26-12-52-36-A-blog-header-image-in-landscape-.jpeg";
import imag3 from "../assets/images/gulfpicasso-6901ba5d-834e-4113-b4d2-7f7279b7c95a.png";

import CardOne from "./_components/Home/CardOne";
import PromoBanners from './_components/PromoBanners/PromoBanners';
import StayConnected from './_components/StayConnected/StayConnected';
import ShopCategories from "./_components/ShopCategories/ShopCategories";
export default async function Home() {
  // إضافة async في حال كنت تجلب البيانات داخل الصفحة
  // إذا كنت تعتمد على جلب البيانات من الـ API وتمريرها للمكون:
  // const categories = await getShopCategories();

  return (
    <>
      <Slide
        spaceBetween={2}
        slidesPerView={1}
        pageList={[imag1.src, imag2.src, imag3.src]}
      />
  
      <PromoBanners />
      <ShopCategories />
      <CardOne />
      <StayConnected/>
    </>
  );
}
