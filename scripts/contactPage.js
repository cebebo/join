users = [];
let userColors = {};
let overlay;

// Funktion zum Initialisieren der Anwendung; lädt Benutzerdaten und rendert die Benutzerinformationen
async function initContacts() {
  await loadUsers();
  renderUsersList();
  await loadLoginUser();
  renderLoginUserName("Contacts");
}

// Funktion zum Öffnen des Overlays
function openOverlay() {
  createOverlay();
  overlay.style.display = "block";
  const firstUser = users[0];
  if (firstUser) {
    renderUserInfo(firstUser);
  }
}

// Funktion zum Erstellen des Overlays
function createOverlay() {
  overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.style.display = "none";
  overlay.innerHTML = createOverlayContent();
  document.body.appendChild(overlay);
}

// Funktion zum Schließen des Overlays und Entfernen aus dem DOM
function closeOverlay() {
  overlay.style.display = "none";
  overlay.remove(); // Overlay aus dem DOM entfernen
}

// Funktion zum Generieren einer eindeutigen Farbe für einen neuen Benutzer
function generateUniqueColor() {
  const allColors = ["#FF5733","#FFC300","#DAF7A6","#9AECDB","#A3E4D7","#85C1E9","#A569BD","#F1948A","#B2BABB","#F0B27A"];
  const usedColors = Object.values(userColors);
  const availableColors = allColors.filter(
    (color) => !usedColors.includes(color)
  );
  const randomColor =
    availableColors[Math.floor(Math.random() * availableColors.length)];
  return randomColor;
}

// Funktion zum Hinzufügen eines neuen Benutzers
async function addNewUser() {
  const name = document.getElementById("newUserName").value;
  const email = document.getElementById("newUserEmail").value;
  const phone = document.getElementById("newUserPhone").value;
  const password = document.getElementById("newUserPass").value;
  const color = generateUniqueColor();
  if (name && email) {
    pushNewUserToUserlist(name, email, phone, password, color);
    window.location.href = "contactPage.html?msg=User added successfully.";
  } else {
    window.location.href = "contactPage.html?msg=Please fill in all fields.";
  }
}

// Neue Benutzerdaten in der Datenbank speichern
async function pushNewUserToUserlist(name, email, phone, password, color) {
  if (password == "") { password = "0000" };
  const newUser = { name, email, phone, password, color };
  users.push(newUser);
  await saveUsers();
  renderUsersList();
  clearInputs();
}

// Inputfelder im Popup leeren
function clearInputs() {
  document.getElementById("newUserName").value = "";
  document.getElementById("newUserEmail").value = "";
  document.getElementById("newUserPhone").value = "";
}

// Funktion zum Löschen eines Benutzers
async function deleteUser(name) {
  const index = users.findIndex((user) => user.name === name);
  if (index !== -1) {
    users.splice(index, 1);
  }
  await saveUsers();
  renderUsersList();
}

// Funktion zum Löschen der Benutzerinfo im userInfo-Element
function clearUserInfo() {
  const userInfoElement = document.getElementById("userInfo");
  userInfoElement.innerHTML = "";
}

// Funktion zum Rendern der Benutzerliste
async function renderUsersList() {
  const userListElement = document.getElementById("userList");
  userListElement.innerHTML = "";
  users.sort((a, b) => a.name.localeCompare(b.name));
  const groupedUsers = groupUsersByFirstLetter(users);
  assignUserColors(groupedUsers);
  renderGroupedUsers(userListElement, groupedUsers);
}

// Funktion zum Gruppieren von Benutzern nach dem ersten Buchstaben ihres Namens
function groupUsersByFirstLetter(users) {
  const groupedUsers = {};
  users.forEach((user) => {
    const firstLetter = user.name.charAt(0).toUpperCase();
    if (!(firstLetter in groupedUsers)) {
      groupedUsers[firstLetter] = [];
    }
    groupedUsers[firstLetter].push(user);
  });
  return groupedUsers;
}

