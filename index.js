// 順序：1.自api取得資料。2.渲染資料。3.點擊模組、顯示模組。4.搜尋事件（含鍵盤事件、input事件）。5.存取收藏清單。6.一次顯示16筆資料。7.產生分頁的數量（幾個小li）8.分頁器監聽事件。9.搜尋結果分頁
const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";

const users = [];
let filteredUsers = [];
// 2.渲染資料
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
// 2-1.渲染函式
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
                                <button class="btn btn-info btn-add-favorite" data-id="${element.id}">+</button>
                            </div>
                        </div>
                    </div>
                </div>      
        `;
  });
  dataPanel.innerHTML = rawHTML;
}
// 3-1.模組函式
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
// 5-1.收藏函式(find方法，some方法)
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
  const user = users.find((user) => user.id === id);
  if (list.some((user) => user.id === id)) {
    return alert("此用戶已存在於收藏清單中！");
  }
  list.push(user);
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

// 4-1.搜尋函式（e.preventDefault()，filter方法）
function searchFormSubmitted(e) {
  // 預防瀏覽器預設行為
  e.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  // 若使用者未輸入有效字串
  if (keyword.length === 0) {
    alert("請輸入有效的關鍵字！");
  }
  // 將篩選出符合關鍵字的用戶存入filteredUsers陣列

  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  );
  // 若沒有符合關鍵字的用戶
  if (filteredUsers.length === 0) {
    alert("對不起，沒有符合您搜尋的用戶！");
  }
  // 重製分頁器
  renderPaginator(filteredUsers.length);
  renderUserList(getUsersByPage(1));
}

// 6.一次顯示16頁資料函式（slice方法）
const USERS_PER_PAGE = 16;

function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users;
  // 計算起始索引
  const startIndex = (page - 1) * USERS_PER_PAGE;
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}
// 7.產生分頁的數量（幾個小li）
const paginator = document.querySelector("#paginator");

function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
  // 製作template
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}
// 8-1.分頁器函式
function paginatorClicked(e) {
  // 如果被點擊的不是 a 標籤，則結束函式
  if (e.target.tagName !== "A") return;
  // 透過 dataset 取得被點擊的頁數
  const page = Number(e.target.dataset.page);
  renderUserList(getUsersByPage(page));
}

// 3.模組事件監聽/5.收藏事件監聽
dataPanel.addEventListener("click", function onPanelClicked(e) {
  if (e.target.matches(".btn-show-user")) {
    showUserModal(Number(e.target.dataset.id));
  } else if (e.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(e.target.dataset.id));
  }
});

// 4.搜尋事件(是submit,不是click)
searchForm.addEventListener("submit", searchFormSubmitted);
// 4-2.鍵盤事件（用keyup是防止使用者一直按壓enter鍵）
searchForm.addEventListener("keyup", function (e) {
  if (e.key === "ENTER") {
    renderUserList(filteredUsers);
  }
});
//4-3.input事件
//searchForm.addEventListener('input', searchFormSubmitted)

// 8.分頁器監聽事件
paginator.addEventListener("click", paginatorClicked);

// 1.請求資料，並將回傳的資料放到 users 陣列。同時呼叫渲染函數 renderUserList
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length);
    renderUserList(getUsersByPage(1));
  })
  .catch((error) => {
    console.log(error);
  });
