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

  let array = ["penguins", "banana", "javascript"];

  for (let i = 0; i < array.length; i++) {
    const name = array[i];
    if (!localStorage.getItem(`quiz-${name}`)) {
      fetch(`quizzes/quiz_${name}.json`)
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem(`quiz-${name}`, JSON.stringify(data));
        });
    }
  }

  if (window.location.pathname.includes("/quizPlayer.html")) {
    let quizName = getQueryVariable("quiz");
    let showCorrect = getQueryVariable("showCorrect");

    loadQuiz(quizName, showCorrect);
  } else if (window.location.pathname.includes("/index.html")) {
    loadSelector();
  } else if (window.location.pathname.includes("/quizCreator.html")) {
    loadCreator();
  } else {
    window.location.replace("index.html");
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

  quiz = JSON.parse(localStorage.getItem(`quiz-${quizName}`));

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
        let checkContainer = document.createElement("div");
        checkContainer.className = "form-check form-group";

        let qTitle = document.createElement("label");
        qTitle.innerText = `Question ${qNum}: ${question}`;

        let qInput = document.createElement("input");
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
}

function finishQuiz(event) {
  event.preventDefault();

  let quizName = getQueryVariable("quiz");

  quiz = JSON.parse(localStorage.getItem(`quiz-${quizName}`));

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

  results.showModal();

  let bar = document.getElementById("progressBar");
  bar.innerText = bar.style["width"] = scorePercentage + "%";

  document.getElementById("backToQuiz").addEventListener("click", hideResults);
  document
    .getElementById("showCorrect")
    .addEventListener("click", showCorrectAnswers);
}

function hideResults(event) {
  event.preventDefault();
  results.close();
}

function showCorrectAnswers(event) {
  event.preventDefault();
  let quizName = getQueryVariable("quiz");
  window.location.replace(
    `quizPlayer.html?quiz=${quizName}&showCorrect=true#top`,
  );
}

function loadSelector() {
  let content = document.getElementById("content");

  let presetQuizzes = {
    javascript: {
      name: "javascript",
      description: "Test your javascript-knowledge in this wonderful quiz",
      imgLink:
        "https://cdn.pixabay.com/photo/2016/03/27/18/54/technology-1283624_1280.jpg",
    },
    banana: {
      name: "banana",
      description: "How much do you know about this yellow'n'yummy fruit?",
      imgLink:
        "https://cdn.pixabay.com/photo/2017/01/03/11/25/banana-1949166_640.jpg",
    },
    penguins: {
      name: "penguins",
      description: "They're cute, flightless birds. That's all I know...",
      imgLink:
        "https://cdn.pixabay.com/photo/2017/02/27/20/31/penguin-2104173_640.jpg",
    },
    create: {
      name: "Create New Quiz",
      description: "Create Your Own Quiz",
      imgLink:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.wxkLJWWdTXudrfvhJbf6LAHaHa%26pid%3DApi&f=1&ipt=7bae420bdae14c166031c0940555280dcf18578525c7ec5cf87733355d372db2&ipo=images",
    },
  };

  let quizMetadata = JSON.parse(localStorage.getItem("quizMetadata"));

  if (quizMetadata == null) {
    quizMetadata = presetQuizzes;
    localStorage.setItem("quizMetadata", JSON.stringify(quizMetadata));
  }
  quizMetadata = Object.values(quizMetadata);

  for (let i = 0; i < quizMetadata.length; i++) {
    let card = document.createElement("div");
    card.setAttribute("class", "card");
    card.style["width"] = "18rem";

    let img = document.createElement("img");
    let imgLink = quizMetadata[i]["imgLink"];
    img.setAttribute("src", imgLink);
    img.setAttribute("class", "card-img-top");
    card.appendChild(img);

    let body = document.createElement("div");
    body.setAttribute("class", "card-body");

    let title = document.createElement("h5");
    title.setAttribute("class", "card-title");
    title.innerText = capitalize(quizMetadata[i]["name"]);
    body.appendChild(title);

    let p = document.createElement("p");
    p.setAttribute("class", "card-text");
    p.innerText = capitalize(quizMetadata[i]["description"]);
    body.appendChild(p);

    let btn = document.createElement("a");
    btn.setAttribute("class", "btn btn-primary");
    btn.setAttribute("href", `quizPlayer.html?quiz=${quizMetadata[i]["name"]}`);
    btn.innerText = "Take Quiz";

    if (quizMetadata[i]["name"] == "Create New Quiz") {
      btn.innerText = "Create Quiz";
      btn.setAttribute("href", "quizCreator.html");
    }
    body.appendChild(btn);

    let editBtn = document.createElement("a");
    editBtn.setAttribute("class", "btn btn-secondary");
    editBtn.style["margin-left"] = "0.5em";
    editBtn.setAttribute(
      "href",
      `quizCreator.html?edit=${quizMetadata[i]["name"]}`,
    );
    editBtn.innerText = "Edit Quiz";

    if (quizMetadata[i]["name"] == "Create New Quiz") {
      editBtn.innerText = "Create Quiz";
      editBtn.setAttribute("href", "quizCreator.html");
    } else {
      body.appendChild(editBtn);
    }

    card.appendChild(body);
    content.appendChild(card);
  }
}

