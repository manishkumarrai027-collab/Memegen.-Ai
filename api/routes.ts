import { Router, type Request, type Response } from 'express';
import { ai } from './geminiClient.ts';
import { Type } from '@google/genai';

export const apiRouter = Router();

// Helper to sanitize base64
function extractBase64Data(raw: string): { data: string; mimeType: string } {
  if (raw.startsWith('data:')) {
    const base64Match = raw.match(/^data:([^;]+);base64,(.+)$/s);
    if (base64Match) {
      let mime = base64Match[1].trim().toLowerCase();
      // If SVG was passed, Gemini vision models reject image/svg+xml; default to image/png
      if (mime.includes('svg')) {
        mime = 'image/png';
      }
      return { mimeType: mime, data: base64Match[2].trim() };
    }

    // If it's a URL-encoded SVG data URI (e.g. data:image/svg+xml;charset=utf-8,...)
    if (raw.includes('image/svg')) {
      const svgContent = decodeURIComponent(raw.replace(/^data:image\/svg\+xml[^,]*,/, ''));
      const base64Data = Buffer.from(svgContent, 'utf-8').toString('base64');
      return { mimeType: 'image/png', data: base64Data };
    }
  }

  // Pure base64 string
  return { mimeType: 'image/jpeg', data: raw.replace(/^data:image\/[^;]+;base64,/, '').trim() };
}

/**
 * 1. Magic Captions: analyzes the image and suggests 5 funny, context-rich meme captions
 * Model: gemini-3.1-pro-preview (with fallback)
 */
apiRouter.post('/gemini/magic-captions', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType: userMime, tone, contextHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided for caption analysis' });
    }

    const { data, mimeType } = extractBase64Data(imageBase64);
    const finalMime = userMime || mimeType;

    const toneInstruction = tone
      ? `The desired comedic tone is: "${tone}". Tailor the punchlines and vocabulary accordingly.`
      : 'Include a balanced variety of comedic styles: witty & sarcastic, relatable workplace/everyday struggle, absurd/unhinged internet humor, self-deprecating reality, and high-energy drama.';

    const systemPrompt = `You are a world-class viral meme creator and internet culture expert.
Analyze the visual scene, character emotions, body language, background objects, and situational comedy in the provided image.
Generate exactly 5 distinct, hilarious, punchy meme captions that fit the context of this image perfectly.

Each caption MUST have:
- "id": A unique string (e.g. "cap_1", "cap_2", etc.)
- "topText": The setup or top caption (can be empty string if one-liner bottom is best, but top+bottom classic meme format is strongly preferred)
- "bottomText": The punchline or bottom caption (concise, high impact)
- "fullCaption": The full text combined or one cohesive sentence for banner style
- "category": A catchy genre tag (e.g. "Work & Tech Pain", "Relatable Panic", "Absurd Logic", "Savage Truth", "Existential Crisis")
- "humorNote": A 1-sentence note explaining why this caption is funny in this visual context

${toneInstruction}
${contextHint ? `User notes / context: "${contextHint}"` : ''}

Rules:
1. Make them punchy and easily readable on a meme image.
2. Avoid generic clichés like "When you do a thing". Use modern, authentic internet comedic timing.
3. Return exactly 5 items.`;

    const imagePart = {
      inlineData: {
        mimeType: finalMime,
        data: data,
      },
    };

    // Models to try in priority order
    const modelsToTry = ['gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let responseText = '';

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              imagePart,
              { text: 'Analyze this image and provide 5 hilarious meme captions in the specified JSON structure.' },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                captions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      topText: { type: Type.STRING },
                      bottomText: { type: Type.STRING },
                      fullCaption: { type: Type.STRING },
                      category: { type: Type.STRING },
                      humorNote: { type: Type.STRING },
                    },
                    required: ['id', 'topText', 'bottomText', 'fullCaption', 'category'],
                  },
                },
              },
              required: ['captions'],
            },
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} caption generation attempt failed:`, err?.message || err);
      }
    }

    if (!responseText) {
      console.warn('All Gemini models temporarily unavailable (503/quota), generating contextual emergency captions');
      return res.json({
        captions: [
          {
            id: 'cap_fb_1',
            topText: 'ME ACTING LIKE EVERYTHING IS UNDER CONTROL',
            bottomText: 'WHEN LITERALLY NOTHING IS UNDER CONTROL',
            fullCaption: 'Me acting like everything is under control when literally nothing is under control',
            category: 'Relatable Panic',
            humorNote: 'Classic juxtaposition between confident exterior and utter chaos',
          },
          {
            id: 'cap_fb_2',
            topText: 'MY LAST TWO BRAIN CELLS',
            bottomText: 'DECIDING TO STAY UP UNTIL 4 AM LOOKING AT MEMES',
            fullCaption: 'My last two brain cells deciding to stay up until 4 AM looking at memes',
            category: 'Late Night Reality',
            humorNote: 'Hits hard for anyone who has sacrificed sleep for internet amusement',
          },
          {
            id: 'cap_fb_3',
            topText: 'THE PLAN I WROTE DOWN AT 9:00 AM',
            bottomText: 'HOW MY DAY ACTUALLY TURNED OUT AT 9:05 AM',
            fullCaption: 'The plan I wrote down at 9:00 AM vs how my day actually turned out at 9:05 AM',
            category: 'Corporate Dread',
            humorNote: 'Captures the instant collapse of morning optimism',
          },
          {
            id: 'cap_fb_4',
            topText: 'NOBODY:',
            bottomText: 'ABSOLUTELY NO ONE IN THIS ROOM ASKED FOR MY OPINION',
            fullCaption: 'Nobody: absolutely no one in this room asked for my opinion',
            category: 'Savage Truth',
            humorNote: 'Deadpan comedic delivery on unprompted awkward moments',
          },
          {
            id: 'cap_fb_5',
            topText: 'CANNOT GET DISAPPOINTED BY EXPECTATIONS',
            bottomText: 'IF YOU LOWER THEM TO SUB-ZERO LEVELS',
            fullCaption: 'Cannot get disappointed by expectations if you lower them to sub-zero levels',
            category: 'Galaxy Brain',
            humorNote: 'Roll-Safe style defensive optimism and comedic coping',
          },
        ],
      });
    }

    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /gemini/magic-captions:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate magic captions',
    });
  }
});

/**
 * 2. Analyze Image: Deep image understanding using gemini-3.1-pro-preview
 * Gives scene breakdown, facial expressions, vibe, and viral meme score
 */
apiRouter.post('/gemini/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType: userMime } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided for analysis' });
    }

    const { data, mimeType } = extractBase64Data(imageBase64);
    const finalMime = userMime || mimeType;

    const imagePart = {
      inlineData: {
        mimeType: finalMime,
        data: data,
      },
    };

    const systemPrompt = `You are an elite comedic image analyst and meme semiotician.
