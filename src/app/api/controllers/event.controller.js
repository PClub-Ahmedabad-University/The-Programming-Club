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


export const addWinners = async ({ eventTitle, eventWinners }) => {
  console.log(`🔍 [addWinners] Starting for event: ${eventTitle}`);
  console.log(`🏆 Processing ${eventWinners.length} winners`);

  if (!eventTitle || !eventWinners || !Array.isArray(eventWinners)) {
    const error = new Error("Invalid input: eventTitle and eventWinners array are required");
    error.statusCode = 400;
    throw error;
  }

  try {
    await connectDB();
    const event = await Event.findOne({ title: eventTitle });
    if (!event) {
      const error = new Error(`Event not found: ${eventTitle}`);
      error.statusCode = 404;
      throw error;
    }
    const processedWinners = [];
    for (let i = 0; i < eventWinners.length; i++) {
      const winner = eventWinners[i];
      if (!winner.name) {
        console.error(`Missing required field 'name' for winner at index ${i}`);
        continue;
      }
      let processedWinner = { ...winner };
      if (winner.image && typeof winner.image === 'string' && winner.image.startsWith('data:image')) {
        console.log(`Found image data for ${winner.name}, uploading to Cloudinary...`);
        try {
          const publicId = `${event.title.replace(/\s+/g, "_")}_${Date.now()}_${i}`;
          console.log(`Uploading image with public_id: ${publicId}`);
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
              winner.image,
              {
                folder: "winners",
                public_id: publicId,
                resource_type: "image",
                overwrite: true
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
          });

          processedWinner.image = uploadResult.secure_url;
          console.log(`Image uploaded: ${uploadResult.secure_url.substring(0, 50)}...`);
        } catch (uploadError) {
          console.error(`Error uploading image for ${winner.name}:`, uploadError);
          processedWinner.image = '';
        }
      } else if (winner.image) {
        console.log(`Using existing image URL for ${winner.name}`);
      } else {
        console.log(`No image provided for ${winner.name}`);
        processedWinner.image = '';
      }

      processedWinners.push(processedWinner);
    }
    if (processedWinners.length === 0) {
      throw new Error("No valid winners to add");
    }
    
    // Append new winners to existing ones instead of replacing
    const existingWinners = event.winners || [];
    const updatedWinners = [...existingWinners, ...processedWinners];
    
    // Update the event with the combined winners array
    event.winners = updatedWinners;
    
    // Save the updated event
    const saved = await event.save({ validateModifiedOnly: true });
    
    console.log(`✅ Successfully added ${processedWinners.length} winners to ${event.title}`);
    console.log(`Total winners now: ${saved.winners.length}`);
    
    return {
      success: true,
      message: `Successfully added ${processedWinners.length} winners to ${event.title}`,
      winnersAdded: processedWinners.length,
      totalWinners: saved.winners.length,
      event: {
        _id: saved._id,
        title: saved.title,
        winners: saved.winners.map(w => ({
          _id: w._id,
          name: w.name,
          description: w.description || '',
          image: w.image || '',
          position: w.position
        }))
      },
    };
  } catch (error) {
    console.error("[addWinners] Error:", {
      message: error.message,
      name: error.name,
      code: error.code,
      keyValue: error.keyValue,
      errors: error.errors
    });
    const enhancedError = new Error(`Failed to add winners: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.statusCode = error.statusCode || 500;
    throw enhancedError;
  }
};


export const getWinners = async (eventId) => {
  console.log(`[getWinners] Fetching winners for event: ${eventId}`);
  
  if (!eventId) {
    const error = new Error("Event ID is required");
    error.statusCode = 400;
    throw error;
  }

  try {
    await connectDB();
    
    // Find the event with only the winners field populated
    const event = await Event.findById(eventId, 'winners title');
    
    if (!event) {
      const error = new Error(`Event not found with ID: ${eventId}`);
      error.statusCode = 404;
      throw error;
    }

    // If no winners, return empty array instead of undefined
    const winners = event.winners || [];
    
    console.log(`Found ${winners.length} winners for event: ${event.title}`);
    
    return {
      success: true,
      message: `${winners.length} winners found`,
      event: {
        _id: event._id,
        title: event.title,
        winners: winners.map(winner => ({
          _id: winner._id,
          name: winner.name,
          description: winner.description || '',
          image: winner.image || '',
          position: winner.position
          // Add any other winner fields you want to include
        }))
      },
      count: winners.length
    };
    
  } catch (error) {
    console.error(`Error in getWinners for event ${eventId}:`, {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    const enhancedError = new Error(`Failed to fetch winners: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.statusCode = error.statusCode || 500;
    throw enhancedError;
  }
};

