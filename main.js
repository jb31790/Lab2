function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return variable;
}

document.addEventListener("DOMContentLoaded", () => {
  let session = getCookie("session_id");

  if (session == "") {
    signin.showModal();
    document
      .getElementById("signInForm")
      .addEventListener("submit", submitSignIn);
  }

  if (window.location.pathname.includes("/quizPlayer.html")) {
    let quizName = getQueryVariable("quiz");
    let showCorrect = getQueryVariable("showCorrect");

    loadQuiz(quizName, showCorrect);
  }
});

function verifyFormField(field, regex, answer) {
  if (!field.value.match(regex)) {
    field.style["border"] = " 2px solid red";
    field.value = "";
    field.placeholder = answer;
    return false;
  }
  return true;
}

function submitSignIn(event) {
  event.preventDefault();
  let firstName = document.getElementById("inputFirstname");
  let lastName = document.getElementById("inputLastname");
  let email = document.getElementById("inputEmail");

  let initials = "";

  const nameRE = new RegExp("[A-zåäöÅÄÖ]+");
  const mailRE = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$");

  if (!lastName.value.match(nameRE)) {
    lastName.style["border"] = " 2px solid red";
    lastName.value = "";
    lastName.placeholder = "Name can only contain letters";
    return;
  }

  if (
    !(
      verifyFormField(firstName, nameRE, "Name can only contain letters") &&
      verifyFormField(lastName, nameRE, "Name can only contain letters") &&
      verifyFormField(email, mailRE, "Not a valid email")
    )
  ) {
    return false;
  }

  initials += firstName.value[0];
  initials += lastName.value[0];

  document.getElementById("userInitials").innerHTML = initials;

  let userInfo = `{ "firstName": "${firstName.value}", "lastName": "${lastName.value}", "email": "${email.value}" }`;

  setCookie("session_id", btoa(userInfo), 100);
  signin.close();
}

function capitalize(s) {
  return String(s[0]).toUpperCase() + String(s).slice(1);
}

function loadQuiz(quizName, showCorrect) {
  let quiz;

  if (showCorrect == "true") {
    showCorrect = true;
  } else {
    showCorrect = false;
  }

  fetch(`quizzes/quiz_${quizName}.json`)
    .then((response) => response.json())
    .then((data) => {
      quiz = JSON.stringify(data);
      quiz = data;

      document.getElementById("quizName").innerText =
        `Taking Quiz: ${capitalize(quizName)}`;

      for (let i = 0; i < quiz["questions"].length; i++) {
        let questionObject = quiz["questions"][i];
        let question = questionObject["question"];
        let qNum = i + 1;

        let questionContainer = document.createElement("div");
        questionContainer.className = "form-group";
        let qTitle = document.createElement("h5");
        qTitle.innerText = `Question ${qNum}: ${question} `;
        // qTitle.setAttribute("for", `q${qNum}`);

        if (questionObject["mandatory"]) {
          let mandatoryBadge = document.createElement("span");
          mandatoryBadge.setAttribute("class", "badge text-bg-info");
          if (showCorrect) {
            mandatoryBadge.setAttribute("class", "badge text-bg-success");
          }
          mandatoryBadge.innerText = "Required";
          ("k");
          // qTitle.appendChild(document.createElement("br"));
          qTitle.appendChild(mandatoryBadge);
        }

        questionContainer.appendChild(qTitle);

        if (questionObject["type"] == "single_choice") {
          let options = questionObject["options"];

          for (let f = 0; f < options.length; f++) {
            let qInput = document.createElement("input");
            let checkContainer = document.createElement("div");
            checkContainer.className = "form-check form-group";

            let qTitle = document.createElement("label");
            qTitle.innerText = `Question ${qNum}: ${question}`;

            qInput.setAttribute("id", `q${qNum}`);
            qInput.setAttribute("name", `q${qNum}`);
            qInput.setAttribute("class", "form-check-input");
            qInput.setAttribute("type", "radio");
            if (showCorrect) {
              if (questionObject["correct_answer"] == f) {
                qInput.checked = true;
              }
              qInput.setAttribute("disabled", "");
            }

            let qLabel = document.createElement("label");

            qLabel.setAttribute("for", `q${qNum}`);
            qLabel.setAttribute("class", "form-check-label");
            qLabel.innerText = options[f];
            checkContainer.appendChild(qInput);
            checkContainer.appendChild(qLabel);

            questionContainer.appendChild(checkContainer);
          }
        }

        if (questionObject["type"] == "multiple_choice") {
          let options = questionObject["options"];

          for (let f = 0; f < options.length; f++) {
            let qInput = document.createElement("input");
            let checkContainer = document.createElement("div");
            checkContainer.className = "form-check form-group";

            let qTitle = document.createElement("label");
            qTitle.innerText = `Question ${qNum}: ${question}`;

            qInput.setAttribute("id", `q${qNum}`);
            qInput.setAttribute("name", `q${qNum}`);
            qInput.setAttribute("class", "form-check-input");
            qInput.setAttribute("type", "checkbox");

            if (showCorrect) {
              if (questionObject["correct_answer"].includes(f)) {
                qInput.checked = true;
              }
              qInput.setAttribute("disabled", "");
            }

            let qLabel = document.createElement("label");

            qLabel.setAttribute("for", `q${qNum}`);
            qLabel.setAttribute("class", "form-check-label");
            qLabel.innerText = options[f];
            checkContainer.appendChild(qInput);
            checkContainer.appendChild(qLabel);

            questionContainer.appendChild(checkContainer);
          }
        }

        if (questionObject["type"] == "free_text") {
          let qInput = document.createElement("input");
          let checkContainer = document.createElement("div");
          checkContainer.className = "form-group";

          let qTitle = document.createElement("label");
          qTitle.innerText = `Question ${qNum}: ${question}`;

          qInput.setAttribute("id", `q${qNum}`);
          qInput.setAttribute("name", `q${qNum}`);
          qInput.setAttribute("class", "form-control");
          qInput.setAttribute("type", "text");
          if (showCorrect) {
            qInput.value = questionObject["correct_answer"];
            qInput.setAttribute("disabled", "");
          }

          let qLabel = document.createElement("label");

          qLabel.setAttribute("for", `q${qNum}`);
          checkContainer.appendChild(qInput);
          checkContainer.appendChild(qLabel);

          questionContainer.appendChild(checkContainer);
        }

        questionContainer.appendChild(document.createElement("br"));
        questionContainer.appendChild(document.createElement("br"));

        document.getElementById("quiz").appendChild(questionContainer);
      }

      if (showCorrect) {
        let nextBtn = document.createElement("a");
        nextBtn.setAttribute("class", "btn btn-primary btn-lg btn-block");
        nextBtn.setAttribute("id", "nextBtn");
        // nextBtn.addEventListener("click", finishQuiz);
        nextBtn.innerText = "Take another quiz";
        nextBtn.href = "index.html";

        document.getElementById("quiz").appendChild(nextBtn);
        return;
      }
      let finishBtn = document.createElement("button");
      finishBtn.innerText = "Finish Quiz";
      finishBtn.setAttribute("class", "btn btn-primary btn-lg btn-block");
      finishBtn.setAttribute("id", "finishBtn");
      finishBtn.addEventListener("click", finishQuiz);

      document.getElementById("quiz").appendChild(finishBtn);
    });
}

