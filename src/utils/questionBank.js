import { readData } from "@/firebase";

export async function getQuestionBank() {
  try {
    return await readData("questionBank");
  } catch (error) {
    console.error("Error fetching question bank: ", error);
    return [];
  }
}

// {
//   "correctAnswer": "Đảng Cộng sản Việt Nam, Nhà nước, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
//   "otherAnswer": [
//     "Đảng Cộng sản Việt Nam, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
//     "Nhà nước, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
//     "Đảng Cộng sản Việt Nam, Nhà nước, các đoàn thể chính trị - xã hội"
//   ],
//   "question": "Hệ thống chính trị ở Việt Nam hiện nay bao gồm?",
//   "stt": 1
// }

export async function getQuestionByIndex(index) {
  return getQuestionBank().then((questionBank) => questionBank[index]);
}
