-- ==============================================================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN DE BASE DE DATOS SUPABASE PARA FACTURX
-- ==============================================================================

-- 1. TABLA DE USUARIOS (users)
-- Guarda la información del equipo de trabajo y perfiles
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'EMPLEADO',
    username TEXT UNIQUE NOT NULL,
    pin TEXT NOT NULL,
    "photoUrl" TEXT,
    "mustChangePassword" BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE PRODUCTOS (products)
-- Guarda el inventario y catálogo público
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL NOT NULL,
    category TEXT NOT NULL,
    variant TEXT,
    "photoUrl" TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE PEDIDOS (orders)
-- Guarda las órdenes recibidas desde el catálogo en línea
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'pending',
    total DECIMAL NOT NULL,
    items JSONB NOT NULL,
    customer_name TEXT,
    customer_phone TEXT
);

-- 4. TABLA DE FACTURAS (invoices)
-- Guarda las prefacturas o facturas generadas y sus pagos
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    client TEXT NOT NULL,
    document TEXT,
    date TEXT NOT NULL,
    "dueDate" TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL NOT NULL,
    discount DECIMAL DEFAULT 0,
    tax DECIMAL DEFAULT 0,
    total DECIMAL NOT NULL,
    "amountPaid" DECIMAL DEFAULT 0,
    status TEXT DEFAULT 'pendiente',
    notes TEXT,
    "companyInfo" JSONB,
    payments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS)
-- Desactivamos RLS temporalmente en todas las tablas para permitir el funcionamiento
-- fluido de la aplicación mientras no se requiera alta seguridad de reglas (políticas).
-- ==============================================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- INSERCIÓN DE DATOS POR DEFECTO (OPCIONAL)
-- Insertamos el Administrador principal solo si la tabla users está vacía
-- ==============================================================================
INSERT INTO users (id, name, role, username, pin, "photoUrl", "mustChangePassword")
SELECT 'u1', 'Carlos Miranda', 'DIRECTOR DE OPERACIONES', 'admin', '1234', 'https://ui-avatars.com/api/?name=Carlos+Miranda&background=10b981&color=fff', false
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- ==============================================================================
-- REFRESCAR EL CACHÉ DE LA API DE SUPABASE
-- Esto garantiza que las tablas estén disponibles inmediatamente
-- ==============================================================================
NOTIFY pgrst, 'reload schema';
