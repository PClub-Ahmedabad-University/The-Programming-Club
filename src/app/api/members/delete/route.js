import { NextResponse } from "next/server";
import { deleteMemberById } from "../../controllers/member.controller";

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const result = await deleteMemberById(id);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}