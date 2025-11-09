import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Exercise, Subject, Question, QuestionType } from "../types";

// API key được cung cấp qua process.env.API_KEY
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Biến môi trường API_KEY chưa được đặt. Sử dụng dữ liệu giả.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export interface EncouragementResponse {
    text: string;
    imageUrl: string | null;
}

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

// FIX: Changed return type to Omit<Exercise, 'originalFile'> to match implementation and usage.
// This function creates exercise data but leaves adding file-specific info to the caller.
export const createExerciseFromFile = async (file: File): Promise<Omit<Exercise, 'originalFile'>> => {
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
        const prompt = "Phân tích hình ảnh hoặc tài liệu PDF chứa bài tập này và chuyển nó thành định dạng JSON có cấu trúc. Trích xuất chính xác nội dung từng câu hỏi, loại câu hỏi (trắc nghiệm hoặc điền vào chỗ trống), các tùy chọn (nếu có), và đáp án đúng. Bỏ qua bất kỳ hình ảnh nào có trong tài liệu, chỉ tập trung vào phần văn bản.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [filePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: exerciseSchema
            }
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        
        const questions = parsedData.questions.map((q: any, index: number) => ({
            ...q,
            id: `q-${Date.now()}-${index}`,
        }));

        // FIX: Removed explicit :Exercise type to match the new return type.
        const newExercise = {
            id: `ex-${Date.now()}`,
            createdAt: new Date().toISOString(),
            title: parsedData.title,
            subject: parsedData.subject,
            questions: questions,
        };
        return newExercise;

    } catch (error) {
        console.error("Error creating exercise with Gemini:", error);
        throw new Error("Không thể tạo bài tập từ tệp đã tải lên. Vui lòng thử lại.");
    }
};

export const getEncouragement = async (score: number, total: number): Promise<EncouragementResponse> => {
    if (!ai) {
        const praises = [
            "Làm tốt lắm Minh Đăng ơi! Bạn thật siêu!",
            "Tuyệt vời! Bạn đã hoàn thành rất xuất sắc!",
            "Hoan hô Minh Đăng! Bạn là một ngôi sao nhỏ!",
            "Giỏi quá! Cứ tiếp tục phát huy nhé bạn!",
        ];
        return Promise.resolve({
            text: praises[Math.floor(Math.random() * praises.length)],
            imageUrl: null,
        });
    }

    try {
        const percentage = total > 0 ? (score / total) * 100 : 0;
        const prompt = `Bạn Minh Đăng, một cậu bé, vừa làm xong bài tập và đạt ${score} trên ${total} điểm (đạt ${percentage.toFixed(0)}%). Hãy:
1. Viết một lời khen ngợi ngắn gọn (khoảng 1-2 câu), vui vẻ, và đầy cảm hứng cho cậu ấy.
2. Tạo một hình ảnh minh họa thật dễ thương và phù hợp với lời khen và số điểm, theo phong cách hoạt hình màu sắc tươi sáng để ăn mừng. Nếu điểm cao, hãy vẽ hình ảnh hoành tráng như tên lửa, khủng long siêu nhân, cúp vàng. Nếu điểm chưa cao, hãy vẽ hình ảnh động viên như một mầm cây đang vươn lên hoặc một chú ong chăm chỉ.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        let text = "Bạn làm tốt lắm!";
        let imageUrl = null;

        // The text part might not exist in the response, so we need to handle it.
        // It is recommended to use `response.text` to get the text.
        text = response.text || text;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break; // Assuming only one image
            }
        }
        
        return { text, imageUrl };

    } catch (error) {
        console.error("Error getting encouragement from Gemini:", error);
        return { text: "Bạn làm tốt lắm!", imageUrl: null };
    }
};
