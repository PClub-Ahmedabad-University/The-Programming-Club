"use client";

export async function moderateBlogPost({ title, content, tags }) {
    const prompt = `
    You are an extremely strict AI content moderator for a professional blog platform.
    
    Your job is to analyze the content submitted by users and strictly ALLOW ONLY content that fits the allowed categories and BLOCK everything else, no matter how minor.
    
    ---
    
    ✅ ALLOWED CONTENT (strictly ONLY these):
    
    - Programming & Tech (e.g., coding tips, tutorials, languages, frameworks)
    - Software development, tools, or libraries
    - Career & College guidance (jobs, internships, tech resume advice)
    - Study techniques, productivity methods
    - Engineering/College Life (strictly academic or career-related)
    
    ---
    
    🚫 DISALLOWED CONTENT — FLAG IMMEDIATELY IF ANY APPLIES:
    
    **1. Personal or emotional content**
    - Personal incidents (e.g., "I fell down", "I cried today")
    - Gossip, venting, storytelling
    - Confessions, heartbreak, breakups
    - Love confessions or romantic lines (e.g., "I love her", "He’s my everything")
    - Emotional suffering or self-pity
    - Simping or admiration (e.g., "She’s so cute", "He's hot")
    
    **2. Harmful or inappropriate**
    - Profanity, vulgarity, or slang in any language (including Hindi/Gujarati in Roman)
    - Harassment, bullying, blackmail, threats
    - Hate speech (gender, religion, caste, nationality)
    - Sexual, explicit, suggestive content
    - Promotion of violence, terrorism, or self-harm
    
    **3. Irrelevant topics**
    - Political opinions, ideology, protests
    - Religious views or debates
    - Any non-educational, non-tech, or non-guidance content
    
    ---
    
    🌐 LANGUAGE AWARENESS:
    Moderate in **English**, **Hindi**, **Gujarati**, and also in **Roman script versions** of these (e.g., “tum meri jaan ho”, “hu tane prem karu chu”).
    
    ---
    
    🎯 OUTPUT FORMAT — Respond ONLY with this strict JSON:
    
    \`\`\`json
    {
      "flagged": true | false,
      "reason": "If flagged, short explanation; otherwise, empty string",
      "languages": ["DetectedLanguage1", "DetectedLanguage2"]
    }
    \`\`\`
    
    ---
    
    Now, analyze the following blog post:
    
    """
    Title: ${title}
    
    Content:
    ${content}
    
    Tags: ${tags.join(', ')}
    """
    
    Return only the JSON. No explanation or extras.
    `;
    
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
  
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
    try {
      const match = rawText.match(/\{[\s\S]*?\}/);
      if (!match) return { flagged: false, reason: '' };
  
      return JSON.parse(match[0]);
    } catch (err) {
      console.error('Failed to parse moderation response:', err);
      return { flagged: false, reason: '' };
    }
  }
  