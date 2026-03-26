'use client'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

export default function TestimonialCard({ testimonial, featured = false }) {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i}>
        {i < rating ? (
          <StarIcon className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarOutlineIcon className="h-4 w-4 text-gray-600" />
        )}
      </span>
    ))
  }

  return (
    <div className={`
      bg-slate-800/40 border rounded-2xl p-6 backdrop-blur-sm transition-all duration-300
      ${featured 
        ? 'border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.1)] hover:shadow-[0_0_40px_rgba(37,99,235,0.2)]' 
        : 'border-slate-700/50 hover:border-slate-600'
      }
      hover:-translate-y-1 hover:bg-slate-800/60
    `}>
      {/* Rating Stars */}
      <div className="flex items-center gap-1 mb-4">
        {renderStars(testimonial.rating)}
      </div>
      
      {/* Message */}
      <p className="text-slate-300 text-base leading-relaxed mb-5 italic">
        "{testimonial.message}"
      </p>
      
      {/* Customer Info */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-700/50">
        {testimonial.image ? (
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {testimonial.name?.charAt(0) || 'C'}
            </span>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-slate-100">{testimonial.name}</h4>
          {testimonial.role && (
            <p className="text-xs text-slate-500">{testimonial.role}</p>
          )}
          {testimonial.productName && (
            <p className="text-xs text-blue-400 mt-0.5">
              Produk: {testimonial.productName}
            </p>
          )}
        </div>
      </div>
      
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            ⭐ Unggulan
          </div>
        </div>
      )}
    </div>
  )
}