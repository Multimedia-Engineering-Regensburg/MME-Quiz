/* eslint-env browser */

(function() {

  const HTML_TEMPLATE =
    `<div class="mme-quiz-content">
  </div>
  <div class="mme-quiz-menu">
  	<span class="mme-quiz-button start">Start</span>
  	<span class="mme-quiz-button check">Weiter</span>
  	<span class="mme-quiz-button next">Nächste Frage</span>
  	<span class="mme-quiz-button result">Ergebnisse</span>
  	<span class="mme-quiz-button reset">Neustart</span>
  </div>`,
    SPINNER_TEMPLATE =
    `<div class="mme-quiz-spinner">
  						<div></div>
  						<div></div>
  						<div></div>
  						</div>
  					  <div class="mme-quiz-spinner-info">Lade Quiz ...</div>`
  TITLE_TEMPLATE =
    `<span class="mme-quiz-title"></span><span class="mme-quiz-description"></span>`,
    QUESTION_TEMPLATE =
    `<span class="mme-quiz-title"></span><span class="mme-quiz-description"></span><ul class="mme-quiz-answers"></ul><span class="mme-quiz-explanation"></span>`,
    ANSWER_TEMPLATE =
    `<li data-question-id>
    		<label class="mme-quiz-answer-container"><span class="mme-quiz-answer-text"></span>
  				<input type="checkbox">
  				<span class="mme-quiz-answer-checkmark"></span>
  				<span class="mme-quiz-answer-result"></span>
			</label>
		</li>`,
    END_TEMPLATE =
    `<span class="mme-quiz-result-title">Ergebnisse</span><span class="mme-quiz-result-text">Sie haben <span class="mme-quiz-correct-answers"></span> von <span class="mme-quiz-number-of-questions"></span> Fragen korrekt beanwortet.</span>`;


  var MMEQuiz,
    quizzes;

  function loadData(url) {
    return new Promise(async function(resolve, reject) {
      let response = await fetch(url),
        data = await response.text();
      resolve(data);
    });
  }

  function parseData(data) {
    let lines = data.split("\n"),
      result = {},
      currentQuestion = undefined;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line === "") {
        continue;
      }
      if (line.startsWith("# ")) {
        result.title = line.split("# ")[1];
        result.description = lines[++i];
        continue;
      }
      if (line.startsWith("## ")) {
        if (result.questions === undefined) {
          result.questions = [];
        }
        currentQuestion = result.questions[result.questions.push({}) - 1];
        currentQuestion.questionID = result.questions.length;
        currentQuestion.question = line.split("## ")[1];
        currentQuestion.answers = [];
        continue;
      }
      if (line.startsWith("? ")) {
        currentQuestion.description = line.split("? ")[1];
        continue;
      }
      if (line.startsWith("! ")) {
        currentQuestion.explanation = line.split("! ")[1];
        continue;
      }
      if (line.startsWith("+ ")) {
        currentQuestion.answers.push({
          answerID: currentQuestion.answers.length,
          text: line.split("+ ")[1],
          isCorrect: true
        });
        continue;
      }
      if (line.startsWith("- ")) {
        currentQuestion.answers.push({
          answerID: currentQuestion.answers.length,
          text: line.split("- ")[1],
          isCorrect: false
        });
        continue;
      }
    }
    return result;
  }

  function showStartScreen(quiz) {
    quiz.el.querySelector(".mme-quiz-content").innerHTML = TITLE_TEMPLATE;
    quiz.el.querySelector(".mme-quiz-title").innerHTML = quiz.title;
    quiz.el.querySelector(".mme-quiz-description").innerHTML = quiz.description;
  }

  function showCurrenQuestion(quiz) {
    let answerList;
    quiz.el.querySelector(".mme-quiz-content").innerHTML = QUESTION_TEMPLATE;
    quiz.el.querySelector(".mme-quiz-title").innerHTML = quiz.currentQuestion
      .question;
    quiz.el.querySelector(".mme-quiz-description").innerHTML = quiz.currentQuestion
      .description;
    answerList = quiz.el.querySelector(".mme-quiz-answers");
    for (let i = 0; i < quiz.currentQuestion.answers.length; i++) {
      let answer = quiz.currentQuestion.answers[i],
        answerEl = document.createElement("div");
      answerEl.innerHTML = ANSWER_TEMPLATE;
      answerEl.querySelector("li").setAttribute("data-answer-id", answer.answerID);
      answerEl.querySelector(".mme-quiz-answer-text").innerHTML = answer.text;
      answerList.appendChild(answerEl.firstChild);
    }
    quiz.ui.startButton.classList.add("mme-quiz-hidden");
    quiz.ui.nextButton.classList.add("mme-quiz-hidden");
    quiz.ui.checkButton.classList.remove("mme-quiz-hidden");
  }

  function markAnswers(quiz, isLastQuestion) {
    let answerElements = quiz.el.querySelectorAll("li"),
      passed = true;
    for (let i = 0; i < answerElements.length; i++) {
      let answer = quiz.currentQuestion.answers[answerElements[i].getAttribute(
          "data-answer-id")],
        wasAnsweredCorrect = (answerElements[i].querySelector("input").checked ===
          answer.isCorrect),
        isCorrectAnswer = answerElements[i].querySelector("input").checked ===
        true && answer.isCorrect === true,
        isWrongAnswer = answerElements[i].querySelector("input").checked ===
        true && answer.isCorrect === false;

      if (wasAnsweredCorrect === false) {
        passed = false;
      }
      if (isCorrectAnswer === true) {
        answerElements[i].querySelector(".mme-quiz-answer-result").innerHTML =
          "Korrekt!";
        answerElements[i].querySelector(".mme-quiz-answer-result").classList.add(
          "correct-answer");
        answerElements[i].querySelector(".mme-quiz-answer-result").classList.remove(
          "wrong-answer");
      }
      if (isWrongAnswer === true) {
        answerElements[i].querySelector(".mme-quiz-answer-result").classList.add(
          "wrong-answer");
        answerElements[i].querySelector(".mme-quiz-answer-result").classList.remove(
          "correct-answer");
        answerElements[i].querySelector(".mme-quiz-answer-result").innerHTML =
          "Falsch!";
      }
    }
    if (passed === true) {
      quiz.correctAnswers += 1;
    }
    quiz.el.querySelector(".mme-quiz-explanation").innerHTML = quiz.currentQuestion
      .explanation;
    quiz.ui.checkButton.classList.add("mme-quiz-hidden");
    if (isLastQuestion === false) {
      quiz.ui.nextButton.classList.remove("mme-quiz-hidden");
    } else {
      quiz.ui.resultButton.classList.remove("mme-quiz-hidden");
    }
  }

  function showFinalResults(quiz) {
    quiz.el.querySelector(".mme-quiz-content").innerHTML = END_TEMPLATE;
    quiz.el.querySelector(".mme-quiz-correct-answers").innerHTML = quiz.correctAnswers;
    quiz.el.querySelector(".mme-quiz-number-of-questions").innerHTML = quiz.numberOfQuestions;
    quiz.ui.resultButton.classList.add("mme-quiz-hidden");
    quiz.ui.resetButton.classList.remove("mme-quiz-hidden");
  }

  function prepareUI(quiz) {
    quiz.el.innerHTML = HTML_TEMPLATE;
    quiz.ui = {
      startButton: quiz.el.querySelector(".mme-quiz-button.start"),
      checkButton: quiz.el.querySelector(".mme-quiz-button.check"),
      nextButton: quiz.el.querySelector(".mme-quiz-button.next"),
      resultButton: quiz.el.querySelector(".mme-quiz-button.result"),
      resetButton: quiz.el.querySelector(".mme-quiz-button.reset"),
    }
    quiz.ui.startButton.addEventListener("click", quiz.onStartButtonClicked.bind(
      quiz));
    quiz.ui.checkButton.addEventListener("click", quiz.onCheckButtonClicked.bind(
      quiz));
    quiz.ui.checkButton.classList.add("mme-quiz-hidden");
    quiz.ui.nextButton.addEventListener("click", quiz.onNextButtonClicked.bind(
      quiz));
    quiz.ui.nextButton.classList.add("mme-quiz-hidden");
    quiz.ui.resultButton.addEventListener("click", quiz.onFinished.bind(
      quiz));
    quiz.ui.resultButton.classList.add("mme-quiz-hidden");
    quiz.ui.resetButton.addEventListener("click", quiz.reset.bind(
      quiz));
    quiz.ui.resetButton.classList.add("mme-quiz-hidden");
  }

  class Quiz {

    constructor(el) {
      let that = this;
      this.el = el;
      this.reset();
    }

    reset() {
      let that = this;
      this.el.innerHTML = SPINNER_TEMPLATE;
      loadData(this.el.getAttribute("data-url")).then(function(data) {
        let properties = parseData(data);
        that.title = properties.title;
        that.description = properties.description;
        that.questions = properties.questions;
        that.numberOfQuestions = that.questions.length;
        that.correctAnswers = 0;
        prepareUI(that);
        showStartScreen(that);
      });
    }

    showNextQuestion() {
      if (this.questions.length === 0) {
        return;
      }
      this.currentQuestion = this.questions.shift();
      showCurrenQuestion(this);
    }

    showResultScreen() {
      let isLastQuestion = this.questions.length === 0;
      markAnswers(this, isLastQuestion);
    }


    start() {
      this.showNextQuestion();
    }

    onFinished() {
      console.log("Finished");
      showFinalResults(this);
    }

    onStartButtonClicked() {
      console.log("start button clicked");
      this.start();
    }

    onCheckButtonClicked() {
      console.log("check button clicked");
      this.showResultScreen();

    }

    onNextButtonClicked() {
      console.log("next button clicked");
      this.showNextQuestion();
    }

  }

  MMEQuiz = {};
  MMEQuiz.init = function() {
    let quizWrappers = document.querySelectorAll(".mme-quiz-wrapper");
    quizzes = [];
    for (let i = 0; i < quizWrappers.length; i++) {
      let _quiz = new Quiz(quizWrappers[i]);
      if (_quiz) {
        quizzes.push(_quiz);
      }
    }
  };

  window.MMEQuiz = MMEQuiz;
}());

MMEQuiz.init();