export const updateWinner = async ({ eventId, winnerId, updateData }) => {
  console.log(`[updateWinner] Starting update for winner ${winnerId} in event ${eventId}`);
  
  if (!eventId || !winnerId || !updateData) {
    const error = new Error("Missing required parameters: eventId, winnerId, and updateData are required");
    error.statusCode = 400;
    throw error;
  }

  try {
    await connectDB();
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      const error = new Error(`Event not found with ID: ${eventId}`);
      error.statusCode = 404;
      throw error;
    }

    // Find the winner in the event
    const winner = event.winners.id(winnerId);
    if (!winner) {
      const error = new Error(`Winner not found with ID: ${winnerId} in event ${eventId}`);
      error.statusCode = 404;
      throw error;
    }

    // Handle image update if there's a new image
    if (updateData.image) {
      if (updateData.image.startsWith('data:image')) {
        console.log(`Uploading new image for winner ${winnerId}`);
        try {
          const publicId = `${event.title.replace(/\s+/g, "_")}_${winnerId}_${Date.now()}`;
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
              updateData.image,
              {
                folder: "winners",
                public_id: publicId,
                resource_type: "image",
                overwrite: true
              },
              (error, result) => error ? reject(error) : resolve(result)
            );
          });
          updateData.image = uploadResult.secure_url;
          console.log(`Image uploaded successfully: ${uploadResult.secure_url.substring(0, 50)}...`);
        } catch (uploadError) {
          console.error(`Error uploading image for winner ${winnerId}:`, uploadError);
          // Keep the existing image if upload fails
          if (winner.image) {
            updateData.image = winner.image;
          } else {
            updateData.image = '';
          }
        }
      } else if (updateData.image === '') {
        // If empty string is passed, remove the image
        console.log(`Removing image for winner ${winnerId}`);
        updateData.image = '';
      }
    }

    // Update winner fields
    const previousData = { ...winner.toObject() };
    winner.set(updateData);
    
    // Save the updated event
    const updatedEvent = await event.save({ validateModifiedOnly: true });
    const updatedWinner = updatedEvent.winners.id(winnerId);

    console.log(`Successfully updated winner ${winnerId} in event ${eventId}`);
    return {
      success: true,
      message: "Winner updated successfully",
      winner: {
        _id: updatedWinner._id,
        name: updatedWinner.name,
        description: updatedWinner.description || '',
        image: updatedWinner.image || '',
        position: updatedWinner.position,
        // Include any other winner fields you want to return
      },
      changes: {
        before: {
          name: previousData.name,
          description: previousData.description,
          image: previousData.image,
          position: previousData.position
        },
        after: {
          name: updatedWinner.name,
          description: updatedWinner.description,
          image: updatedWinner.image,
          position: updatedWinner.position
        }
      }
    };
  } catch (error) {
    console.error(`Error in updateWinner for winner ${winnerId}:`, {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    const enhancedError = new Error(`Failed to update winner: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.statusCode = error.statusCode || 500;
    throw enhancedError;
  }
};


export const deleteWinner = async ({ eventId, winnerId }) => {
  try {
    await connectDB();

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check if the winner exists
    const winnerExists = event.winners.id(winnerId);
    if (!winnerExists) throw new Error("Winner not found");

    // Filter out the winner
    event.winners = event.winners.filter(
      (w) => w._id.toString() !== winnerId
    );

    await event.save({ validateBeforeSave: false });


    return {
      success: true,
      message: "Winner deleted successfully",
    };
  } catch (error) {
    throw new Error(`Delete Winner Error: ${error.message}`);
  }
};
