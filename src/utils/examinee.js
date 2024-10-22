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

export async function sendAnswer(username, indexQuestion, question, answer, isCorrected, usedBird, second) {
  try {
    //Check xem đã trả lời chưa
    const isAnswered = await readData(`answer/${username}/${indexQuestion}`);
    if (isAnswered) {
      return;
    }

    let point;
    if (isCorrected) {
      if (second <= 30 && second >= 21) point = 5;
      else if (second <= 20 && second >= 16) point = 4;
      else if (second <= 15 && second >= 11) point = 3;
      else point = 1;

      if (usedBird) point = point * 2;
      } 
      else {
        if (usedBird) point = -5;
        else point = 0;
      }
    
    await writeData(`answer/${username}/${indexQuestion}`, {
      question,
      answer,
    });

    await writeData(`examinees/${username}/thulinhchinhphuc/plusScore`, point);
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
