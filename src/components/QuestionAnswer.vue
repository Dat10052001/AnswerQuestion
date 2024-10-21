<template>
  <div class="main">
    <img src="@/assets/logo.png" alt="Logo" class="sub-logo" />
    <div class="quiz-container">
    <div class="timer">{{ timeRemaining }}</div>
    <div class="question">
      <p class="question-title">CÂU HỎI {{ currentQuestionIndex }}</p>
      <div class="question-content">
        <p>{{ questions[currentQuestionIndex].question }}</p>
      </div>
    </div>
    <div class="options">
      <button 
        v-for="(option, index) in questions[currentQuestionIndex].options" 
        :key="index" 
        class="option-button" 
        :data-label="String.fromCharCode(65 + index)"
        @click="selectOption(index)"
        ref="buttons">
        {{ option }}
      </button>
    </div>
  </div>
  </div>
</template>

<!-- JAVASCRIPT -->
<script>
import { database } from '@/firebase';
import { ref, onValue } from 'firebase/database';

export default {
  data() {
    return {
      timeRemaining: 30,
      isAnswered: false,
      currentQuestionIndex: 2,
      isRun: false,
      intervalId: null,
      question: [],

      // questions: [
      //   {
      //     question: '',
      //     options: ['', '', '', ''],
      //     correctIndex: 0
      //   },
      //   {
      //     question: 'Câu hỏi 1?',
      //     options: ['Đáp án', 'Đáp án đúng', 'Đáp án', 'Đáp án'],
      //     correctIndex: 1
      //   },
      //   {
      //     question: 'Câu hỏi 2?',
      //     options: ['Đáp án đúng', 'Đáp án', 'Đáp án', 'Đáp án'],
      //     correctIndex: 0 
      //   },
      // ],
    };
  },
  mounted() {
    this.startTimer();
    this.$refs.buttons = this.$el.querySelectorAll('.option-button');
    this.startFetching();
    this.getQuestionBank();
  },
  methods: {
    getQuestionBank() {
      const questionsRef = ref(database, 'questions');
      onValue(questionsRef, (snapshot) => {
        this.questions = snapshot.val();
      });
    },
    fetchIsRun() {
      fetch('URL_CỦA_API')
        .then(response => response.json())
        .then(data => {
          this.isRun = data.isRun;
        })
        .catch(error => {
          console.error('Lỗi khi fetch dữ liệu:', error);
        });
    },
    startFetching() {
      this.intervalId = setInterval(() => {
        this.fetchIsRun();
        this.getProcessing();
        this.getIndexQuestion();
      }, 500);
    },
    stopFetching() {
      clearInterval(this.intervalId);
    },
    getProcessing() {
      if (!this.isRun) {
        this.currentQuestionIndex = 0;
        this.resetButtons();
      } 
      else {
        this.currentQuestionIndex = this.getIndexQuestion();
      }
    },
    getIndexQuestion() {
      return this.currentQuestionIndex;
    },
    startTimer() {
      if(this.isRun) {
        const timer = setInterval(() => {
          this.timeRemaining--;
          if (this.timeRemaining <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      }
    },
    selectOption(index) {
      if (this.isAnswered) return;

      this.isAnswered = true;
      const currentQuestion = this.questions[this.currentQuestionIndex];

      if (index === currentQuestion.correctIndex) {
        this.$refs.buttons[index].classList.add('correct');
      } else {
        this.$refs.buttons[index].classList.add('wrong');
      }

      this.$refs.buttons.forEach(button => {
        button.classList.add('disabled');
      });

      const answer = this.questions[this.currentQuestionIndex].options[index];
      this.sendAnswer(this.studentId, this.currentQuestionIndex, answer);
    },
    resetButtons() {
      this.$refs.buttons.forEach(button => {
        button.classList.remove('correct', 'wrong', 'disabled', 'no-hover');
        this.isAnswered = false;
      });
    },
    sendAnswer(studentId, questionIndex, answer) {
      console.log(`Gửi câu trả lời: Sinh viên ${studentId}, câu hỏi ${questionIndex}, đáp án: ${answer}`);

      const answersRef = ref(database, `answers/${studentId}/${questionIndex}`);
      answersRef.set({
        answer: answer,
        timestamp: new Date().toISOString(),
      }).then(() => {
        console.log('Câu trả lời đã được gửi thành công!');
      }).catch((error) => {
        console.error('Lỗi khi gửi câu trả lời:', error);
      });
    },
  },
  beforeUnmount() {
    this.stopFetching();
  },
};
</script>

<style>
.main{
  background-image: url('@/assets/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  margin: 0;
}
.sub-logo{
  position: absolute;
  top: 20px;
  right: 20px;
  width: 20%;
  height: 120px;
  border: 1px solid red;
}
.quiz-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 90vh;
}

.timer {
  font-size: 40px;
  color: white;
  border-radius: 50px;
  background-color: #DD241D;
  width: 12%;
  height: 60px;
  line-height: 60px;
  font-weight: bolder;
  margin-bottom: 5%;
}

.question {
  width: 80%;
}

.question-content {
  background-color: #003DA5;
  color: white; 
  border-radius: 25px;
  padding: 15px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 24px; 
  font-weight: bolder;
  text-align: left;
}

.question-title {
  font-size: 28px; 
  font-weight: 700;
  color: #DD241D;
  margin: 0;
  padding-left: 1%;
  text-align: left;
  position: relative;
}

.options {
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 20px; 
  margin-top: 2%;
  width: 80%;
}

.option-button {
  display: flex;
  align-items: center; 
  background-color: white;
  border: none;
  border-radius: 25px;
  padding: 15px;
  cursor: pointer; 
  font-size: 24px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  height: 85px;
}

.option-button:hover {
  background-color: #f0f0f0;
}

.option-button.correct {
  background-color: #EAFFCF; 
}

.option-button.wrong {
  background-color: #FFE1E1;
}

.option-button.disabled {
  cursor: not-allowed;
}

.option-button::before {
  content: attr(data-label);
  position: absolute; 
  left: 0; 
  top: 50%; 
  transform: translateY(-50%); 
  background-color: #003DA5; 
  color: white; 
  border-radius: 25px;
  width: 20%; 
  height: 100%; 
  display: flex; 
  justify-content: center; 
  align-items: center;
}

.option-button.wrong::before {
  background-color: #FF3131;
}

.option-button.correct::before {
  background-color: #00BF63;
}

.option-button[data-label] {
  padding-left: 25%;
  color: #004AAD;
  font-weight: bolder;
}
</style>