function loadCreator() {
  setCookie("q", 0, 100);

  let allQuizMetadata = JSON.parse(localStorage.getItem("quizMetadata"));

  const quizName = getQueryVariable("edit");

  if (Object.keys(localStorage).includes(`quiz-${quizName}`)) {
    let quiz = JSON.parse(localStorage.getItem(`quiz-${quizName}`));
    let questions = quiz.questions;
    let form = document.getElementById("questions");

    let thisQuizMetadata = allQuizMetadata[quizName];
    document.getElementById("nameInput").value = thisQuizMetadata.name;
    document.getElementById("descInput").value = thisQuizMetadata.description;
    document.getElementById("linkInput").value = thisQuizMetadata.imgLink;

    for (let i = 0; i < questions.length; i++) {
      let questionContainer = document.createElement("div");
      questionContainer.setAttribute("class", "form-group question");

      let qTitle = document.createElement("h5");
      qNum = getCookie("q");
      qTitle.innerText = `Question ${qNum}`;
      qNum++;
      setCookie("q", qNum, 100);

      let qContent = document.createElement("div");
      qContent.setAttribute("class", "mb-3");

      let qNameLabel = document.createElement("label");
      qNameLabel.setAttribute("class", "form-label");
      qNameLabel.setAttribute("for", `q${qNum}`);
      qNameLabel.innerText = "Question:";
      qContent.appendChild(qNameLabel);

      let qNameInput = document.createElement("input");
      qNameInput.setAttribute("class", "form-control");
      qNameInput.setAttribute("type", "text");
      qNameInput.setAttribute("id", `q${qNum}`);
      qNameInput.value = questions[i]["question"];
      qContent.appendChild(qNameInput);

      let qMandatoryInput = document.createElement("input");
      qMandatoryInput.setAttribute("id", `q${qNum}-mandatory`);
      qMandatoryInput.setAttribute("name", `q${qNum}-mandatory`);
      qMandatoryInput.setAttribute("class", "form-check-input");
      qMandatoryInput.setAttribute("type", "checkbox");
      qMandatoryInput.checked = questions[i]["mandatory"];
      qContent.appendChild(qMandatoryInput);

      let qMandatoryLabel = document.createElement("label");
      qMandatoryLabel.setAttribute("for", `q${qNum}-mandatory`);
      qMandatoryLabel.setAttribute("class", "form-check-label");
      qMandatoryLabel.innerText = " Required Question";
      qContent.appendChild(qMandatoryLabel);

      questionContainer.appendChild(qTitle);
      questionContainer.appendChild(qContent);
      questionContainer.appendChild(document.createElement("br"));
      form.appendChild(questionContainer);
    }
  }

  if (quizName != "edit") {
    let delBtn = document.createElement("button");
    delBtn.setAttribute("class", "btn btn-danger");
    delBtn.setAttribute("type", "button");
    delBtn.innerText = "Delete Quiz";
    delBtn.addEventListener("click", deleteQuiz);
    document.getElementById("quizCreator").appendChild(delBtn);
  }

  document.getElementById("saveQuiz").addEventListener("click", saveQuiz);
  document.getElementById("addQ").addEventListener("click", function () {
    let form = document.getElementById("questions");

    let questionContainer = document.createElement("div");
    questionContainer.setAttribute("class", "form-group question");

    let qTitle = document.createElement("h5");
    qNum = getCookie("q");
    qTitle.innerText = `Question ${qNum}`;
    questionContainer.appendChild(qTitle);

    qNum++;
    setCookie("q", qNum, 100);

    let qContent = document.createElement("div");
    qContent.setAttribute("class", "mb-3");

    let qNameLabel = document.createElement("label");
    qNameLabel.setAttribute("class", "form-label");
    qNameLabel.setAttribute("for", `q${qNum}`);
    qNameLabel.innerText = "Question:";
    qContent.appendChild(qNameLabel);

    let qNameInput = document.createElement("input");
    qNameInput.setAttribute("class", "form-control");
    qNameInput.setAttribute("type", "text");
    qNameInput.setAttribute("id", `q${qNum}`);
    qContent.appendChild(qNameInput);

    let qMandatoryInput = document.createElement("input");
    qMandatoryInput.setAttribute("id", `q${qNum}-mandatory`);
    qMandatoryInput.setAttribute("name", `q${qNum}-mandatory`);
    qMandatoryInput.setAttribute("class", "form-check-input");
    qMandatoryInput.setAttribute("type", "checkbox");
    qContent.appendChild(qMandatoryInput);

    let qMandatoryLabel = document.createElement("label");
    qMandatoryLabel.setAttribute("for", `q${qNum}-mandatory`);
    qMandatoryLabel.setAttribute("class", "form-check-label");
    qMandatoryLabel.innerText = " Required Question";
    qContent.appendChild(qMandatoryLabel);

    questionContainer.appendChild(qContent);
    questionContainer.appendChild(document.createElement("br"));
    form.appendChild(questionContainer);

    questionContainer.appendChild(document.createElement("hr"));
    form.appendChild(questionContainer);
  });
}

