import { NextResponse } from 'next/server';
import { updateRecruitmentRole } from '@/app/api/controllers/recruitment.controllers';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const data = await request.json();
        const result = await updateRecruitmentRole(id, data);
        return NextResponse.json(result.data, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 500 }
        );
    }
}
