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

export default Helper;