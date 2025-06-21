import { NextResponse } from 'next/server';
import { deleteRecruitmentRole } from '@/app/api/controllers/recruitment.controllers';

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const result = await deleteRecruitmentRole(id);
        return NextResponse.json(result, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 500 }
        );
    }
}
