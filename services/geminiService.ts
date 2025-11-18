
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Difficulty, Problem, YouTubeVideo } from '../types';

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * This prevents the app from crashing on start if the API key is not immediately available.
 */
function getAi(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.error("API_KEY is missing from environment variables.");
        throw new Error("API Key no configurada. Por favor verifica tu archivo .env o la configuración de Vercel.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}


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
  const prompt = `
    Generate ${count} math problem(s) in SPANISH about the topic "${topic}" with a "${difficulty}" difficulty.
    The problem MUST be a real-world application scenario. Adhere strictly to the JSON schema provided.
    
    EXAMPLE for a "Derivadas" problem:
    {
      "title": "Costo mínimo de mantenimiento de servidores",
      "context": "Una empresa de software mantiene n servidores. El costo total de mantenimiento mensual (en UM) está dado por la función: C(n) = 50n + \\frac{800}{n}",
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
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: problemsArraySchema,
      },
    });

    const jsonString = response.text.trim();
    const problemData = JSON.parse(jsonString);
    
    const problems: Problem[] = Array.isArray(problemData) 
        ? problemData 
        : (problemData && typeof problemData === 'object' && 'title' in problemData ? [problemData] : []);

    if (problems.length === 0) {
      console.error("Received unexpected data structure from model:", problemData);
      throw new Error("La IA no devolvió un problema válido. Intenta de nuevo.");
    }
    
    // CRITICAL VALIDATION: Ensure the model didn't return an empty but structurally valid problem.
    for (const p of problems) {
        if (!p.context || p.context.trim() === '' || !p.questions || p.questions.length === 0 || p.questions.some(q => !q || q.trim() === '')) {
            console.error("Validation failed: Model returned an incomplete problem.", p);
            throw new Error("La IA generó un problema incompleto. Por favor, intenta de nuevo.");
        }
    }
    
    return problems;

  } catch (error) {
    console.error("Error generating problem:", error);
     if (error instanceof Error && error.message.includes("incompleto")) {
        throw error;
    }
    throw new Error("No se pudo generar un problema. La IA podría no estar disponible o la solicitud es inválida.");
  }
};

export const generateSolution = async (problem: Problem): Promise<string> => {
    const problemStatement = `
    Título: ${problem.title}
    Contexto: ${problem.context}
    Preguntas: 
    ${problem.questions.map((q, i) => `${String.fromCharCode(97 + i)}) ${q}`).join('\n')}
  `;
  const prompt = `Provide a clear, step-by-step solution for the following math problem. Explain each step thoroughly. Use Markdown for formatting and LaTeX for mathematical expressions (e.g., ... for block and ... for inline). Problem: ${problemStatement}`;

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating solution:", error);
    throw new Error("Failed to generate a solution. Please try again.");
  }
};

export const getSimpleExplanation = async (topic: string): Promise<string> => {
    const prompt = `Explica el tema de matemáticas "${topic}" como si se lo estuvieras contando a un niño de 8 años. La explicación debe ser muy sencilla y fácil de entender. Enfócate en para qué se usa en la vida real, por qué es importante, y qué tipo de operaciones se usan para llegar a los resultados, explicando el porqué de cada paso. Evita usar símbolos o notación matemática compleja; si es necesario usar alguno, explícalo de manera muy simple. La respuesta debe estar en español y usar formato Markdown.`;
    try {
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating explanation:", error);
        throw new Error("Failed to generate an explanation.");
    }
};

export const reviewHomework = async (imageData: string, mimeType: string, problemContext: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: imageData,
            mimeType,
        },
    };
    
    let promptText = `You are a friendly and encouraging math tutor. Analyze the user's handwritten solution in the provided image.
        1. Identify the problem and the user's steps from the image.
        2. If the solution is 100% correct, respond ONLY with the exact word "CORRECT".
        3. If there is an error, DO NOT give the final answer. Instead, provide a supportive and positive hint pointing to the specific mistake. For example: "¡Vas súper bien! Detecté un pequeño detalle en la línea 3. Revisa el signo que usaste cuando despejaste la 'x'. ¡Ya casi lo tienes!"
        4. Your feedback should be in Spanish.`;
        
    if (problemContext) {
        promptText = `You are a friendly and encouraging math tutor. The user is trying to solve the following problem: "${problemContext}".
        Analyze the user's handwritten solution in the provided image based on this context.
        1. Identify the user's steps.
        2. If the solution is 100% correct for the given problem, respond ONLY with the exact word "CORRECT".
        3. If there is an error, DO NOT give the final answer. Instead, provide a supportive and positive hint pointing to the specific mistake. For example: "¡Vas súper bien! Detecté un pequeño detalle en la línea 3. Revisa el signo que usaste cuando despejaste la 'x'. ¡Ya casi lo tienes!"
        4. Your feedback should be in Spanish.`;
    }
    
    const textPart = { text: promptText };

    try {
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] }
        });
        return response.text;
    } catch (error) {
        console.error("Error reviewing homework:", error);
        throw new Error("Failed to review homework.");
    }
};

export const createTutorChat = (): Chat => {
    return getAi().chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are "ProfeIA", a patient and helpful math tutor from Colombia who uses the Socratic method. Your goal is to guide students to find the answers themselves, not to give them the solution directly.
            - Never give the direct answer to a problem.
            - Always respond in Spanish.
            - Use guiding questions. For example, if a student is stuck, ask "Ok, ¿cuál crees que sería el primer paso?" or "¿Qué es lo último que intentaste?".
            - Keep your personality encouraging, friendly, and use some Colombian slang like "¡qué chévere!", "¡pilas pues!", "¡dale!".
            - Keep your responses concise.`
        },
    });
};

// Videos de respaldo por tema
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
        ]
    };
    
    // Buscar coincidencia exacta o parcial
    for (const [key, videos] of Object.entries(fallbackCatalog)) {
        if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
            console.log(`Usando videos de respaldo para: ${key}`);
            return videos;
        }
    }
    
    // Videos generales si no hay coincidencia
    console.log('Usando videos generales de matemáticas');
    return [
        { videoId: 'lhKoslz5cGU', title: 'Conceptos Matemáticos Fundamentales' },
        { videoId: 'Ej0yAI7OrGA', title: 'Matemáticas Básicas' }
    ];
}

/**
 * Extracts a YouTube video ID from various URL formats.
 * @param url The URL or video ID string.
 * @returns The 11-character video ID or an empty string if not found.
 */
const extractVideoId = (url: string): string => {
    if (!url) {
        return '';
    }
    // Check if it's already a valid 11-character ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }
    
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return '';
};

export const searchYoutubeVideos = async (topic: string): Promise<YouTubeVideo[]> => {
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
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: videoArraySchema,
            },
        });
        
        const jsonString = response.text.trim();
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
