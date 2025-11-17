import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Difficulty, Problem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
  }
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
    const response = await ai.models.generateContent({
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
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const problemStatement = `
    Título: ${problem.title}
    Contexto: ${problem.context}
    Preguntas: 
    ${problem.questions.map((q, i) => `${String.fromCharCode(97 + i)}) ${q}`).join('\n')}
  `;
  const prompt = `Provide a clear, step-by-step solution for the following math problem. Explain each step thoroughly. Use Markdown for formatting and LaTeX for mathematical expressions (e.g., ... for block and ... for inline). Problem: ${problemStatement}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating solution:", error);
    throw new Error("Failed to generate a solution. Please try again.");
  }
};

export const getSimpleExplanation = async (topic: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const prompt = `Explica el tema de matemáticas "${topic}" como si se lo estuvieras contando a un niño de 8 años. La explicación debe ser muy sencilla y fácil de entender. Enfócate en para qué se usa en la vida real, por qué es importante, y qué tipo de operaciones se usan para llegar a los resultados, explicando el porqué de cada paso. Evita usar símbolos o notación matemática compleja; si es necesario usar alguno, explícalo de manera muy simple. La respuesta debe estar en español y usar formato Markdown.`;
    try {
        const response = await ai.models.generateContent({
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
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
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
        const response = await ai.models.generateContent({
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
    return ai.chats.create({
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