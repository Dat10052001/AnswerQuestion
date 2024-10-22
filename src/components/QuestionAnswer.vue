<template>
  <div class="main">
    <img src="@/assets/right-logo.png" alt="Logo" class="sub-logo" />
    <div class="quiz-container">
      <img src="@/assets/bird.png" alt="Logo" class="bird-1" :class="{ 'display-none': birdIsMoved }" @click="moveBird"/>
      <div class="timer">
        {{ timeRemaining }}
      </div>
      <div class="question">
        <p class="question-title">CÂU HỎI {{ currentQuestionIndex + 1}}</p>
        <img src="@/assets/bird.png" alt="Logo" class="bird-2" :class="{ 'display-none': !birdIsMoved }" />
        <div class="question-content">
          <p v-if="isRun">{{ questions[currentQuestionIndex]?.question }}</p>
        </div>
      </div>
      <div class="options">
        <button 
          v-for="(option, label) in questions[currentQuestionIndex]?.answers" 
          :key="label" 
          class="option-button" 
          :data-label="label"
          @click="selectOption(label)"
          ref="buttons"
        >
          <p v-if="isRun">{{ option }}</p>
        </button>
      </div>
      <div v-if="showConfirmPopup" class="popup">
        <div class="popup-content">
          <p>Bạn có chắc chắn muốn chọn đáp án này?</p>
          <button class="button-confirm yes-btn" @click="proceedWithSelection">Có</button>
          <button class="button-confirm no-btn" @click="cancelSelection">Không</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- JAVASCRIPT -->
<script>
import { getQuestionBank } from '@/utils/questionBank';
import { getIndexQuestion, getProcessing } from '@/utils/exam';
import { sendAnswer, getBird, updateBird} from '@/utils/examinee';

const TIME_TO_ANSWER = 30;