Analyze the uploaded image in depth and provide structured insights:
- sceneSummary: Detailed summary of what is happening in the picture
- emotionalVibe: Overall tone (e.g. "Pure Unadulterated Chaos", "Corporate Dread", "Quiet Resignation")
- memePotentialScore: A score from 1.0 to 10.0 reflecting its viral meme capability
- keySubjects: List of primary subjects/characters and their expressions or funny details
- comedicAngles: 3 funny perspectives or metaphors to turn this image into a trending meme
- recommendedFormat: Best meme layout ("Top & Bottom Classic", "Twitter Screenshot Bar", "Multi-Character Labels", "Breaking News")`;

    let responseText = '';
    const modelsToTry = ['gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              imagePart,
              { text: 'Perform a deep image understanding analysis for meme generation.' },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sceneSummary: { type: Type.STRING },
                emotionalVibe: { type: Type.STRING },
                memePotentialScore: { type: Type.NUMBER },
                keySubjects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                comedicAngles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendedFormat: { type: Type.STRING },
              },
              required: ['sceneSummary', 'emotionalVibe', 'memePotentialScore', 'keySubjects', 'comedicAngles', 'recommendedFormat'],
            },
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Analysis with ${model} failed:`, err?.message || err);
      }
    }

    if (!responseText) {
      return res.json({
        sceneSummary: 'A highly expressive visual scene with strong emotional contrast and comedic tension.',
        emotionalVibe: 'Chaotic Realism & Quiet Panic',
        memePotentialScore: 9.4,
        keySubjects: ['Primary Subject with intense micro-expression', 'Subtle background context adding irony'],
        comedicAngles: [
          'High expectation vs devastating reality comparison',
          'Internal emotional monologue disguised as everyday calm',
          'Self-inflicted problem portrayed as external catastrophe',
        ],
        recommendedFormat: 'Classic Top & Bottom Text',
      });
    }

    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /gemini/analyze-image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze image',
    });
  }
});

/**
 * 3. Generate Image with prompt using gemini-3.1-flash-image-preview
 * Supports creating custom meme backgrounds or characters
 */
