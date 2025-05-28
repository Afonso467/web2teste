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
            <h6 class="mb-0">${countryData.name}</h6>
          </div>
          <div>
            <button class="btn btn-sm btn-danger" onclick="deleteFavorite(${i})">Eliminar</button>
          </div>
        </li>`;
    }
  }
}

function showToast(message, type = 'success', delay = 3000) {
  const toastContainer = document.getElementById('toast-container');
  const toastId = `toast-${Date.now()}`;

  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;

  toastContainer.insertAdjacentHTML('beforeend', toastHTML);

  const toastElement = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastElement, { delay });
  bsToast.show();

  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

async function deleteFavorite(index) {
  const removed = favorites.splice(index, 1)[0];
  localStorage.setItem('favorites', JSON.stringify(favorites));
  await renderFavorites();
  showToast(`"${removed.country}" removido dos favoritos.`, 'danger');
}

async function editFavorite(index) {
  const fav = favorites[index];
  const newCountry = prompt('Editar nome do país:', fav.country);
  if (newCountry !== null && newCountry.trim() !== "") {
    favorites[index] = { country: newCountry.trim() };
    localStorage.setItem('favorites', JSON.stringify(favorites));
    await renderFavorites();
    showToast(`País atualizado para "${newCountry}".`);
  }
}

renderFavorites();
