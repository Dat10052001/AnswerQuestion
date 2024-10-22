import { readData, writeData } from "@/firebase";

export async function login(username, password) {
  try {
    const user = await readData(`examinees/${username}`);
    if (user && user.password == password) {
      return true;
    }
    return false;
  } catch (error) {
    console.log("lỗi khi đăng nhập");
    return false;
  }
}

export async function sendAnswer(username, indexQuestion, question, answer) {
  try {
    await writeData(`answer/${username}/${indexQuestion}`, {
      question,
      answer,
    });

    // Viết hàm cộng điểm ở đây
  } catch (error) {
    console.log("lỗi khi gửi câu trả lời");
  }
}

// Trả về false thì vẫn hiện con bồ câu
export async function getBird(username) {
    try {
        const isUsed = await readData(`examinees/${username}/bird`);
        return isUsed;
    } catch (error) {
        console.log("Xảy ra l��i khi đ��c sữa");
        return null;
    }
}

// Sau khi sử dụng bồ câu thì cập nhật lại thành true
export async function updateBird(username) {
    try {
        await writeData(`examinees/${username}/bird`, true);
    } catch (error) {
        console.log("Xảy ra l��i khi đ��c sữa");
        return null;
    }
}
