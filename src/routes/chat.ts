import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const router = Router();

let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("[Chat] Gemini API Client initialized successfully.");
  } else {
    console.warn("[Chat] GEMINI_API_KEY is not configured. Running chat in echo/simulated mode.");
  }
} catch (err) {
  console.error("[Chat] Failed to initialize Gemini client:", err);
}

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, error: "Messages array is required." });
  }

  const systemInstruction = 
    `You are Sajad, the warm, hospitable, and slow-living host of Haven Retreat in Kashmir. ` +
    `Your speech is soothing, wise, deeply respectful, and poetic. You treat every guest as a long-lost family member. ` +
    `Encourage guests to leave their fast schedules behind and sit by our stone-built cedar wood hearth. ` +
    `Inform guests about our rooms: ` +
    `1. The Hearth Suite (Velvet Shadows & Open Flames, features hand-carved Khatamband ceilings and a grand stone fireplace, ₹24,500/night)\n` +
    `2. The Valley View Cabin (Where the Horizon Meets the Hearth, features panoramic windows, private heated wooden deck, ₹28,000/night).\n` +
    `Explain our experiences: Twilight on the Lake (wooden Shikara sunset ride on Dal Lake), The Morning Kahwa Circle (brewed saffron copper samovar tea), and the Artisan Path (weaving and woodcraft old-town masterclass).\n` +
    `Speak with a peaceful, warm, letter-like tone. Suggest hot saffron Kahwa tea or wearing a warm wool Pheran cloak. ` +
    `If you can help with booking dates, encourage them to lock in their sanctuary using our Check Availability panel at any time. ` +
    `Answer with a friendly, personal Kashmiri perspective. Keep replies descriptive but intimate and atmospheric.`;

  const formattedContents = messages.map((msg: any) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }]
  }));

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.85,
        }
      });

      const replyText = response.text || "I am sitting by the cedar fire, pouring tea. Let me know when you are ready to come home.";
      return res.json({ success: true, text: replyText });
    } else {
      const lastMessage = messages[messages.length - 1]?.text?.toLowerCase() || "";
      let simulatedReply = "";

      if (lastMessage.includes("room") || lastMessage.includes("suite") || lastMessage.includes("cabin") || lastMessage.includes("stay")) {
        simulatedReply = "Ah, you are asking about our rooms, my friend. The Hearth Suite is bathed in velvet shadows and features a beautiful stone fireplace where we keep cedar logs burning late. The Valley View Cabin has vast windows so you can look at the snowy peak from a warm blanket. Tell me, which of these feels like your sanctuary?";
      } else if (lastMessage.includes("experience") || lastMessage.includes("shikara") || lastMessage.includes("kahwa")) {
        simulatedReply = "We would love to share Srinagar through our eyes. We will drift on Dal Lake in a wooden Shikara as the sky turns neon rose and indigo, and share freshly brewed saffron Kahwa. It is the perfect cure for a noisy mind. Have you ever tasted traditional saffron tea?";
      } else {
        simulatedReply = "As-salamu alaykum, my dear friend. Welcome to Haven. I have just stoked the hearth fire, and Farida is brewing a fresh copper samovar of spice-infused Kahwa. Sit with us, wrap a wool blanket, and tell us: what brings you to our quiet mountains?";
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json({ success: true, text: simulatedReply, simulated: true });
    }
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ success: false, error: err.message || "Something went wrong stoking the hearth fire." });
  }
});

export default router;
