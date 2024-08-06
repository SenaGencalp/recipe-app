const mealsEl = document.getElementById("meals"); //Ana yemek listesini tutacak element.
const favoriteContainer = document.getElementById("fav-meals"); //Favori yemeklerin listeleneceği element.
const mealPopup = document.getElementById("meal-popup"); //Yemek detaylarının gösterileceği pop-up.
const mealInfoEl = document.getElementById("meal-info"); //Pop-up içindeki yemek bilgilerini gösterecek element.
const popupCloseBtn = document.getElementById("close-popup"); // Pop-up'ı kapatma butonu.

const searchTerm = document.getElementById("search-term"); //Arama çubuğu.
const searchBtn = document.getElementById("search"); //Arama butonu.

getRandomMeal(); //Rastgele bir yemek tarifini çeker ve ekler.
fetchFavMeals(); //Kullanıcının favorilerine eklediği yemekleri localStorage'dan çeker ve gösterir.

//themealdb.com API'sinden rastgele bir yemek çeker ve addMeal fonksiyonuyla ekler.
async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}

//Belirli bir ID'ye sahip yemeği API'den çeker ve döner.
async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}
//Arama Terimine Göre Yemek Getirme Fonksiyonu.Belirli bir terime göre yemekleri API'den çeker ve döner.
async function getMealsBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

//Yemek Ekleme Fonksiyonu.Yeni bir yemek elementi oluşturur ve ekler. Favori butonuna tıklandığında yemeği favorilere ekler veya çıkarır ve fetchFavMeals() fonksiyonunu çağırır.
function addMeal(mealData, random = false) {
  console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `
        <div class="meal-header">
            ${
              random
                ? `
            <span class="random"> Random Recipe </span>`
                : ""
            }
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

  const btn = meal.querySelector(".meal-body .fav-btn");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

//Yemek ID'sini localStorage'a ekler.
function addMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

//Yemek ID'sini localStorage'dan çıkarır.
function removeMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

//LocalStorage'dan yemek ID'lerini alır.
function getMealsLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

//Yemek Bilgisi Gösterme Fonksiyonu
async function fetchFavMeals() {
  // clean the container
  favoriteContainer.innerHTML = "";

  const mealIds = getMealsLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);

    addMealFav(meal);
  }
}

function addMealFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        /><span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

  const btn = favMeal.querySelector(".clear");

  btn.addEventListener("click", () => {
    removeMealLS(mealData.idMeal);

    fetchFavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favoriteContainer.appendChild(favMeal);
}

//Yemek detaylarını gösterir.
function showMealInfo(mealData) {
  // clean it up
  mealInfoEl.innerHTML = "";

  // update the Meal info
  const mealEl = document.createElement("div");

  const ingredients = []; //--yemeğin malzemelerini ve ölçülerini saklayacaktır.

  // get ingredients and measures.
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
              .map(
                (ing) => `
            <li>${ing}</li>
            `
              )
              .join("")}
        </ul>
    `;

  mealInfoEl.appendChild(mealEl);

  // show the popup
  mealPopup.classList.remove("hidden");
}

//Arama Butonu ve Pop-up Kapatma Butonu.
// tıklama olayı: Arama terimiyle yemekleri arar ve ekler.
searchBtn.addEventListener("click", async () => {
  // clean container
  mealsEl.innerHTML = "";

  const search = searchTerm.value;
  const meals = await getMealsBySearch(search);

  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

popupCloseBtn.addEventListener("click", () => {
  //
  mealPopup.classList.add("hidden");
});
