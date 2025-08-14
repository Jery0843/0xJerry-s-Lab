import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import machinesData from '@/data/machines.json';
import { HTBMachinesDB } from '@/lib/db';
import { generateMachineMetadata } from '@/lib/seo-helpers';
import MachinePage from './machine-page';

interface MachinePageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all machines
export async function generateStaticParams() {
  try {
    // Always start with static data
    const staticMachines = machinesData
      .filter(machine => machine.id && typeof machine.id === 'string')
      .map((machine) => ({
        slug: machine.id,
      }));
    
    console.log('Generated static params:', staticMachines);
    
    // Return static params only to avoid database issues during build
    return staticMachines;
  } catch (error) {
    console.error('Error generating static params:', error);
    // Fallback to hardcoded machine IDs if all else fails
    return [
      { slug: 'lame' },
      { slug: 'legacy' },
      { slug: 'devel' },
      { slug: 'beep' },
      { slug: 'optimum' }
    ];
  }
}

// Generate metadata for each machine page
export async function generateMetadata({ params }: MachinePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  try {
    // First, try to find in static data
    let machine = machinesData.find(m => m.id === slug);
    
    // If not found in static data, try database
    if (!machine) {
      try {
        const machinesDB = new HTBMachinesDB();
        const dbMachine = await machinesDB.getMachine(slug);
        if (dbMachine) {
          machine = dbMachine;
        }
      } catch (error) {
        console.warn('Database not available for metadata, using static data only:', error);
      }
    }

    if (!machine) {
      return {
        title: 'Machine Not Found | 0xJerry\'s Lab',
        description: 'The requested machine writeup could not be found.',
      };
    }

    return generateMachineMetadata(machine);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Machine | 0xJerry\'s Lab',
      description: 'Hack The Box machine writeup and walkthrough.',
    };
  }
}

export default async function MachinePageWrapper({ params }: MachinePageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  console.log('Looking for machine with slug:', slug);
  console.log('Available machines:', machinesData.map(m => m.id));
  
  try {
    // First, try to find in static data
    let machine = machinesData.find(m => m.id === slug);
    
    if (machine) {
      console.log('Found machine in static data:', machine.name);
      return <MachinePage machine={machine} />;
    }
    
    // If not found in static data, try database
    try {
      const machinesDB = new HTBMachinesDB();
      const dbMachine = await machinesDB.getMachine(slug);
      if (dbMachine) {
        console.log('Found machine in database:', dbMachine.name);
        return <MachinePage machine={dbMachine} />;
      }
    } catch (dbError) {
      console.warn('Database lookup failed:', dbError);
    }

    console.log('Machine not found anywhere, slug:', slug);
    notFound();
  } catch (error) {
    console.error('Error loading machine page:', error);
    notFound();
  }
}