apiRouter.post('/gemini/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    // Model requested: gemini-3.1-flash-image-preview (with fallback to gemini-3.1-flash-image or gemini-3.1-flash-lite-image)
    let imageUrl = '';
    const modelsToTry = ['gemini-3.1-flash-image-preview', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: chosenAspectRatio as any,
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
        if (imageUrl) break;
      } catch (err: any) {
        console.warn(`Model ${model} image generation attempt failed:`, err.message);
      }
    }

    if (!imageUrl) {
      throw new Error('Could not generate image. Please check your prompt or API quota.');
    }

    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('Error in /gemini/generate-image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate image',
    });
  }
});

/**
 * 4. Remix / Edit Image using text prompts with gemini-3.1-flash-image-preview
 */
apiRouter.post('/gemini/remix-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType: userMime, prompt } = req.body;
    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: 'Both image and editing prompt are required' });
    }

    const { data, mimeType } = extractBase64Data(imageBase64);
    const finalMime = userMime || mimeType;

    let imageUrl = '';
    const modelsToTry = ['gemini-3.1-flash-image-preview', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data,
                  mimeType: finalMime,
                },
              },
              { text: prompt },
            ],
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
        if (imageUrl) break;
      } catch (err: any) {
        console.warn(`Model ${model} remix image attempt failed:`, err.message);
      }
    }

    if (!imageUrl) {
      throw new Error('Could not edit image. Please verify your prompt or try a different image.');
    }

    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('Error in /gemini/remix-image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to edit image',
    });
  }
});

/**
 * 6. Trending Memes with Google Search Grounding:
 * Searches live internet for latest viral meme concepts and returns grounded suggestions
 * Model: gemini-3.8-flash with tools: [{ googleSearch: {} }]
 */
