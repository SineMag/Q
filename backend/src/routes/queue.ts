import express from 'express';
import { pool } from '../db/index.js';
import { broadcastUpdate } from '../index.js';

const router = express.Router();

// Calculate priority score based on triage level and wait time
function calculatePriorityScore(triageLevel: string, waitMinutes: number): number {
  const triageWeights: Record<string, number> = {
    immediate: 1000,
    urgent: 500,
    semi_urgent: 200,
    non_urgent: 50,
  };
  
  const baseScore = triageWeights[triageLevel] || 0;
  const waitBonus = Math.min(waitMinutes * 2, 200); // Max 200 for waiting
  
  return baseScore + waitBonus;
}

// Get queue with patient and staff info
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        q.*,
        p.first_name,
        p.last_name,
        p.phone_number,
        p.email,
        s.name as staff_name,
        s.role as staff_role
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      LEFT JOIN staff s ON q.staff_id = s.id
    `;
    
    const params: any[] = [];
    if (status) {
      query += ' WHERE q.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY q.priority_score DESC, q.check_in_time ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Get queue statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'waiting') as waiting_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        AVG(estimated_wait_minutes) FILTER (WHERE status = 'waiting') as avg_wait_time,
        COUNT(*) FILTER (WHERE triage_level = 'immediate') as immediate_count,
        COUNT(*) FILTER (WHERE triage_level = 'urgent') as urgent_count
      FROM queue
      WHERE status IN ('waiting', 'in_progress')
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({ error: 'Failed to fetch queue stats' });
  }
});

// Add patient to queue (check-in patient)
router.post('/check-in', async (req, res) => {
  try {
    const { patient_id, triage_level, notes } = req.body;
    
    if (!patient_id || !triage_level) {
      return res.status(400).json({ error: 'Patient ID and triage level are required' });
    }

    // Calculate estimated wait time (simplified .... in some apps, this would use AI/google)
    const waitingCount = await pool.query(
      'SELECT COUNT(*) FROM queue WHERE status = $1',
      ['waiting']
    );
    const waitCount = parseInt(waitingCount.rows[0].count);
    const estimatedWait = Math.max(5, waitCount * 10); // Simple estimation

    const priorityScore = calculatePriorityScore(triage_level, 0);

    const result = await pool.query(
      `INSERT INTO queue (patient_id, triage_level, notes, estimated_wait_minutes, priority_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [patient_id, triage_level, notes || null, estimatedWait, priorityScore]
    );

    // Get full queue entry with patient info
    const fullEntry = await pool.query(
      `SELECT 
        q.*,
        p.first_name,
        p.last_name,
        p.phone_number,
        p.email
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      WHERE q.id = $1`,
      [result.rows[0].id]
    );

    // Broadcast update
    broadcastUpdate({ type: 'queue_updated', data: fullEntry.rows[0] });

    res.status(201).json(fullEntry.rows[0]);
  } catch (error) {
    console.error('Error checking in patient:', error);
    res.status(500).json({ error: 'Failed to check in patient' });
  }
});

// Update queue entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staff_id, triage_level, notes, estimated_wait_minutes } = req.body;

    // Get current entry
    const current = await pool.query('SELECT * FROM queue WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }

    const currentEntry = current.rows[0];
    let actualWaitMinutes = currentEntry.actual_wait_minutes;

    // Calculate actual wait time if status changed to in_progress
    if (status === 'in_progress' && currentEntry.status === 'waiting') {
      const checkInTime = new Date(currentEntry.check_in_time);
      const now = new Date();
      actualWaitMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / 60000);
    }

    // Recalculate priority if triage level changed
    let priorityScore = currentEntry.priority_score;
    if (triage_level && triage_level !== currentEntry.triage_level) {
      const waitTime = actualWaitMinutes || 0;
      priorityScore = calculatePriorityScore(triage_level, waitTime);
    }

    const result = await pool.query(
      `UPDATE queue 
       SET status = COALESCE($1, status),
           staff_id = COALESCE($2, staff_id),
           triage_level = COALESCE($3, triage_level),
           notes = COALESCE($4, notes),
           estimated_wait_minutes = COALESCE($5, estimated_wait_minutes),
           actual_wait_minutes = COALESCE($6, actual_wait_minutes),
           priority_score = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [status, staff_id, triage_level, notes, estimated_wait_minutes, actualWaitMinutes, priorityScore, id]
    );

    // Update staff availability
    if (staff_id) {
      await pool.query(
        'UPDATE staff SET current_patient_id = $1, is_available = false WHERE id = $2',
        [id, staff_id]
      );
    }

    // Get full entry with patient info
    const fullEntry = await pool.query(
      `SELECT 
        q.*,
        p.first_name,
        p.last_name,
        p.phone_number,
        p.email,
        s.name as staff_name,
        s.role as staff_role
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      LEFT JOIN staff s ON q.staff_id = s.id
      WHERE q.id = $1`,
      [id]
    );

    // Broadcast update
    broadcastUpdate({ type: 'queue_updated', data: fullEntry.rows[0] });

    res.json(fullEntry.rows[0]);
  } catch (error) {
    console.error('Error updating queue:', error);
    res.status(500).json({ error: 'Failed to update queue' });
  }
});

// Complete queue entry
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE queue 
       SET status = 'completed',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }

    // Free up staff member
    const queueEntry = result.rows[0];
    if (queueEntry.staff_id) {
      await pool.query(
        'UPDATE staff SET current_patient_id = NULL, is_available = true WHERE id = $1',
        [queueEntry.staff_id]
      );
    }

    // Broadcast update
    broadcastUpdate({ type: 'queue_completed', data: result.rows[0] });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error completing queue entry:', error);
    res.status(500).json({ error: 'Failed to complete queue entry' });
  }
});

// Get patient's queue status
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        q.*,
        p.first_name,
        p.last_name,
        s.name as staff_name,
        s.role as staff_role
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      LEFT JOIN staff s ON q.staff_id = s.id
      WHERE q.patient_id = $1 AND q.status != 'completed'
      ORDER BY q.created_at DESC
      LIMIT 1`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active queue entry found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching patient queue status:', error);
    res.status(500).json({ error: 'Failed to fetch patient queue status' });
  }
});

export default router;

