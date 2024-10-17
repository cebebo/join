let amountTasks;
let amountToDo;
let amountDone;
let amountUrgent;
let amountProgress;
let amountFeedback;
let result;
let limitI;
let limitDone;

async function initSummary() {
    await loadTasksFromServer();
    await loadLoginUser();
    renderLoginUserName('Summary');
    greeting();
    amountTasks = tasks.length;
    amountToDo = checkAmountFromJSON(1, 'ToDo');
    amountDone = checkAmountFromJSON(1, 'Done');
    amountProgress = checkAmountFromJSON(1, 'InProgress');
    amountFeedback = checkAmountFromJSON(1, 'AwaitFeedback');
    amountUrgent = checkAmountFromJSON(2, 'urgent');
    fillSummary();
}

// Greets the user at the summary page.
function greeting() {
    let daytime = findOutDayTime();
    document.getElementById('greeting').innerHTML = daytime + ',';
    document.getElementById('userNameSummary').innerHTML = loginUser[0];
    if (loginUser[0] == '') { document.getElementById('greeting').innerHTML = daytime + '!'; }
}

// Shows the pop up message.
function messageSummary() {
    const urlMessage = new URLSearchParams(window.location.search);
    const msg = urlMessage.get("msg");
    if (msg) {
        document.getElementById("sucessBoxLogin").classList.remove("d-none");
        document.getElementById("sucessBoxLogin").innerHTML = msg;
    }
}

// Finds out the current day time.
function findOutDayTime() {
    let now = new Date().getHours();
    if (now >= 5 && now < 12) { now = 'Good morning' };
    if (now >= 12 && now < 18) { now = 'Good afternoon' };
    if (now >= 18 && now < 24) { now = 'Good evening' };
    if (now >= 0 && now < 5) { now = 'Good evening' };
    return now;
}

// Counting the tasks in each category.
function checkAmountFromJSON(category, value) {
    limitDone = 0;
    result = 0;
    limitI = -1;
    let actualDay = Date.parse(new Date());
    for (let i = 0; i < tasks.length; i++) {
        if (category == 1) {
            if (tasks[i].position == value) { result++; }
        }
        if (category == 2) {
            if (tasks[i].prio == value) { findMostUrgentTask(i, actualDay) }
        }
    }
    showMostUrgentTask();
    return result;
}

// Looks for the most urgent task.
function findMostUrgentTask(i, actualDay) {
    result++;
    let TaskDate = Date.parse(tasks[i].dueDate);
    let limit = TaskDate - actualDay;
    if (limitDone == 0 && limit >= 0) {
        limitDone = limit;
        limitI = i;
    };
    if (limit < limitDone && limit >= 0) {
        limitDone = limit;
        limitI = i;
    }
}

// Shows the most urgent task in the summary.
function showMostUrgentTask() {
    if (limitI >= 0) {
        document.getElementById('limitDate').innerHTML = tasks[limitI].dueDate;
        document.getElementById('limitTitle').innerHTML = tasks[limitI].titel;
        limitI = -1;
    }
}

// Fills the categories of the summary with the values.
function fillSummary() {
    document.getElementById('amountToDo').innerHTML = amountToDo;
    document.getElementById('amountDone').innerHTML = amountDone;
    document.getElementById('amountUrgent').innerHTML = amountUrgent;
    document.getElementById('amountTasks').innerHTML = amountTasks;
    document.getElementById('amountProgress').innerHTML = amountProgress;
    document.getElementById('amountFeedback').innerHTML = amountFeedback;
}