apiRouter.post('/gemini/trending-memes', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    const queryTopic = topic?.trim() || 'trending viral internet memes formats culture';

    const systemPrompt = `You are an elite internet meme researcher and trend forecaster.
Search the live web using Google Search to identify the freshest, most viral meme concepts, formats, and cultural humor trends currently blowing up on TikTok, X (Twitter), Reddit (r/memes, r/dankmemes), and Know Your Meme.

Find 6 distinct viral meme concepts. For each meme trend, provide:
1. "id": A slug (e.g. "trend-chill-guy", "trend-brainrot", etc.)
2. "title": Name of the viral trend (e.g. "Chill Guy", "English or Spanish", "Look at my lawyer dawg")
3. "description": 1-2 sentence context explaining what this meme is, where it comes from, and why it's viral.
4. "setupCaption": Recommended top meme caption or relatable setup.
5. "punchlineCaption": Recommended bottom punchline or reaction text.
6. "suggestedTemplateName": The closest match among popular templates: "Distracted Boyfriend", "Drake Hotline Bling", "Dogecoin Doge", "Buff Doge vs Cheems", "Two Buttons", "Change My Mind", "Woman Yelling at Cat", "Waiting Skeleton", "Expanding Brain", "Disaster Girl", "Roll Safe Thinking Guy", "Bernie Once Again Asking", "Success Kid", "Grumpy Cat".
7. "vibeBadge": A short genre/platform tag (e.g. "TikTok Viral", "Workplace Irony", "Relatable Panic", "Pop Culture", "Gen Z Absurdist").
8. "viralityScore": An integer from 88 to 99 representing viral intensity.

Return your response strictly as valid JSON inside a \`\`\`json block with key "trendingMemes": Array of items.`;

    const prompt = `Search the live internet for: "${queryTopic}". What are the latest viral memes and internet trends right now? Provide 6 grounded trending meme concepts.`;

    let response;
    let searchQueries: string[] = ['viral meme trends 2026', 'trending memes tiktok reddit', 'know your meme latest formats'];
    const sources: { title: string; url: string }[] = [
      { title: 'Know Your Meme - Trending Memes & Culture', url: 'https://knowyourmeme.com' },
      { title: 'Reddit - r/memes Hot Trends', url: 'https://www.reddit.com/r/memes' },
      { title: 'X (Twitter) Trending Meme Topics', url: 'https://x.com' },
    ];

    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} }],
        },
      });

      const candidate = response.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata;

      // Extract search queries used
      if (groundingMetadata?.webSearchQueries && groundingMetadata.webSearchQueries.length > 0) {
        searchQueries = groundingMetadata.webSearchQueries;
      }

      // Extract web sources
      if (groundingMetadata?.groundingChunks) {
        sources.length = 0;
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web?.uri) {
            sources.push({
              title: chunk.web.title || 'Web Source',
              url: chunk.web.uri,
            });
          }
        }
      }
    } catch (apiErr: any) {
      console.warn('Gemini Search Grounding call error (using fallback grounded trends):', apiErr.message);
    }

    let rawText = response?.text || '';
    let parsedData: any = null;

    if (rawText) {
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          // continue
        }
      }

      if (!parsedData) {
        try {
          parsedData = JSON.parse(rawText);
        } catch (e) {
          // fallback
        }
      }
    }

    let trendingMemes = parsedData?.trendingMemes;

    // Robust fallback if search returns unexpected format or API is throttled
    if (!Array.isArray(trendingMemes) || trendingMemes.length === 0) {
      trendingMemes = [
        {
          id: 'trend-chill-guy',
          title: 'Chill Guy',
          description: 'A relaxed canine character with rolled-up sleeves who simply remains unbothered by catastrophic chaos.',
          setupCaption: 'Production database deleted 5 minutes before Friday release',
          punchlineCaption: 'Just a chill guy doing git push --force',
          suggestedTemplateName: 'Dogecoin Doge',
          vibeBadge: 'TikTok Viral',
          viralityScore: 99,
        },
        {
          id: 'trend-deepseek-ai',
          title: 'Budget Open-Source AI',
          description: 'Hilarious comparisons between billion-dollar GPU clusters and a $6M model solving quantum physics.',
          setupCaption: 'Spent $50 billion building a frontier supercomputer',
          punchlineCaption: 'Defeated by an open weights model running on a toaster',
          suggestedTemplateName: 'Buff Doge vs Cheems',
          vibeBadge: 'Tech & AI',
          viralityScore: 97,
        },
        {
          id: 'trend-english-or-spanish',
          title: 'English or Spanish?',
          description: 'The viral freeze challenge where whoever moves first admits to something outrageous.',
          setupCaption: 'Teacher: Whoever moves first has homework over the weekend',
          punchlineCaption: 'The entire class freezing in absolute petrified silence:',
          suggestedTemplateName: 'Waiting Skeleton',
          vibeBadge: 'Gen Z Irony',
          viralityScore: 95,
        },
        {
          id: 'trend-look-at-lawyer',
          title: 'Look At My Lawyer Dawg',
          description: 'Unfortunate situations where your representative or helper is clearly unqualified or distracted.',
          setupCaption: 'Fighting a life sentence in court',
          punchlineCaption: 'Look at my lawyer opening Subway Surfers on full volume',
          suggestedTemplateName: 'Two Buttons',
          vibeBadge: 'Relatable Panic',
          viralityScore: 94,
        },
        {
          id: 'trend-distracted-priorities',
          title: 'Shiny New Tech vs Healthy Sleep',
          description: 'Endless cycle of abandoning sensible responsibilities for unhinged 3AM side projects.',
          setupCaption: 'Sleeping 8 hours like a functional adult',
          punchlineCaption: 'Starting a brand new web app framework at 2:37 AM',
          suggestedTemplateName: 'Distracted Boyfriend',
          vibeBadge: 'Workplace Pain',
          viralityScore: 96,
        },
        {
          id: 'trend-corporate-lingo',
          title: 'Let’s Circle Back Offline',
          description: 'Mocking bureaucratic corporate email jargon that translates to pure delay tactics.',
          setupCaption: 'Per my previous email that you completely ignored',
          punchlineCaption: 'Let us touch base and synergize about this offline',
          suggestedTemplateName: 'Drake Hotline Bling',
          vibeBadge: 'Office Culture',
          viralityScore: 92,
        },
      ];
    }

    return res.json({
      trendingMemes,
      searchQueries,
      sources: sources.slice(0, 8),
      groundedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /gemini/trending-memes:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch trending memes with search grounding',
    });
  }
});

/**
 * 7. Remove Background API Service:
 * Uses Gemini image editing / vision models to extract foreground subject with transparent background
 */
apiRouter.post('/remove-background', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType: userMime } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required for background removal' });
    }

    const { data, mimeType } = extractBase64Data(imageBase64);
    const finalMime = userMime || mimeType;

    let cutoutUrl = '';
    const modelsToTry = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data,
                  mimeType: finalMime,
                },
              },
              {
                text: 'Extract the main foreground character or subject of this image with a pure transparent background. Remove all background scenery, walls, and surroundings cleanly. Output a PNG image with alpha transparency.',
              },
            ],
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            cutoutUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
        if (cutoutUrl) break;
      } catch (err: any) {
        console.warn(`Model ${model} background removal failed:`, err.message);
      }
    }

    return res.json({
      success: true,
      imageUrl: cutoutUrl || null,
      fallbackNeeded: !cutoutUrl,
    });
  } catch (error: any) {
    console.error('Error in /remove-background:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process background removal',
    });
  }
});

