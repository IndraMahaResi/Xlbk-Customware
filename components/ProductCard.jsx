import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  // Data fallback untuk preview jika props kosong
  const fallbackProduct = {
    id: "1",
    name: "Premium Cotton Combed 30s",
    price: 55000,
    category: "KAOS",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500&auto=format&fit=crop",
    minOrder: "Bisa Satuan",
    rating: 4.8,
    sold: "1.2k+",
  };

  const item = product && product.name ? product : fallbackProduct;

  const formatPrice = (price) => {
    if (!price) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <div className="group relative rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm overflow-hidden hover:bg-slate-800/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1 flex flex-col h-full">
      {/* Label Kategori & Min Order (Floating) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <span className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
          {item.category}
        </span>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-lg">
          {item.minOrder}
        </span>
      </div>

      {/* Area Gambar Produk */}
      <div className="relative w-full aspect-square overflow-hidden bg-slate-900">
        <img
          src={item.image || fallbackProduct.image}
          alt={item.name || "Product"}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        {/* Overlay gradient agar gambar menyatu dengan bagian bawah card */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Area Informasi Produk */}
      <div className="p-6 flex flex-col flex-grow relative z-10">
        {/* Rating & Terjual */}
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-400">
          <div className="flex items-center text-amber-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-1">{item.rating}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>Terjual {item.sold}</span>
        </div>

        <h3 className="text-lg font-semibold text-slate-100 mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {item.name}
        </h3>

        <p className="text-xl font-bold text-white mt-auto pt-4 mb-4">
          {formatPrice(item.price)}
          <span className="text-sm text-slate-500 font-normal"> /pcs</span>
        </p>

        {/* Tombol CTA - LANGSUNG KE ORDER DENGAN PRODUCT ID */}
        <Link
          href={`/order?product=${item.id}`}
          className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-blue-600 text-slate-200 hover:text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 border border-slate-600 hover:border-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
            />
          </svg>
          Custom Sekarang
        </Link>
      </div>
    </div>
  );
}