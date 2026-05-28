async function enviarAtividade(event) {
  event.preventDefault();

  const estudanteId = document.getElementById('estudanteId').value.trim() || 'Anônimo';
  const titulo = document.getElementById('tituloAtividade').value;
  const descricao = document.getElementById('descricaoAtividade').value;
  const linkArquivo = document.getElementById('linkArquivo').value;

  const statusMensagem = document.getElementById('statusMensagem');
  statusMensagem.style.color = "inherit";
  statusMensagem.innerText = "Publicando...";

  try {
    const response = await fetch('/api/enviar-atividade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estudanteId, titulo, descricao, linkArquivo }),
    });

    const resultado = await response.json();

    if (response.ok && resultado.success) {
      statusMensagem.style.color = "green";
      statusMensagem.innerText = "Publicado com sucesso!";
      document.getElementById('formAtividade').reset();
      carregarAtividades(); // Atualiza o mural imediatamente
    } else {
      throw new Error(resultado.error || 'Erro ao publicar.');
    }
  } catch (error) {
    statusMensagem.style.color = "red";
    statusMensagem.innerText = `Erro: ${error.message}`;
  }
}

async function carregarAtividades() {
  const listaContainer = document.getElementById('listaAtividades');

  try {
    const response = await fetch('/api/listar-atividades');
    const resultado = await response.json();

    if (!response.ok || !resultado.success) throw new Error(resultado.error);

    const atividades = resultado.atividades;

    if (atividades.length === 0) {
      listaContainer.innerHTML = "<p class='nenhuma-atividade'>Nenhuma atividade publicada ainda.</p>";
      return;
    }

    listaContainer.innerHTML = "";
    
    atividades.forEach(atividade => {
      const dataFormatada = new Date(atividade.enviado_em).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });

      const card = document.createElement('div');
      card.className = 'card-atividade';
      card.innerHTML = `
        <div class="card-header">
          <h3>${atividade.titulo}</h3>
          <span class="data-envio">${dataFormatada}</span>
        </div>
        <p class="autor-atv"><strong>Por:</strong> ${atividade.estudante_id}</p>
        <p class="card-desc">${atividade.descricao || '<em>Sem descrição.</em>'}</p>
        <a href="${atividade.link_arquivo}" target="_blank" class="link-entrega">📁 Abrir Atividade</a>
      `;
      listaContainer.appendChild(card);
    });
  } catch (error) {
    listaContainer.innerHTML = `<p style="color: red; text-align: center;">Erro ao carregar o mural: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAtividade');
  if (form) form.addEventListener('submit', enviarAtividade);
  carregarAtividades();
});