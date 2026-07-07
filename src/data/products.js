// Catálogo base de productos por categoría
// category: 'CNQ' = Conquistadores | 'GM' = Guías Mayores | 'AV' = Aventureros | 'PN' = Persona Natural
// price: null = sin precio definido (se ingresa manualmente)

export const CATEGORIES = [
  { id: 'CNQ', label: 'Conquistadores' },
  { id: 'GM',  label: 'Guías Mayores' },
  { id: 'AV',  label: 'Aventureros' },
  { id: 'PN',  label: 'Persona Natural' },
  { id: 'INS', label: 'Insignias' },
  { id: 'RC',  label: 'Ropa Casual' },
  { id: 'IGL', label: 'Iglesia' },
]

export const BASE_PRODUCTS = [
  // ── CONQUISTADORES (CNQ) ──────────────────────────────────────
  { id: 'cnq-01', category: 'CNQ', name: 'Pantalones CNQ', variant: '(28 - 34)',        price: 75000 },
  { id: 'cnq-02', category: 'CNQ', name: 'Pantalones CNQ', variant: '(36 - 40)',        price: 80000 },
  { id: 'cnq-03', category: 'CNQ', name: 'Falda Tipo 1 CNQ', variant: 'S, M',           price: 60000 },
  { id: 'cnq-04', category: 'CNQ', name: 'Falda Tipo 2 CNQ', variant: 'L, XL',          price: 65000 },
  { id: 'cnq-05', category: 'CNQ', name: 'Camisas',          variant: 'XS, S (MC)',     price: 55000 },
  { id: 'cnq-06', category: 'CNQ', name: 'Camisas',          variant: 'XS, S (ML)',     price: 60000 },
  { id: 'cnq-07', category: 'CNQ', name: 'Camisas',          variant: 'M, L (MC)',      price: 65000 },
  { id: 'cnq-08', category: 'CNQ', name: 'Camisas',          variant: 'M, L (ML)',      price: 70000 },
  { id: 'cnq-09', category: 'CNQ', name: 'Camisas',          variant: 'XL',             price: 75000 },
  { id: 'cnq-10', category: 'CNQ', name: 'Banda',            variant: 'CNQ',            price: 30000 },
  { id: 'cnq-11', category: 'CNQ', name: 'Insignias',        variant: '',               price: 10000 },
  // Uniformes T1 Con Insignias
  { id: 'cnq-12', category: 'CNQ', name: 'Uniforme T1 Con Insignias MC',         variant: '(28-34, S, M)', price: 170000 },
  { id: 'cnq-13', category: 'CNQ', name: 'Uniforme T1 Con Insignias ML',         variant: '(28-34, S, M)', price: 175000 },
  { id: 'cnq-14', category: 'CNQ', name: 'Uniforme T1 Con Insignias DAMA MC',    variant: '(28-34, S, M)', price: 155000 },
  { id: 'cnq-15', category: 'CNQ', name: 'Uniforme T1 Con Insignias DAMA ML',    variant: '(28-34, S, M)', price: 160000 },
  // Uniformes T2 Con Insignias
  { id: 'cnq-16', category: 'CNQ', name: 'Uniforme T2 Con Insignias MC',         variant: '(36-40, L, XL)', price: 185000 },
  { id: 'cnq-17', category: 'CNQ', name: 'Uniforme T2 Con Insignias ML',         variant: '(36-40, L, XL)', price: 190000 },
  { id: 'cnq-18', category: 'CNQ', name: 'Uniforme T2 Con Insignias DAMA MC',    variant: '(36-40, L, XL)', price: 170000 },
  { id: 'cnq-19', category: 'CNQ', name: 'Uniforme T2 Con Insignias DAMA ML',    variant: '(36-40, L, XL)', price: 175000 },
  // Uniformes T1 Sin Insignias
  { id: 'cnq-20', category: 'CNQ', name: 'Uniforme T1 Sin Insignias MC',         variant: '(28-34, S, M)', price: 165000 },
  { id: 'cnq-21', category: 'CNQ', name: 'Uniforme T1 Sin Insignias ML',         variant: '(28-34, S, M)', price: 180000 },
  { id: 'cnq-22', category: 'CNQ', name: 'Uniforme T1 Sin Insignias DAMA MC',    variant: '(28-34, S, M)', price: null },
  { id: 'cnq-23', category: 'CNQ', name: 'Uniforme T1 Sin Insignias DAMA ML',    variant: '(28-34, S, M)', price: null },
  // Uniformes T2 Sin Insignias
  { id: 'cnq-24', category: 'CNQ', name: 'Uniforme T2 Sin Insignias MC',         variant: '(36-40, L, XL)', price: null },
  { id: 'cnq-25', category: 'CNQ', name: 'Uniforme T2 Sin Insignias ML',         variant: '(36-40, L, XL)', price: null },
  { id: 'cnq-26', category: 'CNQ', name: 'Uniforme T2 Sin Insignias DAMA MC',    variant: '(36-40, L, XL)', price: null },
  { id: 'cnq-27', category: 'CNQ', name: 'Uniforme T2 Sin Insignias DAMA ML',    variant: '(36-40, L, XL)', price: null },

  // ── GUÍAS MAYORES (GM) ────────────────────────────────────────
  { id: 'gm-01', category: 'GM', name: 'Pantalones',    variant: '(28 - 34)',          price: 90000  },
  { id: 'gm-02', category: 'GM', name: 'Pantalones',    variant: '(36 - 40)',          price: 100000 },
  { id: 'gm-03', category: 'GM', name: 'Falda Tipo 1',  variant: 'S, M',               price: 60000  },
  { id: 'gm-04', category: 'GM', name: 'Falda Tipo 2',  variant: 'L, XL',              price: 70000  },
  { id: 'gm-05', category: 'GM', name: 'Camisas',       variant: 'XS, S (MC)',         price: 55000  },
  { id: 'gm-06', category: 'GM', name: 'Camisas',       variant: 'XS, S (ML)',         price: 60000  },
  { id: 'gm-07', category: 'GM', name: 'Camisas',       variant: 'M, L (MC)',          price: 65000  },
  { id: 'gm-08', category: 'GM', name: 'Camisas',       variant: 'M, L (ML)',          price: 70000  },
  { id: 'gm-09', category: 'GM', name: 'Camisas',       variant: 'XL',                 price: 75000  },
  { id: 'gm-10', category: 'GM', name: 'Banda GM',      variant: '(90 cm)',            price: 45000  },
  { id: 'gm-11', category: 'GM', name: 'Banda GM',      variant: '(más de 90 cm)',     price: 50000  },
  { id: 'gm-12', category: 'GM', name: 'Banda',         variant: 'CNQ',                price: 30000  },
  { id: 'gm-13', category: 'GM', name: 'Uniforme T1 Con Insignias',  variant: '(28-34, S, M)',  price: 205000 },
  { id: 'gm-14', category: 'GM', name: 'Uniforme T2 Con Insignias',  variant: '(36-40, L, XL)', price: 220000 },
  { id: 'gm-15', category: 'GM', name: 'Uniforme T1 Sin Insignias',  variant: '(28-34, S, M)',  price: 195000 },
  { id: 'gm-16', category: 'GM', name: 'Uniforme T2 Sin Insignias',  variant: '(36-40, L, XL)', price: 210000 },

  // ── AVENTUREROS (AV) ──────────────────────────────────────────
  { id: 'av-01', category: 'AV', name: 'Pantalón', variant: '(2-8)',       price: 65000 },
  { id: 'av-02', category: 'AV', name: 'Pantalón', variant: '(10 o más)', price: 70000 },
  { id: 'av-03', category: 'AV', name: 'Falda',    variant: '(2-8)',       price: 65000 },
  { id: 'av-04', category: 'AV', name: 'Falda',    variant: '(10 o más)', price: 70000 },
  { id: 'av-05', category: 'AV', name: 'Banda AV', variant: '',            price: 30000 },
]
