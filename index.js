// A few key GLOBAL variables
// we are using the musicbrainz api to query search results for a particular artists' songs
const api = "https://musicbrainz.org/ws/2/";
let favNum = 0;

init();

// begins program execution
function init() {
    const searchForm = document.querySelector("#search-input");
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const searchArtist = searchForm.querySelector("input").value;
        const additionalFormatting = `recording?query=artist:"${searchArtist}"&limit=10&fmt=json`;

        apiQuery(api + additionalFormatting, searchArtist)
    });
}

// takes the api address and a value to search for, then loads the results
// parameters:
//   api - the api url address
//   searchValue - a string by which to search the api for
function apiQuery(api, searchValue) {
    fetch(api)
    .then((res) => res.json())
    .then((data) => {
      const resultList = document.querySelector("#result-container ul");
      resultList.innerHTML = "";
      resultList.textContent = `Potential song matches for "${searchValue}":`;

      data.recordings.forEach((recording) => displayResult(recording));

      const editForm = document.querySelector("#edit-form");

      editForm.addEventListener("submit", (e) => {
        e.preventDefault();

        makeSongEdits(editForm);
      });
    });
}

// function that takes a recording object from API and creates an li for it in the results area
// parameters:
//  recording - the recording object
//returns undefined
function displayResult(recording) {
  const resultList = document.querySelector("#result-container ul");

  const li = document.createElement("li");
  const liInformation = document.createElement("div");
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  const title = recording.title;
  let date = formatDate(recording["first-release-date"]);

  liInformation.textContent = `${title} (${date})`;
  li.append(liInformation);
  li.classList.add("search-result");

  // YOU WILL WANT POST REQUESTS TO USE THIS INFORMATION @ Sam

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  buttonContainer.append(saveBtn);

  li.append(buttonContainer);
  resultList.append(li);

  saveBtn.addEventListener("click", (e) => {
    saveSong(liInformation);
  });
}

// takes the form which edits a song in the favorites list and processes the requested changes
// parameters:
//   form: an HTML form element containing video-url and thumbnail fields
// returns undefined
function makeSongEdits(form) {
  const player = document.querySelector("#video-player");
  player.parentNode.classList.remove('hidden');
  const songURL = document.querySelector("#video-url").value;
  const songThumbnail = document.querySelector("#thumbnail").value;

  const iframe = document.createElement("iframe");

  player.innerHTML = `<iframe width="560" height="315" src="${songURL}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  player.classList.remove('hidden');

  const thumbnailIMG = document.createElement("img");
  thumbnailIMG.classList.add("thumbnail");
  thumbnailIMG.src = songThumbnail;

  // YOU WILL WANT PATCH REQUESTS TO USE THIS INFORMATION @ Sam

  const listItem = document.querySelector(
    `li[id="${form.getAttribute("current-index")}"]`
  );

  listItem.append(thumbnailIMG);

  form.classList.add("hidden");
}

// takes a date and verifies that it is not empty
// parameters:
//   date - a string representing a release date
// returns date or 'date not listed' if date is empty
function formatDate(date) {
  return (date === undefined) | (date === "") ? "date not listed" : date;
}

// takes a listItem and moves a copy it to the favorites list
// parameters:
//   listItem - li containing the title and first-release-date of a song
// returns undefined
function saveSong(listItem) {
  const newLI = document.createElement("li");
  const newLIInformation = document.createElement("div");
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  newLIInformation.textContent = listItem.textContent;
  newLI.append(newLIInformation);

  newLI.classList.add("search-result");

  const saveContainer = document.querySelector("#save-container ul");
  saveContainer.append(newLI);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  buttonContainer.append(deleteBtn);

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit song info";
  buttonContainer.append(editBtn);

  newLI.id = ++favNum;
  newLI.append(buttonContainer);

  editBtn.addEventListener("click", () => {
    const editForm = document.querySelector("#edit-form");
    editForm.classList.remove("hidden");
    editForm.setAttribute("current-index", newLI.id);
  });
}
