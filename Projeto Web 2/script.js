const PAGE_SIZE = 10;
const API_COUNTRIES = 'https://restcountries.com/v3.1/all';

const countriesContainer = document.getElementById('countries-container');
const countryDetails = document.getElementById('country-details');
const searchInput = document.getElementById('search');
const regionFilter = document.getElementById('region-filter');

let countries = [];
let regionPages = {};
let currentRegionFilter = '';
let currentSearch = '';

fetch(API_COUNTRIES)
  .then(res => res.json())
  .then(data => {
    countries = data.filter(c => c.region !== 'Antarctic');
    populateRegionFilter(countries);
    renderRegions(countries);
  });

function populateRegionFilter(countriesList) {
  const regions = [...new Set(countriesList.map(c => c.region || 'Outros'))].sort();
  regions.forEach(region => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    regionFilter.appendChild(option);
  });
}

function renderRegions(countriesList) {
  countriesContainer.innerHTML = '';

  const filtered = groupByRegion(countriesList);

  for (const region in filtered) {
    if (!regionPages[region]) regionPages[region] = 1;

    const section = document.createElement('div');
    section.className = 'region mb-4';
    section.dataset.region = region;
    section.innerHTML = `<h2 class="mb-3">${region}</h2>`;

    const row = document.createElement('div');
    row.className = 'row g-3';

    const page = regionPages[region];
    const countriesToShow = filtered[region].slice(0, page * PAGE_SIZE);

    countriesToShow.forEach(country => {
      const col = document.createElement('div');
      col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';
      col.innerHTML = `
        <div class="card shadow-sm h-100">
          <img src="${country.flags.png}" class="card-img-top" alt="Bandeira de ${country.name.common}">
          <div class="card-body p-2">
            <h5 class="card-title fs-6">${country.name.common}</h5>
          </div>
        </div>
      `;
      col.querySelector('.card').addEventListener('click', () => showDetails(country));
      row.appendChild(col);
    });

    section.appendChild(row);

    if (filtered[region].length > page * PAGE_SIZE) {
      const btnMore = document.createElement('button');
      btnMore.className = 'btn btn-outline-primary mt-3';
      btnMore.textContent = 'Mostrar mais';
      btnMore.addEventListener('click', () => {
        regionPages[region]++;
        renderRegions(countriesList);
        countryDetails.classList.add('hidden');
      });
      section.appendChild(btnMore);
    }

    countriesContainer.appendChild(section);
  }

  updateRegionChart(countriesList);
}

function groupByRegion(countriesList) {
  const grouped = {};
  countriesList.forEach(country => {
    const region = country.region || 'Outros';
    if (!grouped[region]) grouped[region] = [];
    grouped[region].push(country);
  });
  return grouped;
}

