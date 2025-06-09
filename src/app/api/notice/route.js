import connectDB from "../lib/db";
import Notice from "../models/notice.model";

export async function GET() {
  await connectDB();
  const notice = await Notice.findOne();
  if (!notice) return Response.json({ show: false });
  return Response.json({
    show: notice.show,
    link: notice.link,
    message: notice.message,
    _id: notice._id,
  });
}
export async function POST(req) {
  await connectDB();
  const data = await req.json();
  let notice = await Notice.findOne();
  if (!notice) {
    notice = await Notice.create(data);
  } else {
    notice.show = data.show;
    notice.link = data.link;
    notice.message = data.message;
    await notice.save();
  }
  return Response.json({ success: true, notice });
}
export async function DELETE() {
  await connectDB();
  await Notice.deleteMany({});
  return Response.json({ success: true });
}