import React from 'react';
import { Category } from '../types';
import { Soup, IceCream, Milk, UtensilsCrossed, LayoutGrid, ChefHat } from 'lucide-react';
import { motion } from 'motion/react';

interface CategoryFilterProps {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}

const CATEGORIES_DATA: { name: Category; icon: any }[] = [
  { name: 'Semua', icon: LayoutGrid },
  { name: 'Bakso & Mie', icon: Soup },
  { name: 'Aneka Nasi', icon: ChefHat },
  { name: 'Gorengan', icon: UtensilsCrossed },
  { name: 'Ice Cream', icon: IceCream },
  { name: 'Minuman', icon: Milk },
];

export default function CategoryFilter({ activeCategory, setActiveCategory }: CategoryFilterProps) {
  return (
    <div className="flex gap-6 overflow-x-auto px-4 py-4 no-scrollbar scroll-smooth">
      {CATEGORIES_DATA.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className="flex flex-col items-center gap-2 group outline-none"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-200'
                  : 'bg-white text-slate-400 border border-slate-100 hover:border-orange-200'
              }`}
            >
              <Icon size={24} />
            </motion.div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-[#FF6B00]' : 'text-slate-400'
              }`}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
