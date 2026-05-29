// 1. Configuração de conexão com o Supabase
const supabaseUrl = "https://pxpoazglkuiyapctkxet.supabase.co";
const supabaseAnonKey = "sb_publishable_F588fQzD52hRZov0uWP88A_Li48sCpQ";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// 2. Função para ENVIAR a atividade direto para o Supabase
async function enviarAtividade(evento) {
  // 🔴 TRAVA O RECARREGAMENTO IMEDIATAMENTE (Evita que os campos sumam se der erro)
  if (evento) {
    evento.preventDefault();
    evento.stopPropagation();
  }
  
  console.log("Tentando enviar os dados para o Supabase...");

  const estudanteId = document.getElementById('estudanteId').value.trim() || 'Anônimo';
  const titulo = document.getElementById('tituloAtividade').value;
  const descricao = document.getElementById('descricaoAtividade').value;
  const linkArquivo = document.getElementById('linkArquivo').value;

  const statusMensagem = document.getElementById('statusMensagem');
  statusMensagem.style.color = "#8b949e"; 
  statusMensagem.innerText = "Publicando...";

  try {
    const { data, error } = await supabaseClient
      .from('atividades') 
      .insert([
        { 
          alunos_id: estudanteId, 
          titulo: titulo, 
          descricao: descricao, 
          link_arquivo: linkArquivo 
        }
      ]);

    // Se o banco responder com erro, cai direto no 'catch' lá embaixo
    if (error) throw error;

    statusMensagem.style.color = "#3fb950"; 
    statusMensagem.innerText = "Publicado com sucesso!";
    document.getElementById('formAtividade').reset();
    
    carregarAtividades(); 

  } catch (error) {
    // 🔴 SE DER QUALQUER ERRO, VAI MOSTRAR EM VERMELHO NO F12 SEM APAGAR
    statusMensagem.style.color = "#f85149"; 
    statusMensagem.innerText = `Erro: ${error.message || error.details || 'Falha no envio'}`;
    
    console.error("--- DETALHES DO ERRO DO SUPABASE ---");
    console.error("Mensagem:", error.message);
    console.error("Detalhes:", error.details);
    console.error("Dica:", error.hint);
    console.error("------------------------------------");
  }
}

// 3. Função para BUSCAR as atividades direto do Supabase
// 3. Função para BUSCAR as atividades direto do Supabase
async function carregarAtividades() {
  const listaContainer = document.getElementById('listaAtividades');

  try {
    // 🟢 Buscando todas as linhas de forma simples para evitar o Erro 400
    const { data: atividades, error } = await supabaseClient
      .from('atividades')
      .select('*');

    if (error) throw error;

    if (!atividades || atividades.length === 0) {
      listaContainer.innerHTML = "<p class='nenhuma-atividade'>Nenhuma atividade publicada ainda.</p>";
      return;
    }

    listaContainer.innerHTML = "";
    
    // Inverte a ordem no JavaScript para o mais recente aparecer no topo
    atividades.reverse(); 
    
    atividades.forEach(atividade => {
      // Descobre qual coluna de data sua tabela está usando (created_at ou enviado_em)
      const dataBanco = atividade.created_at || atividade.enviado_em || new Date();
      const dataFormatada = new Date(dataBanco).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });

      const card = document.createElement('div');
      card.className = 'card-atividade';
      card.innerHTML = `
  <div class="card-header">
    <h3>${atividade.titulo}</h3>
    <span class="data-envio">${dataFormatada}</span>
  </div>
  <p class="autor-atv"><strong>Por:</strong> ${atividade.alunos_id || 'Anônimo'}</p>
  <p class="card-desc">${atividade.descricao || '<em>Sem descrição.</em>'}</p>
  <a href="${atividade.link_arquivo}" target="_blank" class="link-entrega">🔗 Acessar Trabalho</a>
`;
      listaContainer.appendChild(card);
    });
  } catch (error) {
    listaContainer.innerHTML = `<p style="color: #f85149; text-align: center;">Erro ao carregar o mural: ${error.message}</p>`;
    console.error("Erro ao buscar dados:", error);
  }
}

// 4. Inicialização do script quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAtividade');
  if (form) {
    form.addEventListener('submit', enviarAtividade);
  }
  carregarAtividades();
});