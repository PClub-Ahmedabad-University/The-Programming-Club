import { assignRole } from "@/app/api/controllers/admin.controller";
import { NextResponse } from "next/server";

export const PATCH = async (req, { params }) => {
  try {
    const data = await req.json();
    const { id } = await params;
    const user = await assignRole(id, data);
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};
