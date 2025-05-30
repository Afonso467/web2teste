    const countryList = document.getElementById('countryList');
    const countryForm = document.getElementById('countryForm');
    const modalDetailsContent = document.getElementById('modalDetailsContent');

    let countries = JSON.parse(localStorage.getItem('createdCountries')) || [];

    function renderCountries() {
    countryList.innerHTML = "";
    countries.forEach((country, index) => {
        const item = document.createElement('li');
        item.className = "list-group-item d-flex justify-content-between align-items-center";
        item.innerHTML = `
        <span>${country.name}</span>
        <div class="btn-group">
            <button class="btn btn-sm btn-outline-info" onclick="showDetails(${index})">Ver</button>
            <button class="btn btn-sm btn-outline-warning" onclick="editCountry(${index})">Editar</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteCountry(${index})">Eliminar</button>
        </div>
        `;
        countryList.appendChild(item);
    });
    }


    function showDetails(index) {
      const country = countries[index];
      modalDetailsContent.innerHTML = `
        ${country.image ? `<img src="${country.image}" alt="Bandeira de ${country.name}" class="img-fluid mt-2 rounded">` : ''}
        <p><strong>País:</strong> ${country.name}</p>
        <p><strong>Capital:</strong> ${country.capital}</p>
        <p><strong>Região:</strong> ${country.region}</p>
      `;
      const modal = new bootstrap.Modal(document.getElementById('detailModal'));
      modal.show();
    }

    countryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newCountry = {
        name: document.getElementById('name').value,
        capital: document.getElementById('capital').value,
        region: document.getElementById('region').value,
        image: document.getElementById('image').value
      };
      countries.push(newCountry);
      localStorage.setItem('createdCountries', JSON.stringify(countries));
      renderCountries();
      countryForm.reset();
      const createModal = bootstrap.Modal.getInstance(document.getElementById('createModal'));
      showToast('País criado com sucesso!', 'success');
      createModal.hide();
    });

    renderCountries();

    function editCountry(index) {
        const country = countries[index];
        document.getElementById('editIndex').value = index;
        document.getElementById('editName').value = country.name;
        document.getElementById('editCapital').value = country.capital;
        document.getElementById('editRegion').value = country.region;
        document.getElementById('editImage').value = country.image;

        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    }

    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const index = parseInt(document.getElementById('editIndex').value);
        countries[index] = {
            name: document.getElementById('editName').value,
            capital: document.getElementById('editCapital').value,
            region: document.getElementById('editRegion').value,
            image: document.getElementById('editImage').value
        };
        localStorage.setItem('createdCountries', JSON.stringify(countries));
        renderCountries();
        showToast('País atualizado com sucesso!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        modal.hide();
    });

    function deleteCountry(index) {
        const confirmDelete = confirm(`Tem certeza que deseja eliminar "${countries[index].name}"?`);
        if (!confirmDelete) return;

        const removed = countries.splice(index, 1);
        localStorage.setItem('createdCountries', JSON.stringify(countries));
        renderCountries();
        showToast(`"${removed[0].name}" foi eliminado.`, 'danger');
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


