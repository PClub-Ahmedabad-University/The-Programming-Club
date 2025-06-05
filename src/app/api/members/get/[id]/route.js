import { NextResponse } from 'next/server';
import { getMemberById } from '../../controllers/member.controller';

export async function GET(_req, { params }) {
  try {
    const member = await getMemberById(params.id);
    return NextResponse.json(member, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}