export default {
  data() {
    return {
      timeRemaining: TIME_TO_ANSWER,
      isAnswered: false,
      showConfirmPopup: false,
      currentQuestionIndex: 0,
      isRun: null,
      intervalId: null,
      birdIsMoved: null,
      buttons: [],
      username: '',
      questions: [null],
      answer: "",
      answerChosen: null,
      answerTemp: null,
      isCorrect: null,
    };
  },
  mounted() {
    this.buttons = this.$el.querySelectorAll('.option-button');
    this.username = this.$cookies.get('username');
    this.startFetching();
    this.getQuestionBank();
    this.getBird();
  },
  methods: {

    async getProcessing() {
      try 
      { 
        this.isRun = await getProcessing();
      } catch (error) {
          console.error("Lỗi khi cập nhật isRun:", error);
      }
    },

    confirmSelection(index) {
      this.showConfirmPopup = true;
      this.selectedOptionIndex = index; 
    },

    charCodeToNumber(char) {
      switch(char){
        case 'A': return 0; 
        case 'B': return 1; 
        case 'C': return 2; 
        case 'D': return 3; 
        default: return;
      }
    },

    proceedWithSelection() {
      this.answerChosen = this.answerTemp;

      const indexCorrect = this.charCodeToNumber(this.answerChosen);

      if(this.answerChosen == this.questions[this.currentQuestionIndex]?.correctAnswer) {
        this.$refs.buttons[indexCorrect].classList.add('correct');
        this.isCorrect = true;
      }
      else {
        this.$refs.buttons[indexCorrect].classList.add('wrong');
        this.isCorrect = false;
      }

      this.$refs.buttons.forEach(button => {
        button.classList.add('disabled');
      });

      sendAnswer(
        this.username, 
        this.currentQuestionIndex, 
        this.questions[this.currentQuestionIndex].question, 
        this.answerChosen,
        this.isCorrect,
        this.birdIsMoved,
        this.timeRemaining,
      );

      this.showConfirmPopup = false; 
      this.isAnswered = true;
      this.timeRemaining = 1;
    },

    cancelSelection() {
      this.showConfirmPopup = false; 
    },

    async getQuestionBank() {
      try {
        this.questions = await getQuestionBank();
        } catch (error) {
          console.error("Lỗi khi lấy ngân hàng câu hỏi:", error);
        }
    },

    async getBird() {
      this.birdIsMoved = await getBird(this.username);
    },

    async moveBird() {
      this.birdIsMoved = true;
      await updateBird(this.username);
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

    async getIndexQuestion() {
      try {
            this.currentQuestionIndex = await getIndexQuestion();
        } catch (error) {
            console.error("Lỗi khi lấy index câu hỏi:", error);
        }
    },

    startTimer(running) {
      if(!running) {
        return;
      }
      else {
        const timer = setInterval(() => {
          if (this.timeRemaining <= 1) {
            clearInterval(timer);
            if (!this.isAnswered) {
              this.showCorrectAnswer();
              sendAnswer(
                this.username, 
                this.currentQuestionIndex, 
                this.questions[this.currentQuestionIndex].question, 
                'NOT ANSWER',
                false,
                this.birdIsMoved,
                0,
              );
            }
          }
          this.timeRemaining--;
        }, 1000);
      }
    },

    showCorrectAnswer() {
      const indexCorrect = this.charCodeToNumber(this.questions[this.currentQuestionIndex]?.correctAnswer);
      this.$refs.buttons[indexCorrect].classList.add('correct');

      this.$refs.buttons.forEach(button => {
        button.classList.add('disabled');
      });

      this.isAnswered = true;
    },

    selectOption(label) {
      if (this.isAnswered) return;

      this.answerTemp = label;
      this.showConfirmPopup = true;
    },

    async sendAnswer(username, indexQuestion, question, answer, result, useBird, second) {
      await sendAnswer(username, indexQuestion, question, answer, result, useBird, second);
    },

    resetButtons() { 
      if (this.$refs.buttons && Array.isArray(this.$refs.buttons)) {
        this.$refs.buttons.forEach(button => {
          button.classList.remove('correct', 'wrong', 'disabled');
        });
      }
      this.isAnswered = false;
    },
  },

  beforeUnmount() {
    this.stopFetching();
  },

  watch: {
    currentQuestionIndex(newIndex, oldIndex) {
      if (newIndex !== oldIndex) {
        this.timeRemaining = TIME_TO_ANSWER;
        this.resetButtons();
      }
    },
    isRun(newIndex) {
      this.timeRemaining = TIME_TO_ANSWER;
      this.startTimer(newIndex);
    }
  }
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
  top: 2%;
  right: 2%;
  width: 20%;
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
  position: fixed;
  top: 20%;
  font-size: 80px;
  color: white;
  border-radius: 50px;
  background-color: #DD241D;
  width: 15%;
  height: 100px;
  font-weight: bolder;
  margin-bottom: 5%;
  line-height: 80px;
}

.question {
  margin-top: 10%;
  width: 80%;
}

.question-content {
  background-color: #003DA5;
  color: white; 
  border-radius: 25px;
  padding: 2% 3%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 40px; 
  font-weight: bolder;
  text-align: center;
  height: auto;
}

.question-title {
  font-size: 40px; 
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
  gap: 2%; 
  margin-top: 2%;
  width: 80%;
}

.option-button {
  display: flex;
  align-items: center; 
  background-color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer; 
  font-size: 35px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  height: 170px;
  margin-top: 2%;
  padding: 2% 0;
  padding-right: 4%;
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
  border-radius: 50px;
  width: 20%; 
  height: 100%; 
  display: flex; 
  justify-content: center; 
  align-items: center;
  font-size: 40px;
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

.bird-1 {
  position: fixed;
  width: 15%;
  cursor: pointer;
  top: 5%;
  right: 35%;
  z-index: 99;
}

.bird-2 {
  position: fixed;
  width: 15%;
  cursor: not-allowed;
  right: 0;
  top: 21%;
  z-index: 99;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.popup-content {
  background: white;
  padding: 5% 2%;
  border-radius: 25px;
  text-align: center;
  width: 45%;
  font-size: 40px;
}

.button-confirm {
  width: 20%;
  font-size: 35px;
  font-weight: bolder;
  padding: 2%;
  border-radius: 15px;
  border: none;
  margin: 0 2%;
  margin-top: 4%;
  color: white;
}

.yes-btn {
  background-color: green;
}

.yes-btn:hover {
  background-color: rgb(2, 218, 2);
}

.no-btn {
  background-color: red;
}

.no-btn:hover {
  background-color: rgb(238, 67, 67);
}
</style>