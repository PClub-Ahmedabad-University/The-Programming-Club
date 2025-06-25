import Form from '../models/form.model.js';
import connectDB from '../lib/db';
import { Types } from 'mongoose';

function validateField(field) {
  const { type, name, options } = field;
  
  if (!name) {
    return { isValid: false, error: 'Field name is required' };
  }

  // Validate options for radio, checkbox, and select fields
  if (['radio', 'checkbox', 'select'].includes(type)) {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return { 
        isValid: false, 
        error: `Options are required for ${type} fields` 
      };
    }

    // Validate each option
    for (const option of options) {
      if (!option.name || !option.value) {
        return { 
          isValid: false, 
          error: 'Each option must have both name and value' 
        };
      }
    }
  }

  return { isValid: true };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, fields, isEvent = false, eventId = null } = body;
    
    if (!title || !fields || !Array.isArray(fields)) {
      return new Response(
        JSON.stringify({ error: 'Title and fields array are required' }), 
        { status: 400 }
      );
    }

    // Validate each field
    for (const field of fields) {
      const { isValid, error } = validateField(field);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: `Invalid field: ${error}` }), 
          { status: 400 }
        );
      }
    }

    // Ensure backward compatibility by adding label field if it doesn't exist
    const fieldsWithLabels = fields.map(field => ({
      ...field,
      // Use name as label if label doesn't exist (for backward compatibility)
      label: field.label || field.name,
      // Ensure options have name and value
      options: field.options?.map(opt => ({
        ...opt,
        // Use name as label if it doesn't exist (for backward compatibility)
        label: opt.label || opt.name || opt.value
      }))
    }));

    const db = await connectDB();
    const form = new Form({
      title,
      fields: fieldsWithLabels,
      state: isEvent ? 'open' : 'closed',
      isEvent: Boolean(isEvent),
      eventId: isEvent && eventId ? eventId : null
    });

    const newForm = await form.save();

    return new Response(JSON.stringify({ 
      _id: newForm._id,
      title: newForm.title,
      fields: newForm.fields,
      state: newForm.state,
      createdAt: newForm.createdAt
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating form:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create form', details: error.message }), 
      { status: 500 }
    );
  }
}

export async function GET() {
    const db = await connectDB();
    const forms = await Form.find();
    return new Response(JSON.stringify(forms), { status: 200 });
}
