(function () {
  'use strict';

  /* eslint-env browser */

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
              <div class="mme-quiz-spinner-info">Lade Quiz ...</div>`,
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

  /* eslint-env browser */

  const LINE_STARTS = {
    QuizTitle: "#",
    QuizDescription: "|",
    QuestionTitle: "##",
    QuestionDescription: "?",
    QuestionExplanation: "!",
    CorrectAnswer: "+",
    WrongAnswer: "-"
  };

  class Line {

    constructor(start, content) {
      this.start = start;
      this.content = content;
    }

    startsWith(text) {
      return this.start === text;
    }
  }

  function* Lines(text) {
    let lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let line = parseLine(lines[i]);
      yield line;
    }
  }

  function parseLine(line) {
    if (line === "") {
      return null;
    }
    return new Line(line.split(" ")[0], line.substring(line.indexOf(" ")));
  }

  function parseData(data) {
    let lines = Lines(data),
      result = {},
      currentQuestion = undefined;
    for (let line of lines) {
      if (line === null) {
        continue;
      }
      if (line.startsWith(LINE_STARTS.QuizTitle)) {
        result.title = line.content;
        result.description = lines.next().value.content;
        continue;
      }
      if (line.startsWith(LINE_STARTS.QuestionTitle)) {
        if (result.questions === undefined) {
          result.questions = [];
        }
        currentQuestion = result.questions[result.questions.push({}) - 1];
        currentQuestion.questionID = result.questions.length;
        currentQuestion.question = line.content;
        currentQuestion.answers = [];
        continue;
      }
      if (line.startsWith(LINE_STARTS.QuestionDescription)) {
        currentQuestion.description = line.content;
        continue;
      }
      if (line.startsWith(LINE_STARTS.QuestionExplanation)) {
        currentQuestion.explanation = line.content;
        continue;
      }
      if (line.startsWith(LINE_STARTS.CorrectAnswer)) {
        currentQuestion.answers.push({
          answerID: currentQuestion.answers.length,
          text: line.content,
          isCorrect: true
        });
        continue;
      }
      if (line.startsWith(LINE_STARTS.WrongAnswer)) {
        currentQuestion.answers.push({
          answerID: currentQuestion.answers.length,
          text: line.content,
          isCorrect: false
        });
        continue;
      }

    }
    return result;
  }

  class Helper {

    static loadData(url) {
      return new Promise(async function(resolve, reject) {
        let response = await fetch(url),
          data = await response.text(),
          result = parseData(data);
        resolve(result);
      });
    }

  }

  /* eslint-env browser */


  function showElement(el) {
    el.classList.remove("mme-quiz-hidden");
  }

  function hideElement(el) {
    el.classList.add("mme-quiz-hidden");
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
    hideElement(quiz.ui.startButton);
    hideElement(quiz.ui.nextButton);
    showElement(quiz.ui.checkButton);
    hideElement(quiz.ui.resultButton);
    hideElement(quiz.ui.resetButton);
  }

  function showAnswers(quiz, isLastQuestion) {
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
    hideElement(quiz.ui.startButton);
    hideElement(quiz.ui.checkButton);
    hideElement(quiz.ui.resetButton);
    if (isLastQuestion === false) {
      hideElement(quiz.ui.resultButton);
      showElement(quiz.ui.nextButton);
    } else {
      showElement(quiz.ui.resultButton);
    }
  }

  function showFinalResults(quiz) {
    quiz.el.querySelector(".mme-quiz-content").innerHTML = END_TEMPLATE;
    quiz.el.querySelector(".mme-quiz-correct-answers").innerHTML = quiz.correctAnswers;
    quiz.el.querySelector(".mme-quiz-number-of-questions").innerHTML = quiz.numberOfQuestions;
    hideElement(quiz.ui.startButton);
    hideElement(quiz.ui.checkButton);
    hideElement(quiz.ui.resultButton);
    hideElement(quiz.ui.nextButton);
    showElement(quiz.ui.resetButton);
  }

  function prepareUI(quiz) {
    quiz.el.innerHTML = HTML_TEMPLATE;
    quiz.ui = {
      startButton: quiz.el.querySelector(".mme-quiz-button.start"),
      checkButton: quiz.el.querySelector(".mme-quiz-button.check"),
      nextButton: quiz.el.querySelector(".mme-quiz-button.next"),
      resultButton: quiz.el.querySelector(".mme-quiz-button.result"),
      resetButton: quiz.el.querySelector(".mme-quiz-button.reset"),
    };
    quiz.ui.startButton.addEventListener("click", quiz.onStartButtonClicked.bind(
      quiz));
    quiz.ui.checkButton.addEventListener("click", quiz.onCheckButtonClicked.bind(
      quiz));
    quiz.ui.nextButton.addEventListener("click", quiz.onNextButtonClicked.bind(
      quiz));
    quiz.ui.resultButton.addEventListener("click", quiz.onFinished.bind(
      quiz));
    quiz.ui.resetButton.addEventListener("click", quiz.reset.bind(
      quiz));
    showElement(quiz.ui.startButton);
    hideElement(quiz.ui.checkButton);
    hideElement(quiz.ui.resultButton);
    hideElement(quiz.ui.nextButton);
    hideElement(quiz.ui.resetButton);

  }

  class Quiz {

    constructor(el) {
      this.el = el;
      this.reset();
    }

    reset() {
      let that = this;
      this.el.innerHTML = SPINNER_TEMPLATE;
      Helper.loadData(this.el.getAttribute("data-url")).then(function(data) {
        that.title = data.title;
        that.description = data.description;
        that.questions = data.questions;
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
      showAnswers(this, isLastQuestion);
    }

    onFinished() {
      showFinalResults(this);
    }

    onStartButtonClicked() {
      this.showNextQuestion();
    }

    onCheckButtonClicked() {
      this.showResultScreen();

    }

    onNextButtonClicked() {
      this.showNextQuestion();
    }

  }

  /* eslint-env browser */

  class MMEQuiz {
    static init() {
      let quizWrappers = document.querySelectorAll(".mme-quiz-wrapper");
      this.quizzes = [];
      for (let i = 0; i < quizWrappers.length; i++) {
        let tmp = new Quiz(quizWrappers[i]);
        if (tmp) {
          this.quizzes.push(tmp);
        }
      }
    }
  }

  window.MMEQuiz = MMEQuiz;
  MMEQuiz.init();

}());
//# sourceMappingURL=mme-quiz.js.map
