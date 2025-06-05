import { NextResponse } from 'next/server';
import { getAllMember } from '../../controllers/member.controller';
export async function GET(_req) {
  try {
    const members = await getAllMember();
    return NextResponse.json(members, { status: 200 });
  } catch(e) {
    return NextResponse.json({error: e.message}, {status : 500});
  }
}