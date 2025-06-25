import { NextResponse } from 'next/server';
import { getRecruitmentRoleById } from '@/app/api/controllers/recruitment.controllers';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const result = await getRecruitmentRoleById(id);
        return NextResponse.json(result.data, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 404 }
        );
    }
}