// Funktion zum Zuweisen von Farben für jeden Benutzer
function assignUserColors(groupedUsers) {
  Object.keys(groupedUsers).forEach((letter) => {
    groupedUsers[letter].forEach((user) => {
      userColors[user.name] = getColorForUser(user.name);
    });
  });
}

// Funktion zum Rendern der gruppierten Benutzerliste
function renderGroupedUsers(userListElement, groupedUsers) {
  for (const letter in groupedUsers) {
    const usersStartingWithLetter = groupedUsers[letter];
    const letterHeader = document.createElement("h2");
    letterHeader.textContent = letter;
    userListElement.appendChild(letterHeader);
    usersStartingWithLetter.forEach((user) => {
      renderUser(userListElement, user);
    });
  }
}

let clickedUserItem = null; // Variable, um die zuletzt geklickte Zeile zu verfolgen

// Funktion zum Rendern eines einzelnen Benutzers
function renderUser(userListElement, user) {
  const userListItem = createUserListItem(user);
  userListElement.appendChild(userListItem);
}

// Füge die Klasse "user-list-item" hinzu
function createUserListItem(user) {
  const userListItem = document.createElement("li");
  userListItem.classList.add("user-list-item");
  const userNameListItem = createUserNameListItem(user.name, user); 
  userListItem.appendChild(userNameListItem); 
  userListItem.appendChild(createUserEmailListItem(user.email)); 
  userListItem.appendChild(createHorizontalLine()); 
  addHoverEffect(userListItem);
  addClickEffect(userListItem);
  return userListItem;
}

function addHoverEffect(element) {
  element.addEventListener("mouseover", () => {
    element.classList.add("hover-effect");
  });
  element.addEventListener("mouseout", () => {
    if (element !== clickedUserItem) {
      element.classList.remove("hover-effect");
    }
  });
}

function addClickEffect(element) {
  element.addEventListener("click", () => {
    if (clickedUserItem && clickedUserItem !== element) {
      clickedUserItem.classList.remove("hover-farbe", "hover-effect"); // Entferne den Effekt von der zuvor geklickten Zeile
    }
    element.classList.add("hover-farbe", "hover-effect"); // Füge den Effekt zur neu geklickten Zeile hinzu
    clickedUserItem = element; // Aktualisiere die zuletzt geklickte Zeile
  });
}

// Funktion zum Erstellen eines Listenelements für den Benutzernamen
let previousUserNameItem = null; // Variable, um den vorherigen geklickten Benutzernamen zu verfolgen

// Funktion zum Erstellen eines Listenelements für den Benutzernamen
function createUserNameListItem(name, user) {
  const userNameListItem = document.createElement("li");
  userNameListItem.textContent = name;
  userNameListItem.style = "list-style-type: none; margin-left: 20px; cursor: pointer;";
  userNameListItem.addEventListener("click", () => {
    if (previousUserNameItem) previousUserNameItem.style.color = "";
    userNameListItem.style.color = "white";
    previousUserNameItem = userNameListItem;
    renderUserInfo(user);
  });
  const initials = getInitials(name);
  userNameListItem.insertBefore(
    createInitialsCircle(initials, userColors[name]),
    userNameListItem.firstChild
  );
  return userNameListItem;
}

// Funktion zum Erstellen eines Listenelements für die E-Mail
function createUserEmailListItem(email) {
  const emailListItem = document.createElement("li");
  emailListItem.textContent = email;
  emailListItem.style.listStyleType = "none";
  emailListItem.style.marginLeft = "70px";
  emailListItem.style.color = "rgb(128, 189, 246)";
  return emailListItem;
}

// Funktion zum Hinzufügen von mehreren Elementen zu einem übergeordneten Element
function appendElements(parentElement, elements) {
  elements.forEach((element) => {
    parentElement.appendChild(element);
  });
}

// Funktion zum Erstellen einer horizontalen Linie
function createHorizontalLine() {
  return document.createElement("hr");
}

