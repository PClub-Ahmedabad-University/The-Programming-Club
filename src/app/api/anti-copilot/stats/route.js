import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import AntiCopilotUser from '../../models/anti-copilot-user.model';
import AntiCopilotEvent from '../../models/anti-copilot-event.model';

export async function GET(request) {
    try {
        // Connect to database
        await connectDB();

        // Get all users with their current status, sorted by lastSeen (most recent first)
        const users = await AntiCopilotUser.find({})
            .sort({ lastSeen: -1 })
            .lean();

        // Calculate statistics
        const total = users.length;
        const active = users.filter(user => user.currentStatus === 'enabled').length;
        const inactive = users.filter(user => user.currentStatus === 'disabled').length;

        // Get total number of events
        const totalEvents = await AntiCopilotEvent.countDocuments({});

        // Group users by clan
        const clanGroups = users.reduce((acc, user) => {
            const clan = user.clan || 'unknown';
            if (!acc[clan]) {
                acc[clan] = [];
            }
            acc[clan].push(user);
            return acc;
        }, {});

        // For each clan, group by leader
        const clanLeaderGroups = {};
        Object.keys(clanGroups).forEach(clan => {
            clanLeaderGroups[clan] = clanGroups[clan].reduce((acc, user) => {
                const leader = user.leaderName || 'unknown';
                if (!acc[leader]) {
                    acc[leader] = [];
                }
                acc[leader].push(user);
                return acc;
            }, {});
        });

        return NextResponse.json({
            success: true,
            stats: {
                total,
                active,
                inactive,
                totalEvents
            },
            users: users.map(user => ({
                machineId: user.machineId,
                name: user.name,
                rollNumber: user.rollNumber,
                clan: user.clan,
                leaderName: user.leaderName,
                currentStatus: user.currentStatus,
                lastSeen: user.lastSeen,
                registeredAt: user.registeredAt
            })),
            clanGroups: clanLeaderGroups
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

// Optional: POST endpoint for filtered stats
export async function POST(request) {
    try {
        const body = await request.json();
        const { clan, leaderName, status } = body;

        // Connect to database
        await connectDB();

        // Build query
        const query = {};
        if (clan) query.clan = clan.trim().toLowerCase();
        if (leaderName) query.leaderName = leaderName.trim();
        if (status) query.currentStatus = status;

        // Get filtered users
        const users = await AntiCopilotUser.find(query)
            .sort({ lastSeen: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: users.length,
            users: users.map(user => ({
                machineId: user.machineId,
                name: user.name,
                rollNumber: user.rollNumber,
                clan: user.clan,
                leaderName: user.leaderName,
                currentStatus: user.currentStatus,
                lastSeen: user.lastSeen,
                registeredAt: user.registeredAt
            }))
        });
    } catch (error) {
        console.error('Filtered stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
