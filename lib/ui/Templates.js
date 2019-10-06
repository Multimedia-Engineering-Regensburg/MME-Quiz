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

  export {HTML_TEMPLATE as Html, SPINNER_TEMPLATE as Spinner, TITLE_TEMPLATE as Title, QUESTION_TEMPLATE as Question, ANSWER_TEMPLATE as Answer, END_TEMPLATE as End};