/* eslint-env browser */

import Quiz from "./quiz/Quiz.js";

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