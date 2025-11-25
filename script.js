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

      // Preparar dados para envio (usado tanto para fetch quanto para localStorage)
      const payload = {
        data: new Date().toISOString(),
        nome: nome,
        email: email,
        assunto: assunto,
        mensagem: mensagem,
        origem: window.location.href
      };

      // Função para exibir modal e reabilitar botão
      function mostrarConfirmacaoComNome(nomeParaMostrar) {
        const nomeUsuario = nomeParaMostrar.charAt(0).toUpperCase() + nomeParaMostrar.slice(1);
        const mensagemPersonalizada = `Obrigada <strong>"${nomeUsuario}"</strong> pela mensagem, em breve entrarei em contato!`;
        document.getElementById('mensagemModal').innerHTML = mensagemPersonalizada;
        try {
          const modalElement = document.getElementById('modalConfirmacao');
          if (modalElement && window.bootstrap) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            // Limpar formulário quando o modal for fechado
            modalElement.addEventListener('hidden.bs.modal', function() {
              form.reset();
              // Remover classes de validação
              form.querySelectorAll('.form-control').forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
              });
            }, { once: true });
          } else if (modalElement) {
            // fallback simples: tornar visível se bootstrap não estiver presente
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
            form.reset();
          }
        } catch (error) {
          console.error('Erro ao abrir modal:', error);
        }
        // Reabilitar botão
        btnEnviar.disabled = false;
        spinner.classList.add('d-none');
        btnEnviar.innerHTML = 'Enviar';
      }

      // Tentar enviar para o PHP quando possível (servidor local). Se falhar, salvar em localStorage.
      // Evitar chamada fetch em `file:` protocol (causa CORS/blocked).
      if (window.location.protocol === 'file:') {
        // Salvamento local imediato (apenas para demo no GitHub Pages ou quando aberto via file://)
        salvarLocal(payload);
        mostrarConfirmacaoComNome(nome);
      } else {
        // Tentar enviar para o backend PHP
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('assunto', assunto);
        formData.append('mensagem', mensagem);

        fetch('enviar-contato.php', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (!response.ok) throw new Error('Resposta do servidor não OK');
          return response.json();
        })
        .then(data => {
          if (data && data.success) {
            // servidor recebeu e processou; não é necessário salvar local, mas podemos opcionalmente guardar uma cópia
            mostrarConfirmacaoComNome(nome);
          } else {
            // resposta inválida do backend -> fallback para salvar local
            console.warn('Backend retornou erro ou formato inesperado, salvando localmente');
            salvarLocal(payload);
            mostrarConfirmacaoComNome(nome);
          }
        })
        .catch(error => {
          console.warn('Falha ao enviar ao backend (causa:', error, '), salvando em localStorage como fallback.');
          salvarLocal(payload);
          mostrarConfirmacaoComNome(nome);
        });
      }
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

  // Salvar contato no localStorage (fallback para ambientes sem PHP)
  function salvarLocal(dados) {
    try {
      const chave = 'contatos_site_amabile';
      const existentes = JSON.parse(localStorage.getItem(chave) || '[]');
      existentes.push(dados);
      localStorage.setItem(chave, JSON.stringify(existentes));
      console.log('Contato salvo no localStorage (fallback).');
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }
});