let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchCountryData(countryName) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        name: data[0].name.common,
        flag: data[0].flags.svg
      };
    }
  } catch (error) {
    console.error("Erro ao obter dados do país:", error);
  }
  return null;
}

async function renderFavorites() {
  const list = document.getElementById('favorites-list');
  list.innerHTML = '';

  for (let i = 0; i < favorites.length; i++) {
    const fav = favorites[i];
    const countryData = await fetchCountryData(fav.country);

    if (countryData) {
      list.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-start">
          <div class="favorite-info">
            <img src="${countryData.flag}" alt="Bandeira de ${countryData.name}" />
            <h6>${countryData.name}</h6>
          </div>
          <div>
            <button class="btn btn-sm btn-warning" onclick="editFavorite(${i})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deleteFavorite(${i})">Eliminar</button>
          </div>
        </li>`;
    }
  }
}

async function addFavorite() {
  const country = document.getElementById('fav-country').value.trim();
  if (country && !favorites.some(fav => fav.country.toLowerCase() === country.toLowerCase())) {
    favorites.push({ country });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    await renderFavorites();
    document.getElementById('fav-country').value = '';
  }
}

async function deleteFavorite(index) {
  favorites.splice(index, 1);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  await renderFavorites();
}

async function editFavorite(index) {
  const fav = favorites[index];
  const newCountry = prompt('Editar nome do país:', fav.country);
  if (newCountry !== null && newCountry.trim() !== "") {
    favorites[index] = { country: newCountry.trim() };
    localStorage.setItem('favorites', JSON.stringify(favorites));
    await renderFavorites();
  }
}

renderFavorites();
