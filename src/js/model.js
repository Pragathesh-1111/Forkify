import { API_URL, RES_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';
export const state = {
  recipe: {},
  search: {
    query: '',
    page: 1,
    results: [],
    resultsPerPage: RES_PAGE,
  },
  bookmarks: [],
};

const createReceipeObject = function (data) {
  const { recipe } = data.data;
  return {
    title: recipe.title,
    id: recipe.id,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    publisher: recipe.publisher,
    servings: recipe.servings,
    sourceURL: recipe.source_url,
    cookingTime: recipe.cooking_time,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(
      `${API_URL}/${id}?key=${KEY}`,
    );
    state.recipe = createReceipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        image: recipe.image_url,
        title: recipe.title,
        publisher: recipe.publisher,
        ...(recipe.key && { key: recipe.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    // Basic math
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (receipe) {
  // Add bookmark
  state.bookmarks.push(receipe);

  // Mark current receipe as bookmarked
  if (receipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current receipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmars = function () {
  localStorage.clear('bookmarks');
};
// clearBookmars()

export const uploadReceipe = async function (newReceipe) {
  try {
    const ingredients = Object.entries(newReceipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format, please use the correct format :)',
          );

        const [quantity, unit, description] = ingArr;
        return { quantity, unit, description };
      });

    const receipe = {
      title: newReceipe.title,
      source_url: newReceipe.sourceUrl,
      image_url: newReceipe.image,
      publisher: newReceipe.publisher,
      cooking_time: +newReceipe.cookingTime,
      servings: +newReceipe.servings,
      ingredients,
    };

    const data = await AJAX (`${API_URL}?key=${KEY}`, receipe);
    state.recipe = createReceipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
