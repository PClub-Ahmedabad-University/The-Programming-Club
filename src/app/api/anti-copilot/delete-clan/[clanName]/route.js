import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import AntiCopilotUser from '../../../models/anti-copilot-user.model';
import AntiCopilotEvent from '../../../models/anti-copilot-event.model';
import { verifyJWT } from '@/app/api/lib/jwt';
export async function DELETE(req, { params }) {
    try {
        // Verify admin token
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        const user = await verifyJWT(token);
        
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const { clanName } = params;
        const decodedClan = decodeURIComponent(clanName);

        // Find all users in the clan
        const clanUsers = await AntiCopilotUser.find({ clan: decodedClan.toLowerCase() });
        const machineIds = clanUsers.map(user => user.machineId);

        // Delete all users and their events in the clan
        await AntiCopilotUser.deleteMany({ clan: decodedClan.toLowerCase() });
        await AntiCopilotEvent.deleteMany({ machineId: { $in: machineIds } });

        return NextResponse.json({ 
            success: true,
            message: `Clan deleted successfully`,
            deletedCount: clanUsers.length
        });

    } catch (error) {
        console.error('Error deleting clan:', error);
        return NextResponse.json(
            { error: 'Failed to delete clan' },
            { status: 500 }
        );
    }
}
