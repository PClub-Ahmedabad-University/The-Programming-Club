import { NextResponse } from 'next/server';
import { createRecruitmentRole } from '@/app/api/controllers/recruitment.controllers';

export async function POST(request) {
    try {
        const data = await request.json();
        const result = await createRecruitmentRole(data);
        return NextResponse.json(result.data, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 500 }
        );
    }
}
