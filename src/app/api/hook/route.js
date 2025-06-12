import Registration from '../models/registration.model';import User from '../models/user.model';
import connectDB from '../lib/db';
function parsePretty(pretty) {
  const result = {};
  if (!pretty) return result;
  pretty.split(',').forEach(pair => {
    const [key, ...rest] = pair.split(':');
    if (key && rest.length) {
      result[key.trim()] = rest.join(':').trim();
    }
  });
  return result;
}
export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    const answers = parsePretty(data.pretty);
    const registration = new Registration({
      ...data,
      ...answers 
    });
    await registration.save();
    const userEmail = answers['Student E-mail'] || data['Student E-mail'] || data.email;
    const eventId = data.event_id || data.event || answers['event_id']; 

    if (userEmail && eventId) {
      const user = await User.findOneAndUpdate(
        { email: userEmail },
        { $addToSet: { registeredEvents: eventId } } 
      );
      console.log(user);
    }
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err) {
    console.error('Error saving Registration:', err);
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}