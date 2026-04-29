
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Difficulty, Problem, YouTubeVideo } from '../types';

// ============================================================================
// SECURITY & CONFIGURATION
// ============================================================================

/** Singleton GoogleGenAI instance */
let ai: GoogleGenAI | null = null;

/** Rate limiter: tracks requests per minute to prevent API abuse */
const rateLimiter = {
  requests: [] as number[],
  maxPerMinute: 15, // Conservative limit for paid tier
  
  canMakeRequest(): boolean {
    const now = Date.now();
    // Clean old entries (older than 1 minute)
    this.requests = this.requests.filter(t => now - t < 60_000);
    return this.requests.length < this.maxPerMinute;
  },
  
  recordRequest(): void {
    this.requests.push(Date.now());
  }
};

/**
 * Checks rate limit and throws if exceeded.
 */
function checkRateLimit(): void {
  if (!rateLimiter.canMakeRequest()) {
    throw new Error("Has alcanzado el límite de solicitudes. Por favor, espera un momento antes de intentar de nuevo.");
  }
  rateLimiter.recordRequest();
}

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 */
function getAi(): GoogleGenAI {
  if (!ai) {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || 
                   (process.env as any)?.VITE_GEMINI_API_KEY ||
                   process.env.API_KEY || 
                   process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.error("API_KEY is missing. Checked VITE_GEMINI_API_KEY, process.env.API_KEY, process.env.GEMINI_API_KEY");
      throw new Error(
        "Configuración Incompleta: No se encontró la API Key de Gemini. " +
        "Asegúrate de que VITE_GEMINI_API_KEY esté configurada en el entorno."
      );
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

/**
 * Extracts a human-readable message from a potential API error object.
 */
function handleApiError(error: any): Error {
  console.error("API Error context:", error);
  
  if (error instanceof Error) return error;
  
  // Handle common API error formats
  if (error?.error?.message) {
    return new Error(error.error.message);
  }
  if (error?.message) {
    return new Error(error.message);
  }
  
  return new Error("Ocurrió un problema de comunicación con la IA. Por favor, intenta más tarde.");
}

// ============================================================================
// MODEL CONFIGURATION — Gemini 2.0 Flash (latest, fastest)
// ============================================================================

/** Primary model for all generation tasks */
const PRIMARY_MODEL = "gemini-2.0-flash";

// ============================================================================
// PROBLEM GENERATION
// ============================================================================

const problemSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A concise, descriptive title for the math problem in SPANISH. Example: 'Optimización de Costos de Servidores'.",
    },
    context: {
        type: Type.STRING,
        description: "The background story or real-world scenario for the problem, in SPANISH. Use Markdown for formatting and LaTeX for equations ($$x^2$$). THIS FIELD CANNOT BE EMPTY.",
    },
    questions: {
        type: Type.ARRAY,
        description: "A list of questions or tasks for the student to solve, in SPANISH. THIS ARRAY CANNOT BE EMPTY.",
        items: { type: Type.STRING }
    },
    answer: {
      type: Type.STRING,
      description: "The final, simplified answer to the last or main part of the problem, in SPANISH.",
    },
  },
  required: ['title', 'context', 'questions', 'answer'],
};

const problemsArraySchema = {
    type: Type.ARRAY,
    items: problemSchema
};

