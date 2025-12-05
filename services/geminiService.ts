import { GoogleGenAI, Type, Content } from "@google/genai";
import { Profile, AnalysisResult, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for profile generation
const PROFILE_SYSTEM_INSTRUCTION = `
You are a satirical generator for "LooksMaxxing" dating profiles. 
Use terminology like "mogging", "mewing", "hunter eyes", "canthal tilt", "it's over", "we're so back", "looksmaxx", "chad", "stacy", "fwhr", "midface ratio".
Create exaggerated, humorous characters who are obsessed with their facial structure and stats.
`;

const LOCAL_IMAGES = [
  "1739520543232.png", "1739520759673.png", "1739520892533.png", 
  "1739520951850.png", "1739521031759.png", "1739521119766.png", 
  "1739521173529.png", "1739521191967.png", "1739521250332.png", 
  "1739521263987.png", "1739521289159.png", "1739521350398.png", 
  "1739521388295.png", "1739521431018.png", "1739521535114.png", 
  "1739521631623.png", "46333.jpg", "58113.jpg", "70554.jpg", 
  "71819.jpg", "81310.jpg", "82039.jpg", "IMG_5360.jpeg", 
  "images (10).jpeg", "images (11).jpeg", "images (12).jpeg", 
  "images (9).jpeg", "looksmax-mewing (1).png", "looksmax-mewing.png"
];

const getRandomLocalImage = () => {
    const imageName = LOCAL_IMAGES[Math.floor(Math.random() * LOCAL_IMAGES.length)];
    return `/images/${imageName}`;
};

const FALLBACK_PROFILES = [
  {
    name: "Giga Chad",
    age: 25,
    tagline: "I don't speak to people with negative canthal tilt.",
    bio: "Strictly mewing 24/7. If you breathe through your mouth, swipe left. Measuring my gonial angle daily.",
    stats: { jawline: 10, canthalTilt: "Positive", mewingStreak: 5000, height: "6'8"" },
  },
  {
    name: "Jordan B.",
    age: 23,
    tagline: "Just woke up like this.",
    bio: "Hunter eyes are a lifestyle, not a choice. My bone structure pays my rent.",
    stats: { jawline: 9.8, canthalTilt: "Positive", mewingStreak: 1200, height: "6'2"" },
  },
  {
    name: "Mewing Master",
    age: 19,
    tagline: "Tongue posture > bad posture.",
    bio: "I haven't spoken in 3 years to maintain suction hold. Text me only.",
    stats: { jawline: 8.5, canthalTilt: "Neutral", mewingStreak: 900, height: "6'0"" },
  },
  {
    name: "Chico L.",
    age: 22,
    tagline: "Mogging the entire industry.",
    bio: "It's all about the pheno. You either have it or you don't.",
    stats: { jawline: 9.5, canthalTilt: "Positive", mewingStreak: 2000, height: "6'3"" },
  }
];

// Helper to safely handle API errors without cluttering console for expected 429s
const logError = (context: string, error: any) => {
    const msg = error?.message || '';
    if (msg.includes('429') || msg.includes('quota') || error?.status === 429 || error?.code === 429) {
        console.warn(`${context}: Quota exceeded (using fallback).`);
    } else {
        console.error(`${context}:`, error);
    }
};

const getFallbackProfile = async (): Promise<Profile> => {
    const fallback = FALLBACK_PROFILES[Math.floor(Math.random() * FALLBACK_PROFILES.length)];
    const randomId = crypto.randomUUID();

    // Simulate network latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      id: randomId,
      name: fallback.name,
      age: fallback.age,
      tagline: fallback.tagline,
      bio: fallback.bio,
      stats: fallback.stats,
      imageUrl: getRandomLocalImage()
    };
};

export const generateLooksMaxxProfile = async (): Promise<Profile> => {
  let profileData;

  try {
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a funny, satirical LooksMaxx dating profile for a male or female character.",
      config: {
        systemInstruction: PROFILE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            age: { type: Type.INTEGER },
            tagline: { type: Type.STRING },
            bio: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                jawline: { type: Type.NUMBER },
                canthalTilt: { type: Type.STRING },
                mewingStreak: { type: Type.INTEGER },
                height: { type: Type.STRING },
              },
              required: ["jawline", "canthalTilt", "mewingStreak", "height"]
            },
            imagePrompt: { type: Type.STRING }
          },
          required: ["name", "age", "tagline", "bio", "stats", "imagePrompt"]
        }
      }
    });

    profileData = JSON.parse(textResponse.text || "{}");
  } catch (error) {
    logError("Profile Text Gen", error);
    return getFallbackProfile();
  }

  let imageUrl = getRandomLocalImage();

  try {
      const imageResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image', 
          contents: {
              parts: [{ text: `Hyper-realistic meme style, gigachad aesthetic, extremely defined features, ${profileData.imagePrompt}` }]
          },
          config: {
              imageConfig: {
                  aspectRatio: "3:4"
              }
          }
      });
      
      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
          }
      }
  } catch (error) {
      logError("Profile Image Gen", error);
      // Swallow error, continue with local image
  }

  return {
    id: crypto.randomUUID(),
    name: profileData.name,
    age: profileData.age,
    tagline: profileData.tagline,
    bio: profileData.bio,
    stats: profileData.stats,
    imageUrl: imageUrl
  };
};

export const analyzeUserPhoto = async (base64Image: string): Promise<AnalysisResult> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: "Analyze this face using the Looksmaxxing Forum scale (1-10). 1-3: It's Over, 4: Below Avg, 5: Normie, 6: High Tier Normie, 7: Chadlite, 8: Chad, 9: Gigachad, 10: God. Be brutally honest but funny. Provide specific scores (0-100) for Jawline, Eyes (Canthal Tilt), Skin, Symmetry." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "Scale 1-10 (integer)" },
                        title: { type: Type.STRING, description: "e.g. 'High Tier Normie' or 'Chadlite'" },
                        analysis: { type: Type.STRING },
                        improvements: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        breakdown: {
                            type: Type.OBJECT,
                            properties: {
                                jawline: { type: Type.NUMBER },
                                eyes: { type: Type.NUMBER },
                                skin: { type: Type.NUMBER },
                                symmetry: { type: Type.NUMBER },
                                phenotype: { type: Type.STRING }
                            },
                            required: ["jawline", "eyes", "skin", "symmetry", "phenotype"]
                        }
                    },
                    required: ["score", "title", "analysis", "improvements", "breakdown"]
                }
            }
        });

        return JSON.parse(response.text || "{}");
    } catch (e) {
        logError("Analysis", e);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
            score: 1,
            title: "Quota Exceeded (It's Over)",
            analysis: "The AI server is currently mogged by high traffic. Try again in a moment.",
            improvements: ["Wait for API cooldown", "Mew while you wait"],
            breakdown: {
                jawline: 0,
                eyes: 0,
                skin: 0,
                symmetry: 0,
                phenotype: "404 Face Not Found"
            }
        };
    }
}

export const generateChatReply = async (profile: Profile, history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const historyContent: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Roleplay as ${profile.name}. Obsessed with looksmaxxing/mewing. Be funny, slightly toxic, use slang (mogged, it's over). Keep it short.`,
      },
      history: historyContent
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "...";
  } catch (error) {
    logError("Chat", error);
    await new Promise(resolve => setTimeout(resolve, 500));
    return "Can't talk, mewing hard right now (Server Busy).";
  }
};
