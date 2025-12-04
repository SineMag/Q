import { pool } from './index.js';

export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Create enum types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE triage_level AS ENUM ('immediate', 'urgent', 'semi_urgent', 'non_urgent');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE queue_status AS ENUM ('waiting', 'in_progress', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create staff table
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        is_available BOOLEAN DEFAULT true,
        current_patient_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create patients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        phone_number VARCHAR(20),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create queue table
    await client.query(`
      CREATE TABLE IF NOT EXISTS queue (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
        triage_level triage_level NOT NULL DEFAULT 'non_urgent',
        status queue_status NOT NULL DEFAULT 'waiting',
        check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estimated_wait_minutes INTEGER,
        actual_wait_minutes INTEGER,
        notes TEXT,
        priority_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
      CREATE INDEX IF NOT EXISTS idx_queue_triage ON queue(triage_level);
      CREATE INDEX IF NOT EXISTS idx_queue_priority ON queue(priority_score DESC);
      CREATE INDEX IF NOT EXISTS idx_queue_patient ON queue(patient_id);
      CREATE INDEX IF NOT EXISTS idx_queue_staff ON queue(staff_id);
    `);

    // Insert default staff members if none exist
    const staffCount = await client.query('SELECT COUNT(*) FROM staff');
    if (parseInt(staffCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO staff (name, role, is_available) VALUES
        ('Dr. Sarah Chen', 'Physician', true),
        ('Dr. Michael Torres', 'Physician', true),
        ('Nurse Emily Johnson', 'Nurse', true),
        ('Nurse James Wilson', 'Nurse', true);
      `);
    }

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

