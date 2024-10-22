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
          <p :class="{ 'display-none': !isRun }">{{ questions[currentQuestionIndex]?.question }}</p>
        </div>
      </div>
      <div class="options">
        <button 
          v-for="(option, index) in mixedOptions" 
          :key="index" 
          class="option-button" 
          :data-label="option.label"
          @click="selectOption(option.isCorrect ? 'correct' : index)"
          ref="buttons"
        >
          <p :class="{ 'display-none': !isRun }">{{ option.answer }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<!-- JAVASCRIPT -->
<script>
import { getQuestionBank } from '@/utils/questionBank';
import { getIndexQuestion, getProcessing } from '@/utils/exam';
import { sendAnswer, getBird, updateBird} from '@/utils/examinee';

export default {
  data() {
    return {
      timeRemaining: 30,
      isAnswered: false,
      currentQuestionIndex: 0,
      isRun: true,
      intervalId: null,
      birdIsMoved: false,
      buttons: [],
      username: '',
      questions: [null],
      answer: "",
      mixedOptions: [],
    };
  },
  mounted() {
    this.buttons = this.$el.querySelectorAll('.option-button');
    this.username = this.$cookies.get('username');
    this.startFetching();
    this.getIndexQuestion();
    this.getQuestionBank();
    this.getProcessing();
    this.getBird();
  },
  methods: {
    async getQuestionBank() {
      try {
        this.questions = await getQuestionBank(); 
        } catch (error) {
          console.error("Lỗi khi lấy ngân hàng câu hỏi:", error);
        }
        this.mixOptions();
    },

    // Random Answer A,B,C,D
    mixOptions() {
      const question = this.questions[this.currentQuestionIndex];
      const correctAnswer = {
        answer: question?.correctAnswer,
        isCorrect: true,
        label: String.fromCharCode(65 + question?.stt),
      };

      const otherAnswers = question?.otherAnswer.map((answer, index) => ({
        answer,
        isCorrect: false,
        label: String.fromCharCode(66 + index), 
      }));

      const allOptions = [...otherAnswers, correctAnswer];
      this.mixedOptions = this.shuffleArray(allOptions);

      this.mixedOptions.forEach((option, index) => {
        option.label = String.fromCharCode(65 + index);
      });
      
    },

    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
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

    async getProcessing() {
      try 
      { 
        await getProcessing(this.isRun);
      } catch (error) {
          console.error("Lỗi khi cập nhật isRun:", error);
      }
    },

    async getIndexQuestion() {
      try {
            this.currentQuestionIndex = await getIndexQuestion();
        } catch (error) {
            console.error("Lỗi khi lấy index câu hỏi:", error);
        }
    },

    // ham dem thoi gian
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

      const isCorrect = index === 'correct';
      const selectedOption = isCorrect ? this.questions[this.currentQuestionIndex]?.correctAnswer : this.mixedOptions[index].answer;

      if (isCorrect) {
        this.answer = selectedOption + ' (TRUE)';
        const correctButton = this.$refs.buttons.find(button => button.innerText === this.questions[this.currentQuestionIndex]?.correctAnswer);

        if (correctButton) {
            correctButton.classList.add('correct');
        }
        
      } else {
        this.answer = selectedOption + ' (FALSE)';

        if (this.$refs.buttons[index]) {
          this.$refs.buttons[index].classList.add('wrong');
        }
      }

      this.$refs.buttons.forEach(button => {
        button.classList.add('disabled');
      });

      sendAnswer(this.username, this.currentQuestionIndex, this.questions[this.currentQuestionIndex].question, this.answer);
    },

    async sendAnswer(username, indexQuestion, question, answer) {
      await sendAnswer(username, indexQuestion, question, answer);
    },

    resetButtons() { 
      this.$refs.buttons.forEach(button => {
        button.classList.remove('correct', 'wrong', 'disabled');
        this.isAnswered = false;
      });
    },
  },

  beforeUnmount() {
    this.stopFetching();
  },

  watch: {
    currentQuestionIndex(newIndex) {
      this.mixOptions(newIndex);
      this.resetButtons(newIndex);
    },
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
  position: fixed;
  top: 15%;
  font-size: 40px;
  color: white;
  border-radius: 50px;
  background-color: #DD241D;
  width: 12%;
  height: 60px;
  font-weight: bolder;
  margin-bottom: 5%;
  line-height: 50px;
}

.question {
  margin-top: 10%;
  width: 80%;
}

.question-content {
  background-color: #003DA5;
  color: white; 
  border-radius: 25px;
  padding: 15px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 18px; 
  font-weight: bolder;
  text-align: left;
  padding-left: 30px;
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
  font-size: 24px;
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
  top: 1%;
  right: 35%;
}

.bird-2 {
  position: fixed;
  width: 15%;
  cursor: not-allowed;
  right: 0;
  top: 21%;
}
</style>