import { NextResponse } from 'next/server';
import { updateRoleLeader } from '@/app/api/controllers/recruitment.controllers';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const { leader } = await request.json();
        const result = await updateRoleLeader(id, leader);
        return NextResponse.json(result.data, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 500 }
        );
    }
}
