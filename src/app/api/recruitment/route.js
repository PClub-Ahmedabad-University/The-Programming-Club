import { NextResponse } from 'next/server';
import recruitmentController from '../controllers/recruitment.controllers';

export async function GET() {
    try {
        const result = await recruitmentController.getAllRecruitmentRoles();
        return NextResponse.json(result.data, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const result = await recruitmentController.createRecruitmentRole(data);
        return NextResponse.json(result.data, { status: result.statusCode });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: error.statusCode || 500 }
        );
    }
}
