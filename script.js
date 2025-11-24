// Smooth scroll para os links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Atualizar navbar ativa ao rolar
window.addEventListener('scroll', function() {
  let sections = document.querySelectorAll('section[id]');
  let scrollPos = window.pageYOffset || document.documentElement.scrollTop;

  sections.forEach(section => {
    let sectionTop = section.offsetTop - 100;
    let sectionHeight = section.offsetHeight;
    let sectionId = section.getAttribute('id');

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
      });
      let activeLink = document.querySelector('.navbar-nav .nav-link[href="#' + sectionId + '"]');
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  });
});

// Validação e envio do formulário de contato
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-contato');
  const mensagemAlerta = document.getElementById('mensagem-alerta');
  const btnEnviar = document.getElementById('btn-enviar');
  const spinner = btnEnviar.querySelector('.spinner-border');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Limpar mensagens anteriores
      mensagemAlerta.classList.add('d-none');
      mensagemAlerta.classList.remove('alert-success', 'alert-danger');
      
      // Remover classes de validação anteriores
      form.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
      });

      // Validar campos
      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const mensagem = document.getElementById('mensagem').value.trim();
      const assunto = document.getElementById('assunto').value.trim();

      let isValid = true;
      let errorMessage = '';

      // Validação do nome
      if (nome === '') {
        showFieldError('nome', 'Por favor, preencha seu nome.');
        isValid = false;
      } else if (nome.length < 3) {
        showFieldError('nome', 'O nome deve ter pelo menos 3 caracteres.');
        isValid = false;
      } else {
        showFieldSuccess('nome');
      }

      // Validação do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === '') {
        showFieldError('email', 'Por favor, preencha seu e-mail.');
        isValid = false;
      } else if (!emailRegex.test(email)) {
        showFieldError('email', 'Por favor, insira um e-mail válido.');
        isValid = false;
      } else {
        showFieldSuccess('email');
      }

      // Validação da mensagem
      if (mensagem === '') {
        showFieldError('mensagem', 'Por favor, preencha a mensagem.');
        isValid = false;
      } else if (mensagem.length < 10) {
        showFieldError('mensagem', 'A mensagem deve ter pelo menos 10 caracteres.');
        isValid = false;
      } else {
        showFieldSuccess('mensagem');
      }

      if (!isValid) {
        showAlert('Por favor, corrija os erros no formulário.', 'danger');
        return;
      }

      // Desabilitar botão e mostrar spinner
      btnEnviar.disabled = true;
      spinner.classList.remove('d-none');
      btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';

      // Preparar dados para envio
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('email', email);
      formData.append('assunto', assunto);
      formData.append('mensagem', mensagem);

      // Enviar via AJAX
      fetch('enviar-contato.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showAlert('Mensagem enviada com sucesso! Entrarei em contato em breve.', 'success');
          form.reset();
          form.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-valid');
          });
        } else {
          showAlert(data.message || 'Erro ao enviar mensagem. Tente novamente.', 'danger');
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        showAlert('Erro ao enviar mensagem. Por favor, tente novamente mais tarde.', 'danger');
      })
      .finally(() => {
        // Reabilitar botão
        btnEnviar.disabled = false;
        spinner.classList.add('d-none');
        btnEnviar.innerHTML = 'Enviar';
      });
    });
  }

  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const feedback = field.nextElementSibling;
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.textContent = message;
    }
  }

  function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.add('is-valid');
    field.classList.remove('is-invalid');
  }

  function showAlert(message, type) {
    mensagemAlerta.textContent = message;
    mensagemAlerta.classList.remove('d-none');
    mensagemAlerta.classList.add(`alert-${type}`);
    
    // Scroll para a mensagem
    mensagemAlerta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Se for sucesso, ocultar após 5 segundos
    if (type === 'success') {
      setTimeout(() => {
        mensagemAlerta.classList.add('d-none');
      }, 5000);
    }
  }
});