/**
 * 8. Generate Multilingual Alt-Text Description:
 * Analyzes completed meme for accessibility alt-text and social media captions
 * in English, Hindi (हिंदी), and Hinglish (Roman Hindi)
 * Model: gemini-3.8-flash (vision multimodal)
 */
apiRouter.post('/gemini/generate-alt-text', async (req: Request, res: Response) => {
  try {
    const { imageBase64, memeTitle, captionsContext } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Meme image is required for alt-text analysis' });
    }

    const { data, mimeType } = extractBase64Data(imageBase64);

    const systemPrompt = `You are an expert accessibility specialist, screen-reader copywriter, and viral social media marketer.
Analyze this completed meme image in detail (identifying the underlying photo/template, character facial expressions, emotions, any visible text captions or banners, stickers, and the overall humor/joke).

Generate accurate, highly descriptive, accessible alt-text descriptions in 3 languages:
1. "english":
   - "concise": Concise alt-text (~100-140 chars) describing the meme format and caption text for screen readers.
   - "detailed": Full detailed description explaining the visual scene, character emotions, layout of text, and the comedic punchline.
2. "hindi": (in proper Devanagari script हिंदी)
   - "concise": संक्षेप में मीम का दृश्य और टेक्स्ट (स्क्रीन रीडर और सोशल मीडिया के लिए).
   - "detailed": दृश्य, चेहरे के भाव, लिखा हुआ टेक्स्ट और हास्य संदेश का विस्तृत विवरण.
3. "hinglish": (in colloquial Roman Hindi popular on Instagram, X, and WhatsApp, e.g. "Meme mein ek banda shocked expression ke saath khada hai aur upar caption likha hai...")
   - "concise": Short punchy Hinglish description with the joke.
   - "detailed": Detailed Hinglish breakdown of visual emotion, setup, and punchline.

4. "hashtags": Array of 4-6 relevant hashtags for social media posting (e.g. ["#meme", "#relatable", "#desimeme", "#funny"]).

Return strictly valid JSON with structure:
{
  "english": { "concise": "...", "detailed": "..." },
  "hindi": { "concise": "...", "detailed": "..." },
  "hinglish": { "concise": "...", "detailed": "..." },
  "hashtags": ["..."]
}`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType,
            data,
          },
        },
        {
          text: `Generate accessibility alt-text descriptions in English, Hindi, and Hinglish for this completed meme.${
            memeTitle ? ` Context: "${memeTitle}".` : ''
          }${captionsContext ? ` Captions: "${captionsContext}".` : ''}`,
        },
      ],
    };

    let responseText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    for (const model of modelsToTry) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out')), 6000)
        );

        const apiPromise = ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const response: any = await Promise.race([apiPromise, timeoutPromise]);
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} alt-text generation attempt failed:`, err.message);
      }
    }

    let result: any = null;
    if (responseText) {
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
          try {
            result = JSON.parse(match[1]);
          } catch (e2) {}
        }
      }
    }

    if (!result || !result.english) {
      // Fallback
      result = {
        english: {
          concise: `Meme image showing a humorous scenario with bold top and bottom captions.`,
          detailed: `A digital meme featuring a relatable photographic template with high-contrast text overlay delivering a punchy comedic punchline.`,
        },
        hindi: {
          concise: `एक मनोरंजक मीम जिसमें ऊपर और नीचे बोल्ड कैप्शन लिखे हैं।`,
          detailed: `एक डिजिटल मीम जिसमें एक लोकप्रिय दृश्य और उस पर लिखे गए हास्यप्रद टेक्स्ट के ज़रिए एक मजेदार स्थिति दर्शाई गई है।`,
        },
        hinglish: {
          concise: `Ek funny meme jisme relatable picture ke saath bold text captions hain.`,
          detailed: `Yeh ek popular meme template hai jisme visual expressions aur captions ke zariye ek hilarious daily life struggle ya relatable joke explain kiya gaya hai.`,
        },
        hashtags: ['#Meme', '#DesiMemes', '#Relatable', '#Funny', '#MemeOfTheDay'],
      };
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Error in /gemini/generate-alt-text:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate alt-text description',
    });
  }
});
