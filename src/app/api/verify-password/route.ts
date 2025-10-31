import { NextResponse, NextRequest } from 'next/server';
import { HTBMachinesDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { machineId, password } = await request.json();

    if (!machineId || !password) {
      return NextResponse.json(
        { error: 'Machine ID and password are required' },
        { status: 400 }
      );
    }

    const machinesDB = new HTBMachinesDB();
    const machine = await machinesDB.getMachine(machineId);

    if (!machine) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Check if machine is active and has a password
    if (!machine.is_active || !machine.password) {
      return NextResponse.json(
        { error: 'Machine is not password protected' },
        { status: 400 }
      );
    }

    // Verify password
    if (machine.password === password) {
      return NextResponse.json({
        success: true,
        writeup: machine.writeup
      });
    } else {
      return NextResponse.json(
        { error: 'Wrong password' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}