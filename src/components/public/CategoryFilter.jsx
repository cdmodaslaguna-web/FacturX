import { motion } from 'framer-motion';

const CATEGORIES = [
  'Todos',
  'Conquistadores',
  'Aventureros',
  'Guias Mayores',
  'Ropa Casual',
  'Insignias',
  'Iglesia'
];


export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px 40px',
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none' // IE/Edge
    }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {CATEGORIES.map(category => {
        const isSelected = selectedCategory === category;
        return (
          <motion.button
            key={category}
            onClick={() => onSelectCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              border: isSelected ? 'none' : '1px solid #cbd5e1',
              background: isSelected ? '#184a2c' : '#fff',
              color: isSelected ? '#fff' : '#64748b',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isSelected ? '0 4px 12px rgba(24, 74, 44, 0.3)' : 'none',
              transition: 'background 0.2s, color 0.2s, border 0.2s'
            }}
          >
            {category}
          </motion.button>
        );
      })}
    </div>
  );
}
