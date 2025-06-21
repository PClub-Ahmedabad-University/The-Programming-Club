import { NextResponse } from 'next/server';
import { addMemberToRole, removeMemberFromRole } from '@/app/api/controllers/recruitment.controllers';

export async function POST(request, { params }) {
    try {
        const { id } = params;
        const memberData = await request.json();
        const result = await addMemberToRole(id, memberData);
        return NextResponse.json(result.data, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const { memberId } = await request.json();
        const result = await removeMemberFromRole(id, memberId);
        return NextResponse.json(result, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 500 }
        );
    }
}
