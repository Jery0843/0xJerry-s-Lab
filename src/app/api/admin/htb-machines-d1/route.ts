import { NextResponse, NextRequest } from 'next/server';
import { HTBMachinesDB, AdminLogDB, getDatabase } from '@/lib/db';
import { notifySearchEngines } from '@/lib/seo-helpers';

interface HTBMachine {
  id: string;
  name: string;
  os: string;
  difficulty: string;
  status: string;
  date_completed?: string | null;
  tags: string;
  writeup?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface HTBMachineInput {
  id?: string;
  name: string;
  os: string;
  difficulty: string;
  status: string;
  dateCompleted?: string | null;
  tags: string[];
  writeup?: string | null;
}

// Helper function to convert database format to API format
function dbToApiFormat(dbMachine: any): HTBMachineInput {
  return {
    id: dbMachine.id,
    name: dbMachine.name,
    os: dbMachine.os,
    difficulty: dbMachine.difficulty,
    status: dbMachine.status,
    dateCompleted: dbMachine.date_completed,
    tags: dbMachine.tags ? JSON.parse(dbMachine.tags) : [],
    writeup: dbMachine.writeup
  };
}

// Helper function to convert API format to database format
function apiToDbFormat(apiMachine: HTBMachineInput): HTBMachine {
  return {
    id: apiMachine.id || apiMachine.name.toLowerCase().replace(/\s+/g, '-'),
    name: apiMachine.name,
    os: apiMachine.os,
    difficulty: apiMachine.difficulty,
    status: apiMachine.status,
    date_completed: apiMachine.dateCompleted || null,
    tags: JSON.stringify(apiMachine.tags || []),
    writeup: apiMachine.writeup || null
  };
}

// Session-based authentication helper
async function checkAuth(request: NextRequest): Promise<boolean> {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    // In a production app, you'd validate the session token against a sessions table
    // For now, we'll check if the cookie exists and is valid format
    return Boolean(sessionToken && sessionToken.length === 64);
  } catch (error) {
    console.error('Error checking admin auth:', error);
    return false;
  }
}

// GET - Fetch all HTB machines from D1 database
export async function GET() {
  try {
    console.log('🔍 Fetching HTB machines from database...');
    const machinesDB = new HTBMachinesDB();
    
    const dbMachines = await machinesDB.getAllMachines();
    
    console.log('📊 Raw database machines:', dbMachines.length, 'found');
    
    const machines = dbMachines.map(dbToApiFormat);
    
    console.log('✅ Returning', machines.length, 'machines');
    return NextResponse.json(machines);
  } catch (error) {
    console.error('❌ Error fetching HTB machines from D1:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch machines from database' }, 
      { status: 500 }
    );
  }
}

// POST - Add new HTB machine to D1 database
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!(await checkAuth(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const machineData: HTBMachineInput = await request.json();
    
    // Validate required fields
    if (!machineData.name || !machineData.os || !machineData.difficulty || !machineData.status) {
      return NextResponse.json(
        { error: 'Missing required fields: name, os, difficulty, status' },
        { status: 400 }
      );
    }

    const machinesDB = new HTBMachinesDB();
    const dbMachine = apiToDbFormat(machineData);
    
    // Check if machine already exists
    const existing = await machinesDB.getMachine(dbMachine.id);

    if (existing) {
      return NextResponse.json(
        { error: 'Machine with this ID already exists' },
        { status: 409 }
      );
    }

    // Create new machine
    const created = await machinesDB.createMachine(dbMachine);

    if (!created) {
      return NextResponse.json(
        { error: 'Failed to create machine' },
        { status: 500 }
      );
    }

    // Notify search engines about new content (async, don't wait)
    notifySearchEngines().catch(err => 
      console.warn('SEO notification failed:', err)
    );

    return NextResponse.json({
      message: 'Machine created successfully',
      machine: dbToApiFormat(created)
    });

  } catch (error) {
    console.error('Error creating HTB machine:', error);
    return NextResponse.json(
      { error: 'Failed to create machine' },
      { status: 500 }
    );
  }
}

// PUT - Update existing HTB machine in D1 database
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT request received for machine update');
    
    // Check authentication
    if (!(await checkAuth(request))) {
      console.log('❌ Authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const machineData: HTBMachineInput = await request.json();
    console.log('📝 Machine data received for update:', machineData);
    
    // Validate required fields
    if (!machineData.id || !machineData.name || !machineData.os || !machineData.difficulty || !machineData.status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, os, difficulty, status' },
        { status: 400 }
      );
    }

    const machinesDB = new HTBMachinesDB();
    const dbMachine = apiToDbFormat(machineData);
    
    // Check if machine exists
    const existing = await machinesDB.getMachine(dbMachine.id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Update machine
    const updated = await machinesDB.updateMachine(dbMachine.id, dbMachine);

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update machine' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Machine updated successfully',
      machine: dbToApiFormat(updated)
    });

  } catch (error) {
    console.error('Error updating HTB machine:', error);
    return NextResponse.json(
      { error: 'Failed to update machine' },
      { status: 500 }
    );
  }
}

// DELETE - Remove HTB machine from D1 database
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    if (!(await checkAuth(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('id');
    
    if (!machineId) {
      return NextResponse.json(
        { error: 'Machine ID is required' },
        { status: 400 }
      );
    }

    const machinesDB = new HTBMachinesDB();
    
    // Check if machine exists
    const existing = await machinesDB.getMachine(machineId);

    if (!existing) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Delete machine
    const success = await machinesDB.deleteMachine(machineId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete machine' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Machine deleted successfully',
      machine: dbToApiFormat(existing)
    });

  } catch (error) {
    console.error('Error deleting HTB machine:', error);
    return NextResponse.json(
      { error: 'Failed to delete machine' },
      { status: 500 }
    );
  }
}

// PATCH - Bulk operations (e.g., bulk status updates, bulk delete)
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    if (!(await checkAuth(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { operation, data } = await request.json();
    
    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available - running in development mode' },
        { status: 503 }
      );
    }

    switch (operation) {
      case 'bulk_update_status':
        const { machineIds, newStatus } = data;
        if (!machineIds || !Array.isArray(machineIds) || !newStatus) {
          return NextResponse.json(
            { error: 'Invalid data for bulk status update' },
            { status: 400 }
          );
        }

        const placeholders = machineIds.map(() => '?').join(',');
        const updateResult = await db
          .prepare(`
            UPDATE htb_machines 
            SET status = ?, updated_at = datetime('now')
            WHERE id IN (${placeholders})
          `)
          .bind(newStatus, ...machineIds)
          .run();

        return NextResponse.json({
          message: `Updated ${updateResult.changes} machines`,
          updated: updateResult.changes
        });

      case 'bulk_delete':
        const { machineIdsToDelete } = data;
        if (!machineIdsToDelete || !Array.isArray(machineIdsToDelete)) {
          return NextResponse.json(
            { error: 'Invalid data for bulk delete' },
            { status: 400 }
          );
        }

        const deletePlaceholders = machineIdsToDelete.map(() => '?').join(',');
        const deleteResult = await db
          .prepare(`DELETE FROM htb_machines WHERE id IN (${deletePlaceholders})`)
          .bind(...machineIdsToDelete)
          .run();

        return NextResponse.json({
          message: `Deleted ${deleteResult.changes} machines`,
          deleted: deleteResult.changes
        });

      default:
        return NextResponse.json(
          { error: 'Unknown operation' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
