// A few key GLOBAL variables
// we are using the musicbrainz api to query search results for a particular artists' songs

const api = "https://musicbrainz.org/ws/2/";
let favNum = 0;

// db.json url
const localHost = "http://localhost:3000/songs/";

init();

// begins program execution
function init() {
  displaySavedFavs(localHost);
  enableEditing();

  const searchForm = document.querySelector("#search-input");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const searchArtist = searchForm.querySelector("input").value;
    const additionalFormatting = `recording?query=artist:"${searchArtist}"&limit=10&fmt=json`;
    
    apiQuery(api + additionalFormatting, searchArtist)

    const searchValue = document.querySelector("#search")
    searchValue.value = ""
  });
}

// DELETE request.
function deleteSavedFavs(api, id, li) {
  fetch(api + `${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((resp) => resp.json())
    .then(li.remove());
}

function displaySavedFavs(api) {
  //implicit GET request
  fetch(api)
    .then((res) => res.json())
    .then((data) => {
      data.forEach((song) => saveSong(song));
    });
}

function enableEditing() {
  const editForm = document.querySelector("#edit-form");

  console.log(editForm);

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    makeSongEdits(editForm);
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

        const thumbnailForm = document.querySelector("#thumbnail")
        const youtubeForm = document.querySelector("#video-url")
        thumbnailForm.value = ""
        youtubeForm.value = ""
      });
    })
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
    // POST request. Defined new variables for the individual song.
    // For some reason, even though I ran the function inside the .then(), it won't
    // persist onto the page after refresh.
    const songTitle = title;
    const songDate = date;

    fetch(localHost, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title: `${songTitle}`,
        date: `${songDate}`,
      }),
    })
      .then((resp) => resp.json())
      .then((song) => {
        saveSong(song);
      });
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

  const thumbnailIMG = document.createElement("img");
  thumbnailIMG.classList.add("thumbnail");
  thumbnailIMG.src = songThumbnail;

  // YOU WILL WANT PATCH REQUESTS TO USE THIS INFORMATION @ Sam

  const listItem = document.querySelector(
    `li[id="${form.getAttribute("current-index")}"]`
  );

  listItem.append(thumbnailIMG);

  form.classList.add("hidden");

  console.log(listItem.id);

  // PATCH request for thumbnail img. Took out the .then() because it wasn't doing anything.
  fetch(localHost + `${listItem.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            "thumbnail" : `${thumbnailIMG.src}`
            })
    })
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

  newLIInformation.textContent = `${listItem.title} ${listItem.date}`;
  newLI.append(newLIInformation);

  if (listItem.thumbnail !== undefined) {
    const thumbnail = document.createElement('img');
    thumbnail.src = listItem.thumbnail;
    thumbnail.classList.add('thumbnail');
    newLI.append(thumbnail);
  }

  newLI.classList.add("search-result");

  const saveContainer = document.querySelector("#save-container ul");

  saveContainer.append(newLI);

  const playBtn = document.createElement("button");
  playBtn.textContent = "Play";
  buttonContainer.append(playBtn);

  playBtn.addEventListener("click", () => {
    playVideo(localHost, listItem);
  });

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit song info";
  buttonContainer.append(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  buttonContainer.append(deleteBtn);

  deleteBtn.addEventListener("click", () => {
    // Run this DELETE request inside of here
    deleteSavedFavs(localHost, listItem.id, newLI, saveContainer);
  });

  newLI.id = ++favNum;
  newLI.append(buttonContainer);

  editBtn.addEventListener("click", () => {
    const editForm = document.querySelector("#edit-form");
    editForm.classList.remove("hidden");
    editForm.setAttribute("current-index", newLI.id);
  });
}

function playVideo(localHost, listItem) {
  const id = listItem.id;

  fetch(`${localHost}${id}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.videoURL !== undefined) {
        const player = document.querySelector("#video-player");
        player.parentNode.classList.remove("hidden");
        player.innerHTML = `<iframe width="560" height="315" src="${data.videoURL}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        player.classList.remove("hidden");
      }
    });
}
