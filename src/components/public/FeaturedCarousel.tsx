'use client';

import React from 'react';
import Link from 'next/link';
import { MenuItem } from '@/lib/types';
import { formatInr } from '@/lib/currency';
import { Star, ArrowRight } from 'lucide-react';

interface FeaturedCarouselProps {
  items: MenuItem[];
}

export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const featured = items.filter((item) => item.isFeatured && item.isAvailable);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-600" />
              <span>Featured Items</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Featured Items
            </h2>
            <p className="mt-2 text-stone-600 max-w-xl text-sm sm:text-base">
              Discover dishes currently highlighted on our menu.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors group"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Responsive Grid of Featured Dishes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((dish) => (
            <div
              key={dish.id}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              {/* Image Container with Restrained Zoom */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                {/* Diet Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-semibold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  />
                  <span className="text-stone-700">
                    {dish.isVeg ? 'Vegetarian' : 'Non-Veg'}
                  </span>
                </div>
              </div>

              {/* Dish Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {dish.name}
                    </h3>
                    <span className="font-semibold text-base text-amber-700 whitespace-nowrap">
                      {formatInr(dish.pricePaise)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="text-emerald-700 font-medium">Available</span>
                  <Link
                    href="/menu"
                    className="font-medium text-amber-600 hover:text-amber-700"
                  >
                    View in Menu &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