// Funktion zum Generieren einer Farbe basierend auf dem Benutzernamen
function getColorForUser(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
}

// Funktion zum Erstellen eines Kreises für die Initialen mit angegebener Farbe
function createInitialsCircle(initials, color) {
  const circle = document.createElement("div");
  circle.className = "initials-circle";
  circle.textContent = initials;
  circle.style.backgroundColor = color; 
  circle.style.color = "white"; 
  return circle;
}

// Funktion zum Generieren einer Farbe basierend auf dem Benutzernamen
function getColorForUser(username) {
  if (!username) {
    return "#000000";
  }
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
}

// Funktion zum Rendern der Benutzerinformationen mit Bearbeitungsfunktion
function renderUserInfo(user) {
  document.getElementById("userInfo").style = "z-index: 2";
  const contactIndex = users.findIndex((contact) => contact.name === user.name);
  const userInfoElement = document.getElementById("userInfo");
  userInfoElement.innerHTML = createUserInfoHTML(user, contactIndex);
}

function goBackToUserList() {
  document.getElementById("userInfo").style = "z-index: 0";
}

// Funktion zum Öffnen des Overlays für die Bearbeitung eines Benutzers
function openEditOverlay(index) {
  const user = users[index];
  createEditOverlay(user, index);
  overlay.style.display = "block";
}

// Funktion zum Erstellen des Overlays für die Bearbeitung eines Benutzers
function createEditOverlay(user, index) {
  if (overlay) {
    overlay.remove();
  }
  const overlayId = "editOverlay";
  overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.id = overlayId; // Eindeutige ID für das Overlay setzen
  overlay.style.display = "none";
  overlay.innerHTML = templateEditOverlay(user, index);
  document.body.appendChild(overlay);
}

// Funktion zum Speichern der Benutzerdaten im lokalen Speicher
async function saveUsers() {
  await setItem("users", JSON.stringify(users));
}

async function loadUsers() {
  const usersData = await getItem("users");
  if (usersData) {
    users = JSON.parse(usersData);
    if (users.length > 0) {
      passwordBackup = users[0].password || "";
      colorBackup = users[0].color || "";
    }
  } else {
    users = [];
    await saveUsers(); 
  }
}

// Funktion zum Bearbeiten eines Benutzers
async function editUser(i) {
  const name = document.getElementById("editUserName").value;
  const email = document.getElementById("editUserEmail").value;
  const phone = document.getElementById("editUserPhone").value;
  const password = document.getElementById("editUserPassword").value;
  if (name && email) {
    updateEditedUser(i, name, email, phone, password);
  } else {
    alert("Please fill in all fields.");
  }
}

async function updateEditedUser(i, name, email, phone, password) {
  users[i].name = name;
  users[i].email = email;
  users[i].password = password;
  users[i].phone = phone;
  const editedUser = await getUserData(name, email, phone, password, i);
  if (editedUser) {
    await saveUsers();
    updateUserList(editedUser, i);
    closeOverlay();
    window.location.href = "contactPage.html?msg=User updated successfully.";
  } else {
    window.location.href = "contactPage.html?msg=Failed to update user.";
  }
}

function messageContacts() {
  const urlMessage = new URLSearchParams(window.location.search);
  const msg = urlMessage.get("msg");
  if (msg) {
    document.getElementById("sucessBoxContacts").classList.remove("d-none");
    document.getElementById("sucessBoxContacts").innerHTML = msg;
  }
}

async function getUserData(name, email, phone, password, index) {
  const currentUser = users[index];
  const color = currentUser.color;
  const currentPassword = currentUser.password || "";
  const newPassword = password || currentPassword;

  return { name, email, phone, password: newPassword, color };
}

function updateUserList(editedUser, index) {
  users[index] = editedUser;
  saveUsers();
  renderUsersList();
}

// Funktion zum Erhalten der Initialen eines Benutzers
function getInitials(name) {
  const names = name.split(" ");
  const initials = names.map((name) => name.charAt(0)).join("");
  return initials;
}

