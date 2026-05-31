import { neon } from '@neondatabase/serverless'

  // Lazy singleton – created on first request, NOT at module load.
  // This prevents build-time errors when DATABASE_URL is not yet set.
  let _sql: ReturnType<typeof neon> | null = null

  function getSql(): ReturnType<typeof neon> {
    if (!_sql) {
      const url = process.env.DATABASE_URL
      if (!url) {
        throw new Error(
          '[FLUX Panel] DATABASE_URL is not set. ' +
          'Please add your Neon PostgreSQL connection string in the Vercel Environment Variables dashboard.'
        )
      }
      _sql = neon(url)
    }
    return _sql
  }

  // Proxy so callers can keep using `sql`... syntax unchanged
  const sql = new Proxy(
    // placeholder object – never actually called through this object
    (() => {}) as unknown as ReturnType<typeof neon>,
    {
      apply(_t, _ctx, args) {
        return (getSql() as any)(...args)
      },
      get(_t, prop) {
        const db = getSql() as any
        if (typeof db[prop] === 'function') return db[prop].bind(db)
        return db[prop]
      },
    }
  )

  export default sql

  export async function initDB() {
    const db = getSql()
    await db`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )`

    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        telegram VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`

    await db`
      CREATE TABLE IF NOT EXISTS licenses (
        id SERIAL PRIMARY KEY,
        key VARCHAR(64) UNIQUE NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        hwid VARCHAR(255),
        duration_days INT NOT NULL DEFAULT 30,
        expires_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'unused',
        activations INT DEFAULT 0,
        last_seen TIMESTAMP,
        last_ip VARCHAR(45),
        device_model VARCHAR(150),
        android_version VARCHAR(20),
        game_version VARCHAR(20),
        features JSONB DEFAULT '{"autoAim":true,"autoPlay":true,"autoQueue":true,"bypass":true}',
        created_at TIMESTAMP DEFAULT NOW()
      )`

    await db`
      CREATE TABLE IF NOT EXISTS versions (
        id SERIAL PRIMARY KEY,
        version VARCHAR(20) NOT NULL,
        changelog TEXT,
        download_url VARCHAR(500),
        is_latest BOOLEAN DEFAULT false,
        min_version VARCHAR(20) DEFAULT '1.0.0',
        game_version VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      )`

    await db`
      CREATE TABLE IF NOT EXISTS telemetry (
        id SERIAL PRIMARY KEY,
        license_key VARCHAR(64),
        hwid VARCHAR(255),
        device_model VARCHAR(150),
        android_version VARCHAR(20),
        game_version VARCHAR(20),
        features_used JSONB,
        ip VARCHAR(45),
        event_type VARCHAR(30) DEFAULT 'session',
        created_at TIMESTAMP DEFAULT NOW()
      )`
  }
  