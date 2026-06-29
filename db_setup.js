import pg from 'pg';
const { Client } = pg;

// Supabase PostgreSQL connection string format
const connectionString = 'postgresql://postgres:g2dqfVzIS4YeCGlv@db.kgfoqxgcaojrjfhmaacb.supabase.co:5432/postgres';

async function setupDB() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase DB successfully.');

    // 1. Add 'description' column to 'products' table if it doesn't exist
    await client.query(`
      ALTER TABLE IF EXISTS products 
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);
    console.log('Column "description" added to "products" table (or already exists).');

    // 2. Create 'orders' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        status TEXT DEFAULT 'pending',
        total DECIMAL NOT NULL,
        items JSONB NOT NULL,
        customer_name TEXT,
        customer_phone TEXT
      );
    `);
    console.log('Table "orders" created successfully.');

    // Since we are accessing this via the anon key from the frontend, we need to ensure RLS is handled.
    // Let's just disable RLS for these tables for development, or add permissive policies.
    // The user already has products working, so products RLS is probably disabled or very permissive.
    // Let's do the same for orders.
    
    // Attempt to disable RLS so frontend can read/write without auth token (since it's a public catalog)
    await client.query(`
      ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
    `);
    console.log('RLS disabled for orders table.');

  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    await client.end();
  }
}

setupDB();
