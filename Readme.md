# MME Quiz

Eine einfache Javascript-Quiz-Bibliothek zur Verwendung auf der [MME-Online-Seite](https://www.regensburger-forscher.de/mme). 

## Build

- `npm install`
- `npm run build`

## Quizfragen

Quizfragen werden in einer einfachen, an das *Markdown*-Format angelehnten Syntax formuliert (Siehe auch [Beispielquiz](./example-quiz.md)):

``` 
# Title
| Quiz Description

## Question
? Description or details on question
+ A correct answer
- A wrong answer
! An explantion for this question
```

## Usage

Nachdem die Javascript- und CSS-Dateien aus dem `dist`-Verzeichnis eingebunden worden sind, wird ein Quiz durch das Einfügen eines HTML-Elements mit der Klasse `mme-quiz-wrapper` in der HTML-Datei gestartet. Die Datei mit den Quizfragen wird über das Attribut `data-url` spezifiziert. Ein vollständiges Beispiel wird beim Bauen der Bibiothek im Ordner `demo` erstellt. 