function saveQuiz() {
  let allQuizMetadata = JSON.parse(localStorage.getItem("quizMetadata"));
  const quizName = document.getElementById("nameInput").value;

  // if (Object.keys(allQuizMetadata).includes(quizName)) {
  if (false) {
    alert("hehe");
    let newQuizMetadata = structuredClone(allQuizMetadata[quizName]);
    delete allQuizMetadata[quizName];

    newQuizMetadata.name = document.getElementById("nameInput").value;
    newQuizMetadata.description = document.getElementById("descInput").value;
    newQuizMetadata.imgLink = document.getElementById("linkInput").value;

    allQuizMetadata[quizName] = newQuizMetadata;
    localStorage.setItem("quizMetadata", JSON.stringify(allQuizMetadata));
  } else {
    let newQuizMetadata = {};
    let nameInput = document.getElementById("nameInput");
    let descInput = document.getElementById("descInput");
    let linkInput = document.getElementById("linkInput");

    let nameRE = new RegExp("[a-zA-ZåäöÅÄÖ0-9_-]+");

    if (!verifyFormField(nameInput, nameRE, "Invalid name")) {
      return;
    }

    if (descInput.value == "") {
      descInput.value = " ";
    }

    if (linkInput.value == "") {
      linkInput.value =
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.3JpFam4YU6Ki1Yn7QYsa7AHaHa%26pid%3DApi&f=1&ipt=4aa1cd5be8e5f2b4073e2abc0d4008d3a52f563b3c25c26ca604a188d2fe119d&ipo=images";
    }

    newQuizMetadata.name = nameInput.value;
    newQuizMetadata.description = descInput.value;
    newQuizMetadata.imgLink = linkInput.value;
    allQuizMetadata[nameInput.value] = newQuizMetadata;

    localStorage.setItem("quizMetadata", JSON.stringify(allQuizMetadata));

    localStorage.setItem(
      `quiz-${nameInput.value}`,
      JSON.stringify({ questions: [] }),
    );
  }

  let quiz = { questions: [] };
  let questions = quiz.questions;
  let formQuestions = document.getElementsByClassName("question");

  // for (let i = 0; i < array.length; i++) {
  //   // const element = array[index];
  // }
  window.location.replace("index.html");
}

function deleteQuiz() {
  let allQuizMetadata = JSON.parse(localStorage.getItem("quizMetadata"));
  let quizName = getQueryVariable("edit");

  delete allQuizMetadata[quizName];

  localStorage.setItem("quizMetadata", JSON.stringify(allQuizMetadata));

  console.log(localStorage.getItem("quizMetadata"));
  window.location.replace("index.html");
}