export const generateProblems = async (topic: string, difficulty: Difficulty, count: number): Promise<Problem[]> => {
  checkRateLimit();
  
  // Sanitize inputs
  const safeTopic = topic.replace(/[<>"'&]/g, '').substring(0, 100);
  const safeCount = Math.min(Math.max(1, count), 5);

  const prompt = `
    Generate ${safeCount} math problem(s) in SPANISH about the topic "${safeTopic}" with a "${difficulty}" difficulty.
    The problem MUST be a real-world application scenario. Adhere strictly to the JSON schema provided.
    
    EXAMPLE for a "Derivadas" problem:
    {
      "title": "Costo mínimo de mantenimiento de servidores",
      "context": "Una empresa de software mantiene n servidores. El costo total de mantenimiento mensual (en UM) está dado por la función: C(n) = 50n + \\\\frac{800}{n}",
      "questions": [
        "Determine el número de servidores que minimiza el costo mensual.",
        "Calcule el costo mínimo.",
        "Interprete el resultado desde el punto de vista operativo."
      ],
      "answer": "El costo mínimo es de 400 UM con 4 servidores."
    }

    CRITICAL REQUIREMENTS:
    1. The entire response MUST be in SPANISH.
    2. The 'context' field MUST NOT be empty. It must contain the full problem description.
    3. The 'questions' array MUST NOT be empty. It must contain the full text for each question.
    4. Use Markdown and LaTeX notation for mathematical expressions (e.g., x^2).
    `;

  try {
    const response = await getAi().models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: problemsArraySchema,
      },
    });

    const jsonString = response.text?.trim();
    if (!jsonString) {
      throw new Error("La IA no devolvió una respuesta. Intenta de nuevo.");
    }
    
    const problemData = JSON.parse(jsonString);
    
    const problems: Problem[] = Array.isArray(problemData) 
        ? problemData 
        : (problemData && typeof problemData === 'object' && 'title' in problemData ? [problemData] : []);

    if (problems.length === 0) {
      console.error("Received unexpected data structure from model:", problemData);
      throw new Error("La IA no devolvió un problema válido. Intenta de nuevo.");
    }
    
    // Validate completeness
    for (const p of problems) {
        if (!p.context || p.context.trim() === '' || !p.questions || p.questions.length === 0 || p.questions.some(q => !q || q.trim() === '')) {
            console.error("Validation failed: Model returned an incomplete problem.", p);
            throw new Error("La IA generó un problema incompleto. Por favor, intenta de nuevo.");
        }
    }
    
    return problems;

  } catch (error) {
    console.error("Error generating problem:", error);
    throw error instanceof Error ? error : new Error("No se pudo generar un problema. La IA podría no estar disponible.");
  }
};

// ============================================================================
// SOLUTION GENERATION
// ============================================================================

export const generateSolution = async (problem: Problem): Promise<string> => {
    checkRateLimit();
    
    const problemStatement = `
    Título: ${problem.title}
    Contexto: ${problem.context}
    Preguntas: 
    ${problem.questions.map((q, i) => `${String.fromCharCode(97 + i)}) ${q}`).join('\n')}
  `;
  const prompt = `Eres un profesor de matemáticas experto. Proporciona una solución clara y paso a paso para el siguiente problema matemático. Explica cada paso de forma detallada. Usa Markdown para el formato y LaTeX para las expresiones matemáticas (ej: $$x^2$$ para bloque y $x$ para inline). Todo en ESPAÑOL. Problema: ${problemStatement}`;

  try {
    const response = await getAi().models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt
    });
    
    if (!response.text) {
      throw new Error("La IA no generó una solución. Intenta de nuevo.");
    }
    
    return response.text;
  } catch (error) {
    console.error("Error generating solution:", error);
    throw error instanceof Error ? error : new Error("No se pudo generar la solución.");
  }
};

// ============================================================================
// TOPIC EXPLANATION
// ============================================================================

export const getSimpleExplanation = async (topic: string): Promise<string> => {
    checkRateLimit();
    
    const safeTopic = topic.replace(/[<>"'&]/g, '').substring(0, 100);
    
    const prompt = `Explica el tema de matemáticas "${safeTopic}" como si se lo estuvieras contando a un niño de 8 años. La explicación debe ser muy sencilla y fácil de entender. Enfócate en para qué se usa en la vida real, por qué es importante, y qué tipo de operaciones se usan para llegar a los resultados, explicando el porqué de cada paso. Evita usar símbolos o notación matemática compleja; si es necesario usar alguno, explícalo de manera muy simple. La respuesta debe estar en español y usar formato Markdown.`;
    
    try {
        const response = await getAi().models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
        });
        
        if (!response.text) {
          throw new Error("La IA no generó una explicación. Intenta de nuevo.");
        }
        
        return response.text;
    } catch (error) {
        throw handleApiError(error);
    }
};

// ============================================================================
// HOMEWORK REVIEW (Image Analysis)
// ============================================================================

