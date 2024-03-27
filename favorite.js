const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";

// 注意！資料來源是localStorage，而非自api請求來的資料
const users = JSON.parse(localStorage.getItem("favoriteUsers"));

// 渲染資料
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

function renderUserList(data) {
  let rawHTML = "";
  data.forEach((element) => {
    rawHTML += `
        <div class="col-sm-3">
                    <div class="mb-2">
                        <div class="card">
                            <img src=${element.avatar} class="card-img-top" alt="User Poster" />
                            <div class="card-body">
                                <h5 class="card-title">${element.name}</h5>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${element.id}"> More</button>
                                <button class="btn btn-danger btn-remove-favorite" data-id="${element.id}">x</button>
                            </div>  
                        </div>
                    </div>
                </div>      
        `;
  });
  dataPanel.innerHTML = rawHTML;
}

function showUserModal(id) {
  const title = document.querySelector("#user-modal-title");
  const avatar = document.querySelector("#user-modal-image");
  const gender = document.querySelector("#user-modal-gender");
  const age = document.querySelector("#user-modal-age");
  const email = document.querySelector("#user-modal-email");
  const region = document.querySelector("#user-modal-region");
  const birthday = document.querySelector("#user-modal-birthday");
  const fullName = document.querySelector("#user-modal-name");

  axios.get(INDEX_URL + id).then((responses) => {
    // console.log(responses.data)
    const data = responses.data;
    fullName.textContent = `Full Name : ${data.name} ${data.surname}`;
    title.textContent = data.name;
    avatar.innerHTML = ` <img src="${data.avatar}" alt="user-avatar" class="img-fluid">`;
    gender.textContent = `Gender : ${data.gender}`;
    age.textContent = `Age : ${data.age}`;
    email.textContent = `Email : ${data.email}`;
    region.textContent = `Region : ${data.region}`;
    birthday.textContent = `Birthday : ${data.birthday}`;
  });
}

// 移除收藏(findIndex方法 -> return index)
function removeFromFavorite(id) {
  // 若用戶清單為空，則結束函式
  if (!users || !users.length) return;
  // 透過 id 找到要刪除的用戶的 index
  const userIndex = users.findIndex((user) => user.id === id);
  // 若找不到該索引，則結束函式
  if (userIndex === -1) return;
  // 刪除該用戶
  users.splice(userIndex, 1);
  // 刪除後的用戶資料存入localStorage
  localStorage.setItem("favoriteUsers", JSON.stringify(users));
  // 重新渲染頁面
  renderUserList(users);
}
// MODAL事件監聽 AND 移除收藏監聽
dataPanel.addEventListener("click", function onPanelClicked(e) {
  if (e.target.matches(".btn-show-user")) {
    showUserModal(Number(e.target.dataset.id));
  } else if (e.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(e.target.dataset.id));
  }
});
renderUserList(users);
