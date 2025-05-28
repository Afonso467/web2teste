  const toggleButton = document.getElementById('toggle-mode');
  const body = document.body;

  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
  }

  toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      toggleButton.textContent = "☀️ Mudar Tema";
    } else {
      localStorage.setItem('theme', 'light');
      toggleButton.textContent = "🌙 Mudar Tema";
    }
  });

  toggleButton.textContent = body.classList.contains('dark-mode')
    ? "☀️ Mudar Tema"
    : "🌙 Mudar Tema";