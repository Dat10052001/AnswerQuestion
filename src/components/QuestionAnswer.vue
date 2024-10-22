<template>
  <div class="main">
    <img src="@/assets/right-logo.png" alt="Logo" class="sub-logo" />
    <img src="@/assets/bird.png" alt="Logo" class="bird" :class="{ 'bird-moved': birdIsMoved }" @click="moveBird" />

    <div class="quiz-container">
      <div class="timer">{{ timeRemaining }}</div>
      <div class="question">
        <p class="question-title">CÂU HỎI {{ currentQuestionIndex }}</p>
        <div class="question-content">
          <p :class="{ 'display-none': !isRun }">{{ questions[currentQuestionIndex].question }}</p>
        </div>
      </div>
      <div class="options">
        <button 
          v-for="(option, index) in questions[currentQuestionIndex].otherAnswer" 
          :key="index" 
          class="option-button" 
          :data-label="String.fromCharCode(65 + index)"
          @click="selectOption(index)"
          ref="buttons"
          >
          <p :class="{ 'display-none': !isRun }">{{ option }}</p>
        </button>
        <button 
          key="correct"
          class="option-button" 
          data-label="D"
          @click="selectOption(9)"
          ref="correctButtons">
          <p :class="{ 'display-none': !isRun }">{{ questions[currentQuestionIndex].correctAnswer }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<!-- JAVASCRIPT -->
<script>
export default {
  data() {
    return {
      timeRemaining: 30,
      isAnswered: false,
      currentQuestionIndex: 1,
      isRun: false,
      intervalId: null,
      birdIsMoved: false,
      buttons: [],
      username: '',
      // question: [],
      answer: "",
      // sample data
      questions: [
        {
          correctAnswer: "Đảng Cộng sản Việt Nam, Nhà nước, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
          otherAnswer: [
            "Đảng Cộng sản Việt Nam, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
            "Nhà nước, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
            "Đảng Cộng sản Việt Nam, Nhà nước, các đoàn thể chính trị - xã hội",
          ],
          question: "Hệ thống chính trị ở Việt Nam hiện nay bao gồm?",
          stt: 1
        },
        {
          correctAnswer: "Đảng Cộng sản Việt Nam, Nhà nước, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
          otherAnswer: [
            "Đảng Cộng sản Việt Nam, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
            "Nhà nước, Mặt trận Tổ quốc và các đoàn thể chính trị - xã hội",
            "Đảng Cộng sản Việt Nam, Nhà nước, các đoàn thể chính trị - xã hội",
          ],
          question: "Hệ thống chính trị ở Việt Nam hiện nay bao gồm?",
          stt: 1
        },
      ],
    };
  },
  mounted() {
    // this.startTimer();
    this.buttons = this.$el.querySelectorAll('.option-button');
    this.username = this.$cookies.get('username');
  },
  methods: {

    moveBird() {
      this.birdIsMoved = true;
    },

    getQuestionBank() {
      //
    },

    startFetching() {
      this.intervalId = setInterval(() => {
        this.getProcessing();
        this.getIndexQuestion();
      }, 500);
    },

    stopFetching() {
      clearInterval(this.intervalId);
    },

    getProcessing() {
      if (!this.isRun) {
        this.resetButtons();
      } 
      else {
        this.currentQuestionIndex = this.getIndexQuestion();
      }
    },

    getIndexQuestion() {
      //
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

      if (index === 9) {
        this.answer = this.questions[this.currentQuestionIndex].correctAnswer + ' (TRUE)';
        this.$refs.correctButtons.classList.add('correct');
      }
      else {
        this.answer = this.questions[this.currentQuestionIndex].otherAnswer[index] + ' (FALSE)';
        this.$refs.buttons[index].classList.add('wrong');
      }

      this.$refs.buttons.forEach(button => {
        button.classList.add('disabled');
      });

      this.$refs.correctButtons.classList.add('disabled');

      // sendAnswer(this.username, this.currentQuestionIndex, this.questions[this.currentQuestionIndex].question, this.answer);
    },

    resetButtons() {
      this.buttons.forEach(button => {
        button.classList.remove('correct', 'wrong', 'disabled', 'no-hover');
        this.isAnswered = false;
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
  font-size: 16px;
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
  pointer-events: none;
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

.display-none {
  display: none;
}

.bird {
  position: absolute;
  width: 180px;
  height: auto;
  top: 4%;
  right: 34%;
  transition: top 0.5s, left 0.5s;
  cursor: pointer;
}

.bird-moved {
  position: absolute;
  width: 180px;
  height: auto;
  right: 1%;
  top: 22%;
  cursor: not-allowed;
}
</style>