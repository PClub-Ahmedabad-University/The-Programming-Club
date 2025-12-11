import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import AntiCopilotUser from '../../models/anti-copilot-user.model';
import AntiCopilotEvent from '../../models/anti-copilot-event.model';

export async function POST(request) {
    try {
        const body = await request.json();
        const { machineId, name, rollNumber, clan, leaderName, status, timestamp } = body;

        // Validate required fields
        if (!machineId || !status) {
            return NextResponse.json(
                { error: 'machineId and status are required' },
                { status: 400 }
            );
        }

        if (!['enabled', 'disabled'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be "enabled" or "disabled"' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Normalize data
        const normalizedClan = clan ? clan.trim().toLowerCase() : '';
        const eventTimestamp = timestamp ? new Date(timestamp) : new Date();

        // Update user's current status
        const user = await AntiCopilotUser.findOneAndUpdate(
            { machineId },
            {
                currentStatus: status,
                lastSeen: eventTimestamp,
                // Update other fields if provided
                ...(name && { name: name.trim() }),
                ...(rollNumber && { rollNumber: rollNumber.trim() }),
                ...(normalizedClan && { clan: normalizedClan }),
                ...(leaderName && { leaderName: leaderName.trim() })
            },
            { new: true, upsert: false }
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found. Please register first.' },
                { status: 404 }
            );
        }

        // Create event record
        const event = await AntiCopilotEvent.create({
            machineId,
            name: user.name,
            rollNumber: user.rollNumber,
            clan: user.clan,
            leaderName: user.leaderName,
            status,
            timestamp: eventTimestamp
        });

        return NextResponse.json({
            success: true,
            message: 'Event tracked successfully',
            event: {
                machineId: event.machineId,
                status: event.status,
                timestamp: event.timestamp
            }
        });
    } catch (error) {
        console.error('Tracking error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