export const reviewHomework = async (imageData: string, mimeType: string, problemContext: string): Promise<string> => {
    checkRateLimit();
    
    // Validate image data
    if (!imageData || imageData.length === 0) {
      throw new Error("No se recibió la imagen. Por favor, sube una foto válida.");
    }
    
    // Limit image size (approx 10MB in base64)
    if (imageData.length > 14_000_000) {
      throw new Error("La imagen es demasiado grande. Por favor, usa una imagen más pequeña (máx. 10MB).");
    }
    
    const imagePart = {
        inlineData: {
            data: imageData,
            mimeType,
        },
    };
    
    let promptText = `Eres un tutor de matemáticas amable y motivador. Analiza la solución escrita a mano del usuario en la imagen proporcionada.
        1. Identifica el problema y los pasos del usuario a partir de la imagen.
        2. Si la solución es 100% correcta, responde SOLO con la palabra exacta "CORRECT".
        3. Si hay un error, NO des la respuesta final. En su lugar, proporciona una pista de apoyo y positiva señalando el error específico. Por ejemplo: "¡Vas súper bien! Detecté un pequeño detalle en la línea 3. Revisa el signo que usaste cuando despejaste la 'x'. ¡Ya casi lo tienes!"
        4. Tu retroalimentación debe ser en español.`;
        
    if (problemContext) {
        promptText = `Eres un tutor de matemáticas amable y motivador. El usuario está intentando resolver el siguiente problema: "${problemContext}".
        Analiza la solución escrita a mano del usuario en la imagen proporcionada basándote en este contexto.
        1. Identifica los pasos del usuario.
        2. Si la solución es 100% correcta para el problema dado, responde SOLO con la palabra exacta "CORRECT".
        3. Si hay un error, NO des la respuesta final. En su lugar, proporciona una pista de apoyo y positiva señalando el error específico. Por ejemplo: "¡Vas súper bien! Detecté un pequeño detalle en la línea 3. Revisa el signo que usaste cuando despejaste la 'x'. ¡Ya casi lo tienes!"
        4. Tu retroalimentación debe ser en español.`;
    }
    
    const textPart = { text: promptText };

    try {
        const response = await getAi().models.generateContent({
            model: PRIMARY_MODEL,
            contents: { parts: [imagePart, textPart] }
        });
        
        if (!response.text) {
          throw new Error("La IA no pudo analizar la imagen. Intenta de nuevo.");
        }
        
        return response.text;
    } catch (error) {
        if (error instanceof Error && error.message.includes('SAFETY')) {
          throw new Error("La imagen no pudo ser procesada por las políticas de seguridad. Intenta con otra imagen.");
        }
        throw handleApiError(error);
    }
};

// ============================================================================
// TUTOR CHAT (Streaming)
// ============================================================================

export const createTutorChat = (): Chat => {
    return getAi().chats.create({
        model: PRIMARY_MODEL,
        config: {
            systemInstruction: `Eres "ProfeIA", un tutor de matemáticas paciente y servicial de Colombia que usa el método socrático. Tu objetivo es guiar a los estudiantes a encontrar las respuestas por sí mismos, no darles la solución directamente.
            - Nunca des la respuesta directa a un problema.
            - Siempre responde en español.
            - Usa preguntas guía. Por ejemplo, si un estudiante está atascado, pregunta "Ok, ¿cuál crees que sería el primer paso?" o "¿Qué es lo último que intentaste?".
            - Mantén tu personalidad motivadora, amigable, y usa jerga colombiana como "¡qué chévere!", "¡pilas pues!", "¡dale!".
            - Mantén tus respuestas concisas.
            - Usa formato Markdown y LaTeX cuando necesites expresiones matemáticas.`
        },
    });
};

// ============================================================================
// YOUTUBE VIDEO SEARCH
// ============================================================================

/** Fallback video catalog by topic */
function getFallbackVideos(topic: string): YouTubeVideo[] {
    const normalizedTopic = topic.toLowerCase();
    
    const fallbackCatalog: Record<string, YouTubeVideo[]> = {
        'derivadas': [
            { videoId: 'lhKoslz5cGU', title: 'Introducción a las Derivadas - El Profe Alex' },
            { videoId: '5yfh5cf4-0w', title: 'Derivadas: Reglas Básicas - julioprofe' }
        ],
        'límites': [
            { videoId: 'Ej0yAI7OrGA', title: 'Límites: Introducción - El Profe Alex' },
            { videoId: 'q7hpqhJzDKg', title: 'Límites por Sustitución' }
        ],
        'integrales': [
            { videoId: 'bE6hKfL2fOs', title: 'Integrales Indefinidas - El Profe Alex' },
            { videoId: 'vXVPmDgUDEo', title: 'Integración por Sustitución' }
        ],
        'ecuaciones': [
            { videoId: 'Lm7Jxg8yaqc', title: 'Ecuaciones Lineales - El Profe Alex' },
            { videoId: 'wqUZ3v7NjAQ', title: 'Ecuaciones Cuadráticas' }
        ],
        'trigonometría': [
            { videoId: 'xhBUtMRGMQk', title: 'Introducción a Trigonometría' },
            { videoId: 'OJbYnO0D6zg', title: 'Razones Trigonométricas' }
        ],
         'pitágoras': [
            { videoId: '2yfkEAt2ew0', title: 'Teorema de Pitágoras - Super Fácil' },
            { videoId: 'eR24z7iXkwo', title: 'Teorema de Pitágoras - Ejemplos' }
        ],
        'fracciones': [
            { videoId: 'tNxHXYqhXnE', title: 'Suma de Fracciones' },
            { videoId: 'LgMptyzudXU', title: 'Resta de Fracciones' }
        ],
        'algebra': [
            { videoId: 'L5tD72W5e8w', title: 'Introducción al Álgebra' },
            { videoId: 'UNWFLuUfiX4', title: 'Lenguaje Algebraico' }
        ]
    };
    
    // Match exact or partial
    for (const [key, videos] of Object.entries(fallbackCatalog)) {
        if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
            console.log(`Usando videos de respaldo para: ${key}`);
            return videos;
        }
    }
    
    // General fallback
    console.log('Usando videos generales de matemáticas');
    return [
        { videoId: 'lhKoslz5cGU', title: 'Conceptos Matemáticos Fundamentales' },
        { videoId: 'Ej0yAI7OrGA', title: 'Matemáticas Básicas' }
    ];
}

