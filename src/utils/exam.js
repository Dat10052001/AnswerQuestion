import { readData } from "@/firebase"

// Mỗi 500ms fetch lại dữ liệu để lấy index 1 lần 
export async function getIndexQuestion() {
    try {
        return await readData("exam/questionIndex");
    } catch (error) {
        console.log("Lỗi khi cập nhật câu hỏi")
    }
}

// Khi chuyển trang câu hỏi bằng các phím mũi tên (-> bà <-), cập nhật isRun thành false
// Khi ấn show câu hỏi => cập nhật isRun thành true
export async function getProcessing() {
    try {
        return readData("exam/isRun");
    } catch (error) {
        console.log("Lỗi khi cập nhật isRun")
        return null;
    }
}