function showDetails(country) {
  if (!document.getElementById('countryModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal fade" id="countryModal" tabindex="-1" aria-labelledby="countryModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="countryModalLabel">Detalhes do País</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body"></div>
          </div>
        </div>
      </div>
    `);
  }

  // ISTO É BASICO MAS ELE VERIFICA SE ESTÁ NOS FAVORITOS OU NÃO AFONSOOOO
  function estaNosFavoritos(nomePais) {
    const favoritos = JSON.parse(localStorage.getItem('favorites')) || [];
    return favoritos.some(fav => fav.country.toLowerCase() === nomePais.toLowerCase());
  }

  // ATUALIZA O BOTÃO NO POP-UP AFONSOOO SEM PRECISARES DE SAIR DELE E VOLTAR 
  function atualizarBotaoFavorito() {
    const btn = document.getElementById('favorite-btn');
    if (!btn) return;

    if (estaNosFavoritos(country.name.common)) {
      btn.textContent = '❌ Remover dos Favoritos';
      btn.classList.remove('btn-warning');
      btn.classList.add('btn-danger');
    } else {
      btn.textContent = '⭐ Adicionar aos Favoritos';
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-warning');
    }
  }

  const jaEstaNosFavoritos = estaNosFavoritos(country.name.common);
  const botaoFavorito = jaEstaNosFavoritos
    ? `<button id="favorite-btn" class="btn btn-danger mt-3">❌ Remover dos Favoritos</button>`
    : `<button id="favorite-btn" class="btn btn-warning mt-3">⭐ Adicionar aos Favoritos</button>`;

  const modalBody = document.querySelector('#countryModal .modal-body');
  modalBody.innerHTML = `
    <h2>${country.name.common}</h2>
    <img src="${country.flags.png}" alt="Bandeira de ${country.name.common}" style="width:100%; padding-bottom:15px;">
    <p><strong>Nome oficial:</strong> ${country.name.official}</p>
    <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
    <p><strong>População:</strong> ${country.population.toLocaleString()}</p>
    <p><strong>Área:</strong> ${country.area.toLocaleString()} km²</p>
    <p><strong>Região:</strong> ${country.region}</p>
    <p><strong>Sub-região:</strong> ${country.subregion || 'N/A'}</p>
    <p><strong>Línguas:</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
    ${botaoFavorito}
  `;

  // ATUALIZA O BOTÃO E MOSTRA O ALERTAAAA AFONSOOOO
  document.getElementById('favorite-btn').onclick = () => {
    if (estaNosFavoritos(country.name.common)) {
      removerDosFavoritos(country.name.common);
      showToast('País removido dos favoritos!', 'danger');
    } else {
      adicionarAosFavoritos(country.name.common);
      showToast('País adicionado aos favoritos!', 'success');
    }
    atualizarBotaoFavorito();
    renderFavorites(); 
  };

  const modal = new bootstrap.Modal(document.getElementById('countryModal'));
  modal.show();
}


function adicionarAosFavoritos(countryName) {
  let favoritos = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favoritos.some(fav => fav.country.toLowerCase() === countryName.toLowerCase())) {
    favoritos.push({ country: countryName });
    localStorage.setItem('favorites', JSON.stringify(favoritos));
  }
}

function removerDosFavoritos(countryName) {
  let favoritos = JSON.parse(localStorage.getItem('favorites')) || [];
  favoritos = favoritos.filter(fav => fav.country.toLowerCase() !== countryName.toLowerCase());
  localStorage.setItem('favorites', JSON.stringify(favoritos));
}

// ESTÁ SHIT É O QUE MOSTRA O ALERTAAAAAAAA
function showToast(message, bgColor = 'primary') {
  let toastEl = document.getElementById('liveToast');
  let toastMessage = document.getElementById('toast-message');

  if (!toastEl) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
        <div id="liveToast" class="toast align-items-center text-bg-${bgColor} border-0" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body" id="toast-message">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>
    `);
    toastEl = document.getElementById('liveToast');
    toastMessage = document.getElementById('toast-message');
  } else {
    toastEl.className = `toast align-items-center text-bg-${bgColor} border-0`;
    toastMessage.textContent = message;
  }

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}





searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  const filtered = countries.filter(c =>
    c.name.common.toLowerCase().includes(term)
  );
  renderRegions(filtered);
  countryDetails.classList.add('d-none');
});

regionFilter.addEventListener('change', () => {
  currentRegionFilter = regionFilter.value;
  applyFilters();
});

function setupRegionClickEvents() {
  document.querySelectorAll('[data-region]').forEach(element => {
    element.addEventListener('click', e => {
      e.preventDefault();
      const region = element.dataset.region;
      const filtered = countries.filter(c => c.region === region);
      renderRegions(filtered);
      countryDetails.classList.add('d-none');
    });
  });
}

setTimeout(setupRegionClickEvents, 1000);

function applyFilters() {
  let filtered = countries;

  if (currentSearch) {
    filtered = filtered.filter(c =>
      c.name.common.toLowerCase().includes(currentSearch)
    );
  }

  if (currentRegionFilter) {
    filtered = filtered.filter(c => c.region === currentRegionFilter);
  }

  regionPages = {};
  renderRegions(filtered);
  countryDetails.classList.add('d-none');
}

function updateRegionChart(countriesList) {
  const regionCounts = countriesList.reduce((acc, country) => {
    const region = country.region || 'Outros';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});

  const ctx = document.getElementById('regionChart').getContext('2d');

  if (window.regionChartInstance) {
    window.regionChartInstance.destroy();
  }

  window.regionChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(regionCounts),
      datasets: [{
        data: Object.values(regionCounts),
        backgroundColor: [
          '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: false,
        }
      }
    }
  });
}