/**
 * Extracts a YouTube video ID from various URL formats.
 */
const extractVideoId = (url: string): string => {
    if (!url) return '';
    
    // Check if it's already a valid 11-character ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }

    return '';
};

/**
 * Searches for YouTube videos using the official YouTube Data API v3 if available.
 * Falls back to Gemini generation, then to hardcoded catalog.
 */
export const searchYoutubeVideos = async (topic: string): Promise<YouTubeVideo[]> => {
    // 1. Try official YouTube API
    const YOUTUBE_API_KEY = (import.meta as any).env?.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;

    if (YOUTUBE_API_KEY) {
        try {
            console.log("Buscando videos con YouTube API v3...");
            const query = encodeURIComponent(`${topic} matemáticas explicación`);
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&q=${query}&type=video&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok && data.items && data.items.length > 0) {
                const videos = data.items.map((item: any) => ({
                    videoId: item.id.videoId,
                    title: item.snippet.title
                }));
                return videos;
            } else {
                console.warn("YouTube API devolvió error o sin resultados:", data);
            }
        } catch (error) {
            console.error("Error conectando con YouTube API:", error);
        }
    } else {
        console.log("YouTube API Key no encontrada, usando Gemini como fallback.");
    }

    // 2. Fallback: Use Gemini to suggest popular videos
    // Don't count this against rate limit since it's secondary
    const videoSchema = {
        type: Type.OBJECT,
        properties: {
            videoId: {
                type: Type.STRING,
                description: 'The unique 11-character ID of the YouTube video. Not the full URL.'
            },
            title: {
                type: Type.STRING,
                description: 'The title of the YouTube video.'
            }
        },
        required: ['videoId', 'title']
    };

    const videoArraySchema = {
        type: Type.ARRAY,
        items: videoSchema,
    };

    const prompt = `
    Find 2 highly popular and verified YouTube videos in SPANISH to help someone learn about the math topic: "${topic}".
    Prioritize videos from "El Profe Alex", "Julioprofe", or "Matemáticas profe Alex".
    The videos MUST be valid and currently available.
    Respond ONLY with a JSON array that adheres to the provided schema.
    For each video, provide only the videoId (11 characters) and title.
    `;

    try {
        const response = await getAi().models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: videoArraySchema,
            },
        });
        
        const jsonString = response.text?.trim();
        if (!jsonString) return getFallbackVideos(topic);
        
        const videoData = JSON.parse(jsonString);

        if (!Array.isArray(videoData)) {
            console.error("Gemini did not return a valid array for videos:", videoData);
            return getFallbackVideos(topic);
        }
        
        const videos: YouTubeVideo[] = videoData
            .map((video: any) => {
                const videoId = extractVideoId(video.videoId || '');
                if (videoId && video.title) {
                    return { videoId, title: video.title };
                }
                return null;
            })
            .filter((v): v is YouTubeVideo => v !== null)
            .slice(0, 2);
            
        if (videos.length === 0) {
            console.log("No valid videos found from Gemini, using fallback.");
            return getFallbackVideos(topic);
        }

        return videos;

    } catch (error) {
        console.error("Error searching for YouTube videos with Gemini:", error);
        return getFallbackVideos(topic);
    }
};
