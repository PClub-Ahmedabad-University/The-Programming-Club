import { NextResponse } from 'next/server';
import { getAllRecruitmentRoles } from '@/app/api/controllers/recruitment.controllers';

export async function GET() {
    try {
        // console.log('GET /api/recruitment/get called');
        const result = await getAllRecruitmentRoles();
        // console.log('Controller result:', result);
        
        return new NextResponse(JSON.stringify(result.data || []), {
            status: result.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        console.error('Error in GET /api/recruitment/get:', error);
        return new NextResponse(
            JSON.stringify({ 
                message: error.message || 'Internal Server Error',
                error: error.toString() 
            }), 
            { 
                status: error.statusCode || 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }
}

export const OPTIONS = async () => {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
};
