/* eslint-env browser */

import * as Templates from "../ui/Templates.js";
import Helper from "./Helper.js";


function showElement(el) {
  el.classList.remove("mme-quiz-hidden");
}

function hideElement(el) {
  el.classList.add("mme-quiz-hidden");
}

function showStartScreen(quiz) {
  quiz.el.querySelector(".mme-quiz-content").innerHTML = Templates.Title;
  quiz.el.querySelector(".mme-quiz-title").innerHTML = quiz.title;
  quiz.el.querySelector(".mme-quiz-description").innerHTML = quiz.description;
}

function showCurrenQuestion(quiz) {
  let answerList;
  quiz.el.querySelector(".mme-quiz-content").innerHTML = Templates.Question;
  quiz.el.querySelector(".mme-quiz-title").innerHTML = quiz.currentQuestion
    .question;
  quiz.el.querySelector(".mme-quiz-description").innerHTML = quiz.currentQuestion
    .description;
  answerList = quiz.el.querySelector(".mme-quiz-answers");
  for (let i = 0; i < quiz.currentQuestion.answers.length; i++) {
    let answer = quiz.currentQuestion.answers[i],
      answerEl = document.createElement("div");
    answerEl.innerHTML = Templates.Answer;
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
  quiz.el.querySelector(".mme-quiz-content").innerHTML = Templates.End;
  quiz.el.querySelector(".mme-quiz-correct-answers").innerHTML = quiz.correctAnswers;
  quiz.el.querySelector(".mme-quiz-number-of-questions").innerHTML = quiz.numberOfQuestions;
  hideElement(quiz.ui.startButton);
  hideElement(quiz.ui.checkButton);
  hideElement(quiz.ui.resultButton);
  hideElement(quiz.ui.nextButton);
  showElement(quiz.ui.resetButton);
}

function prepareUI(quiz) {
  quiz.el.innerHTML = Templates.Html;
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
    let that = this;
    this.el = el;
    this.reset();
  }

  reset() {
    let that = this;
    this.el.innerHTML = Templates.Spinner;
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

export default Quiz;