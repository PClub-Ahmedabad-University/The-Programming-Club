import { NextResponse } from 'next/server';
import { getRecruitmentRoleById } from '@/app/api/controllers/recruitment.controllers';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const result = await getRecruitmentRoleById(id);
        if (result.statusCode !== 200) {
            return NextResponse.json(
                { message: 'Recruitment role not found' },
                { status: 404 }
            );
        }
        return NextResponse.json({ members: result.data.members || [] }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
