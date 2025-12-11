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
        
        const { machineId } = params;

        // Delete user and all their events
        await AntiCopilotUser.findOneAndDelete({ machineId });
        await AntiCopilotEvent.deleteMany({ machineId });

        return NextResponse.json({ 
            success: true,
            message: 'User and events deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
