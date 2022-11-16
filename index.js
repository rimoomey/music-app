// A few key GLOBAL variables
// we are using the musicbrainz api to query search results for a particular artists' songs

const api = "https://musicbrainz.org/ws/2/";
let favNum = 0;

// db.json url
const localHost = "http://localhost:3000/songs/";

init();

// begins program execution
function init() {
  displaySavedFavs(localHost); // refactored
  enableEditing(); // refactored

  const searchForm = document.querySelector("#search-input");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const searchArtist = searchForm.querySelector("input").value;
    const additionalFormatting = `recording?query=artist:"${searchArtist}"&limit=10&fmt=json`;

    apiQuery(api + additionalFormatting, searchArtist);
  });
}

// ********************* The Following Functions Handle GET Requests and Displaying Saved Songs *************************

function displaySavedFavs(api) {
  fetch(api)
    .then((res) => res.json())
    .then((data) => {
      data.forEach((song) => showFavoritedSong(song));
    });
}

function showFavoritedSong(song) {
  const li = createFavoriteListItem(song);
  const saveContainer = document.querySelector("#save-container ul");
  saveContainer.append(li);
}

function createFavoriteListItem(song) {
  const li = document.createElement("li");
  li.id = song.id;
  li.classList.add("favorite-song");

  const liInfo = document.createElement("div");
  liInfo.textContent = `${song.title} (${song.date})`;
  li.append(liInfo);

  if (song.thumbnail !== "") {
    displayThumbnail(li, song.thumbnail);
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  addFavoriteButtons(li, buttonContainer);
  li.append(buttonContainer);

  return li;
}

function addFavoriteButtons(li, buttonContainer) {
  const playBtn = document.createElement("button");
  playBtn.textContent = "Play";
  buttonContainer.append(playBtn);

  playBtn.addEventListener("click", () => {
    playVideo(localHost, li);
  });

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit song info";
  buttonContainer.append(editBtn);

  editBtn.addEventListener("click", () => {
    const editForm = document.querySelector("#edit-form");
    editForm.classList.remove("hidden");
    editForm.setAttribute("current-index", li.id);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  buttonContainer.append(deleteBtn);

  deleteBtn.addEventListener("click", () => {
    deleteSavedFavs(localHost, li);
  });
}

function displayThumbnail(li, thumbnailURL) {
  const currentThumbnail = li.querySelector("img");
  if (currentThumbnail !== null) {
    currentThumbnail.remove();
  }

  const img = document.createElement("img");
  img.classList.add("thumbnail");
  img.src = thumbnailURL;
  li.append(img);

  const buttonContainer = li.querySelector(".button-container");
  if (buttonContainer !== null) {
    buttonContainer.remove();
    const newButtonContainer = document.createElement("div");
    newButtonContainer.classList.add("button-container");
    addFavoriteButtons(li, newButtonContainer);
    li.append(newButtonContainer);
  }
}

// ************************* The Following Functions handle Editing and Redisplaying Song Information ************************

function enableEditing() {
  const editForm = document.querySelector("#edit-form");
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    makeSongEdits(editForm);
  });
}

// takes the form which edits a song in the favorites list and processes the requested changes
// parameters:
//   form: an HTML form element containing video-url and thumbnail fields
// returns undefined
function makeSongEdits(editForm) {
  editForm.classList.add("hidden");

  const newVideoURL = document.querySelector("#video-url").value;
  const newThumbnail = document.querySelector("#thumbnail").value;

  const favoritedLI = document.querySelector(
    `li[id="${editForm.getAttribute("current-index")}"]`
  );

  fetch(`${localHost}${favoritedLI.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      thumbnail: `${newThumbnail}`,
      videoURL: `${newVideoURL}`,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      if(newThumbnail !== '') {
        displayThumbnail(favoritedLI, newThumbnail)
      }
    });
}

// ******************** Single Delete Function ***********************
function deleteSavedFavs(api, li) {
  fetch(api + `${li.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((resp) => resp.json())
    .then(li.remove());
}

// ********************* The following functions handle querying MusicBrainz api and displaying results, as well as saving mechanics ***************************

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

      data.recordings.forEach((song) => displayResult(song));
    });
}

// function that takes a recording object from API and creates an li for it in the results area
// parameters:
//  recording - the recording object
//returns undefined
function displayResult(song) {
  const resultList = document.querySelector("#result-container ul");
  const li = createSearchLI(song);
  resultList.append(li);
}

function createSearchLI(song) {
  const li = document.createElement("li");
  const liInformation = document.createElement("div");
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  console.log(song);

  liInformation.textContent = `${song.title} (${formatDate(song['first-release-date'])})`;

  li.append(liInformation);
  li.classList.add("search-result");

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.addEventListener('click', () => save(song))
  buttonContainer.append(saveBtn);

  li.append(buttonContainer);

  return li;
}

function save(song) {
  fetch(localHost, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: `${song.title}`,
      date: `${song['first-release-date']}`,
      thumbnail: '',
      videoURL: ''
    }),
  })
    .then((res) => res.json())
    .then((song) => {
      showFavoritedSong(song);
    });
}

// ********************* Creates a video box to play the saved song for a given favorited list item *****************

function playVideo(localHost, favoritedSong) {
  fetch(`${localHost}${favoritedSong.id}`)
    .then((res) => res.json())
    .then((song) => {
      if (song.videoURL !== '') {
        const player = document.querySelector("#video-player");
        player.parentNode.classList.remove("hidden");
        player.innerHTML = `<iframe width="560" height="315" src="${song.videoURL}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        player.classList.remove("hidden");
      }
    });
}

// ********************* helping functions *********************************

// takes a date and verifies that it is not empty
// parameters:
//   date - a string representing a release date
// returns date or 'date not listed' if date is empty
function formatDate(date) {
  return (date === undefined) | (date === "") ? "date not listed" : date;
}