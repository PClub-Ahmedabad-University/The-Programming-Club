import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import AntiCopilotUser from '../../models/anti-copilot-user.model';

export async function POST(request) {
    try {
        const body = await request.json();
        const { machineId, name, rollNumber, clan, leaderName } = body;

        // Validate required fields
        if (!machineId || !name || !rollNumber || !clan || !leaderName) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Normalize data
        const normalizedClan = clan.trim().toLowerCase();
        const normalizedLeaderName = leaderName.trim();

        // Check if user already exists
        let user = await AntiCopilotUser.findOne({ machineId });

        if (user) {
            // Update existing user
            user.name = name.trim();
            user.rollNumber = rollNumber.trim();
            user.clan = normalizedClan;
            user.leaderName = normalizedLeaderName;
            user.lastSeen = new Date();
            await user.save();

            return NextResponse.json({
                success: true,
                message: 'User updated successfully',
                user: {
                    machineId: user.machineId,
                    name: user.name,
                    rollNumber: user.rollNumber,
                    clan: user.clan,
                    leaderName: user.leaderName
                }
            });
        } else {
            // Create new user
            user = await AntiCopilotUser.create({
                machineId,
                name: name.trim(),
                rollNumber: rollNumber.trim(),
                clan: normalizedClan,
                leaderName: normalizedLeaderName,
                currentStatus: 'disabled',
                registeredAt: new Date(),
                lastSeen: new Date()
            });

            return NextResponse.json({
                success: true,
                message: 'User registered successfully',
                user: {
                    machineId: user.machineId,
                    name: user.name,
                    rollNumber: user.rollNumber,
                    clan: user.clan,
                    leaderName: user.leaderName
                }
            }, { status: 201 });
        }
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
