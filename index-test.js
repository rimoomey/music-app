const api = "https://musicbrainz.org/ws/2/";
const localHost = "http://localhost:3000/songs/";
let savedSongNum = 0;

init();

function init() {
  displaySavedSongs(localHost);
}

function displaySavedSongs(localHost) {
  fetch(localHost)
    .then((res) => res.json())
    .then((data) => {
      if (data.length > 0) {
        data.forEach((song) => showSavedFavorite(song));
      }
    });
}

function showSavedFavorite(song) {
  const li = document.createElement('li');
  li.classList.add('search-result');
  li.id = song.id;

  const liInfo = document.createElement('div');
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  addFavoriteButtons(buttonContainer);

  liInfo.textContent = `${song.title} (${song.releaseDate})`;
  li.append(liInfo);

  if (song.thumbnail !== '') {
    const thumbnail = document.createElement('img');
    thumbnail.src = song.thumbnail;
    thumbnail.classList.add('thumbnail');
    li.append(thumbnail);
  }

  li.append(buttonContainer);
  document.querySelector('#save-container').append(li);

}

function addFavoriteButtons(buttonContainer) {
    const playBtn = document.createElement("button");
    playBtn.textContent = "Play";
    buttonContainer.append(playBtn);

    playBtn.addEventListener("click", () => {
      //playVideo(localHost, listItem);
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit song info";
    buttonContainer.append(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    buttonContainer.append(deleteBtn);

    deleteBtn.addEventListener("click", () => {
      //deleteSavedFavs(localHost, listItem.id, newLI, saveContainer);
    });
}

// function displaySavedFavs(api) {
//     //implicit GET request
//     fetch(api)
//       .then((res) => res.json())
//       .then((data) => {
//         data.forEach((song) => saveSong(song));
//       });
// }

// function saveSong(listItem) {
//     const newLI = document.createElement("li");
//     const newLIInformation = document.createElement("div");
//     const buttonContainer = document.createElement("div");
//     buttonContainer.classList.add("button-container");

//     newLIInformation.textContent = `${listItem.title} ${listItem.date}`;
//     newLI.append(newLIInformation);

//     if (listItem.thumbnail !== undefined) {
//       const thumbnail = document.createElement('img');
//       thumbnail.src = listItem.thumbnail;
//       thumbnail.classList.add('thumbnail');
//       newLI.append(thumbnail);
//     }

//     newLI.classList.add("search-result");

//     const saveContainer = document.querySelector("#save-container ul");

//     saveContainer.append(newLI);

//     const playBtn = document.createElement("button");
//     playBtn.textContent = "Play";
//     buttonContainer.append(playBtn);

//     playBtn.addEventListener("click", () => {
//       playVideo(localHost, listItem);
//     });

//     const editBtn = document.createElement("button");
//     editBtn.textContent = "Edit song info";
//     buttonContainer.append(editBtn);

//     const deleteBtn = document.createElement("button");
//     deleteBtn.textContent = "X";
//     buttonContainer.append(deleteBtn);

//     deleteBtn.addEventListener("click", () => {
//       // Run this DELETE request inside of here
//       deleteSavedFavs(localHost, listItem.id, newLI, saveContainer);
//     });

//     newLI.id = ++favNum;
//     newLI.append(buttonContainer);

//     editBtn.addEventListener("click", () => {
//       const editForm = document.querySelector("#edit-form");
//       editForm.classList.remove("hidden");
//       editForm.setAttribute("current-index", newLI.id);
//     });
//   }
