import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, Subject, Question, QuestionType } from "../types";

// Sử dụng `import.meta.env.VITE_API_KEY` để tương thích với Vite
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY environment variable not set. Using a mock response.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "Tạo một tiêu đề ngắn gọn và phù hợp cho bài tập này bằng Tiếng Việt."
        },
        subject: {
            type: Type.STRING,
            enum: Object.values(Subject),
            description: "Phân loại môn học cho bài tập. Các lựa chọn là: 'Toán', 'Tiếng Việt', 'Tiếng Anh', 'Khác'."
        },
        questions: {
            type: Type.ARRAY,
            description: "Danh sách các câu hỏi trong bài tập.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: {
                        type: Type.STRING,
                        description: "Nội dung đầy đủ của câu hỏi."
                    },
                    type: {
                        type: Type.STRING,
                        enum: Object.values(QuestionType),
                        description: "Loại câu hỏi. 'MULTIPLE_CHOICE' cho trắc nghiệm, 'FILL_IN_THE_BLANK' cho điền vào chỗ trống."
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "Danh sách các lựa chọn cho câu hỏi trắc nghiệm. Bỏ trống cho loại câu hỏi khác.",
                        items: { type: Type.STRING }
                    },
                    correctAnswer: {
                        type: Type.STRING,
                        description: "Đáp án chính xác cho câu hỏi."
                    }
                },
                required: ["questionText", "type", "correctAnswer"]
            }
        }
    },
    required: ["title", "subject", "questions"]
};

export const createExerciseFromFile = async (file: File): Promise<Exercise> => {
    if (!ai) {
        console.log("Using mock exercise data.");
        // Mock response for development without API key
        return Promise.resolve({
            id: `mock-${Date.now()}`,
            title: "Bài tập Toán Vui",
            subject: Subject.Toan,
            createdAt: new Date().toISOString(),
            questions: [
                { id: 'q1', questionText: "2 + 2 = ?", type: QuestionType.FillInTheBlank, correctAnswer: "4" },
                { id: 'q2', questionText: "5 x 3 = ?", type: QuestionType.FillInTheBlank, correctAnswer: "15" },
                { id: 'q3', questionText: "Hình nào là hình vuông?", type: QuestionType.MultipleChoice, options: ["A", "B", "C", "D"], correctAnswer: "A" }
            ]
        });
    }

    try {
        const filePart = await fileToGenerativePart(file);
        const prompt = "Phân tích hình ảnh hoặc tài liệu PDF chứa bài tập này và chuyển nó thành định dạng JSON có cấu trúc. Đảm bảo xác định chính xác từng câu hỏi, loại câu hỏi (trắc nghiệm hoặc điền vào chỗ trống), các tùy chọn (nếu có) và câu trả lời đúng. Giữ nguyên nội dung gốc của câu hỏi và câu trả lời.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [filePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: exerciseSchema
            }
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        const newExercise: Exercise = {
            id: `ex-${Date.now()}`,
            createdAt: new Date().toISOString(),
            title: parsedData.title,
            subject: parsedData.subject,
            questions: parsedData.questions.map((q: any, index: number) => ({
                ...q,
                id: `q-${Date.now()}-${index}`,
            })),
        };
        return newExercise;

    } catch (error) {
        console.error("Error creating exercise with Gemini:", error);
        throw new Error("Không thể tạo bài tập từ tệp đã tải lên. Vui lòng thử lại.");
    }
};

export const getEncouragement = async (score: number, total: number): Promise<string> => {
    if (!ai) {
        const praises = [
            "Làm tốt lắm Minh Đăng ơi! Bạn thật siêu!",
            "Tuyệt vời! Bạn đã hoàn thành rất xuất sắc!",
            "Hoan hô Minh Đăng! Bạn là một ngôi sao nhỏ!",
            "Giỏi quá! Cứ tiếp tục phát huy nhé bạn!",
        ];
        return Promise.resolve(praises[Math.floor(Math.random() * praises.length)]);
    }

    try {
        const percentage = total > 0 ? (score / total) * 100 : 0;
        const prompt = `Bạn Minh Đăng vừa làm xong bài tập và đạt ${score}/${total} điểm (đạt ${percentage.toFixed(0)}%). Hãy viết một lời khen ngợi thật độc đáo, vui vẻ, và đầy cảm hứng dành cho bạn ấy. Lời khen cần ngắn gọn, tích cực và phù hợp với một bé trai.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting encouragement from Gemini:", error);
        return "Bạn làm tốt lắm!";
    }
};