function finishQuiz(event) {
  event.preventDefault();

  let quizName = getQueryVariable("quiz");

  fetch(`quizzes/quiz_${quizName}.json`)
    .then((response) => response.json())
    .then((data) => {
      quiz = JSON.stringify(data);
      quiz = data;

      let quizResults = new Object();
      let b = 0;
      let requiredNotFound = true;

      for (let i = 0; i < quiz["questions"].length; i++) {
        let questionObject = quiz["questions"][i];
        let qNum = i + 1;

        let ans = [];

        let quizAnswerNode = document.querySelectorAll(`[name="q${qNum}"]`);

        for (let f = 0; f < quizAnswerNode.length; f++) {
          let val = quizAnswerNode[f].value;

          // console.log(quizAnswerNode[f]);
          if (val == "on") {
            if (quizAnswerNode[f].checked) {
              val = f;
            } else {
              continue;
            }
          }
          ans.push(val);
        }

        if (questionObject["mandatory"]) {
          let badge = document.getElementsByClassName("badge")[b];
          if (ans == "" || ans == []) {
            badge.setAttribute("class", "badge text-bg-danger");

            if (requiredNotFound) {
              badge.scrollIntoView();
              requiredNotFound = false;
            }
          } else {
            badge.setAttribute("class", "badge text-bg-info");
          }
          b++;
        }
        if (ans != "" && ans != []) {
          let correct = questionObject["correct_answer"];

          if (
            JSON.stringify([correct]) === JSON.stringify(ans) ||
            JSON.stringify(correct) === JSON.stringify(ans)
          ) {
            quizResults[qNum] = true;
          } else {
            quizResults[qNum] = false;
          }
        } else {
          quizResults[qNum] = false;
        }
      }
      if (!requiredNotFound) {
        return;
      }

      loadResults(quizResults);
    });
}

function loadResults(resultsObj) {
  let quizName = getQueryVariable("quiz");

  document.getElementById("resultSubtitle").innerText =
    `The results from taking quiz: ${capitalize(quizName)}`;
  let questionCount = Object.keys(resultsObj).length;
  let trueCount = Object.values(resultsObj).reduce(
    (count, value) => count + (value ? 1 : 0),
    0,
  );
  let scorePercentage = Math.round((trueCount / questionCount) * 100);

  console.log(resultsObj);
  results.showModal();

  let bar = document.getElementById("progressBar");
  bar.innerText = bar.style["width"] = scorePercentage + "%";

  document.getElementById("backToQuiz").addEventListener("click", hideResults);
}

function hideResults(event) {
  event.preventDefault();
  results.close();
}
