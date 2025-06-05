import connectDB from "../lib/db";
import Event from "../models/event.model";
import cloudinary from "../lib/cloudinary";
//------------------------------------------------------
export const updateEvent = async (id, updateData) => {
  try {
    await connectDB();
    const { image, ...rest } = updateData;
    let updatedFields = { ...rest };
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: "events",
        resource_type: "image",
      });
      updatedFields.image = uploadRes.secure_url;
    }
    const updatedEvent = await Event.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    });
    if (!updatedEvent) {
      throw new Error("Event not found");
    }
    return updatedEvent;
  } catch (error) {
    throw new Error(`Failed to patch update event: ${error.message}`);
  }
};
//------------------------------------------------------
export const addNewEvent = async (req) => {
  await connectDB();
  const data = req;
  const { image, ...rest } = data;
  // console.log(rest);
  if (!image) {
    throw new Error("Image not provided");
    // to be replaced by a dummy url
  }
  const uploadRes = await cloudinary.uploader.upload(image, {
    folder: "events",
    resource_type: "image",
  });
  const imageUrl = uploadRes.secure_url;
  const event = await Event.create({ ...rest, imageUrl: imageUrl });
  return event;
}
//------------------------------------------------------
export const deleteEvent = async (id) => {
  await connectDB();
  const deletedEvent = await Event.findByIdAndDelete(id);
  if (!deletedEvent) {
    throw new Error("Event not found");
  }
  return deletedEvent;
}
//------------------------------------------------------
export const getEvents = async (_req) => {
  await connectDB();
  const events = await Event.find();
  if (!events) {
    throw new Error("No events found");
  }
  return events;
}
//------------------------------------------------------
export const ongoingEvents = async (_req) => {
  await connectDB();
  const events = await Event.find({ status: "ongoing" });
  if (!events) {
    throw new Error("No ongoing events found");
  }
  return events;
}

export const getEventById = async (req) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); 

    const event = await Event.findById(id);
    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    throw new Error(`Failed to fetch event: ${error.message}`);
  }
};
