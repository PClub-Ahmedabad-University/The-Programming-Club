import { NextResponse } from "next/server";
import { createNewAdmin } from "../../controllers/admin.controller";

export const POST = async (req) => {
  try {
    const data = await req.json();
    const user = await createNewAdmin(data);
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};
// req -> currentAdmin, newAdmin
// currentAdmin = email, pass
// newAdmin = all user details