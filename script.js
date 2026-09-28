<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
/* =========================================================
   👑 1PRINCIPEBR - SUPABASE
   ========================================================= */

const SUPABASE_URL = qkaerwabeqozuekfsncc;
const SUPABASE_KEY = sb_publishable_n_RA2bKBircIEP5bsWUULQ_AmmtG-RW;

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* =========================================================
   👑 DADOS DO USUÁRIO
   ========================================================= */

let userData = {
  nickname: "",
  mascot: "",
  platform: "",
  genres: []
};

let selectedMascot = "";
let selectedPlatform = "";
let selectedGenres = [];


/* =========================================================
   👑 TROCAR DE TELA
   ========================================================= */

function showScreen(id) {
  document.querySelectorAll(".entry-screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const screen = document.getElementById(id);

  if (screen) {
    screen.classList.add("active");
  }
}


/* =========================================================
   👑 INÍCIO
   ========================================================= */

function goToNickname() {
  showScreen("nickname-screen");

  setTimeout(() => {
    const input = document.getElementById("nickname-input");

    if (input) {
      input.focus();
    }
  }, 100);
}


/* =========================================================
   🔎 PROCURAR NICKNAME NO BANCO
   ========================================================= */

async function saveNicknameAndContinue() {

  const input = document.getElementById("nickname-input");
  const error = document.getElementById("nickname-error");

  if (!input) return;

  const nickname = input.value.trim();

  if (!nickname) {
    if (error) {
      error.textContent = "DIGITE UM NICKNAME ❌";
    }

    return;
  }


  /* O nickname precisa conter "principe" */

  if (!nickname.toLowerCase().includes("principe")) {

    if (error) {
      error.textContent =
        'INCORRETO ❌ O NICKNAME PRECISA TER "PRINCIPE".';
    }

    return;
  }


  if (error) {
    error.textContent = "🔎 VERIFICANDO...";
  }


  const nicknameLower = nickname.toLowerCase();


  /* =====================================================
     CONSULTA O BANCO
     ===================================================== */

  const { data, error: databaseError } = await supabaseClient
    .from("principe_users")
    .select("*")
    .eq("nickname_lower", nicknameLower)
    .maybeSingle();


  /* =====================================================
     ERRO DE CONEXÃO
     ===================================================== */

  if (databaseError) {

    console.error(databaseError);

    if (error) {
      error.textContent =
        "ERRO AO CONECTAR AO BANCO ❌";
    }

    return;
  }


  /* =====================================================
     👑 USUÁRIO JÁ EXISTE
     ===================================================== */

  if (data) {

    userData = {
      nickname: data.nickname,
      mascot: data.mascot,
      platform: data.platform,
      genres: data.genres || []
    };


    /* Salva também no navegador */

    localStorage.setItem(
      "principeData",
      JSON.stringify(userData)
    );


    if (error) {
      error.textContent = "👑 LOGIN REALIZADO!";
    }


    setTimeout(() => {

      showUserBadge();

      showScreen("activation-screen");

      setTimeout(() => {
        showScreen("main-site");
      }, 3000);

    }, 700);


    return;
  }


  /* =====================================================
     🆕 USUÁRIO NOVO
     ===================================================== */

  userData.nickname = nickname;

  selectedMascot = "";
  selectedPlatform = "";
  selectedGenres = [];

  if (error) {
    error.textContent = "";
  }

  showScreen("mascot-screen");
}


/* =========================================================
   🐉 MASCOTE
   ========================================================= */

function selectMascot(card, mascot) {

  document
    .querySelectorAll("#mascot-screen .choice-card")
    .forEach(item => {
      item.classList.remove("selected");
    });

  card.classList.add("selected");

  selectedMascot = mascot;

  userData.mascot = mascot;

  const button = document.getElementById("mascot-button");

  if (button) {
    button.disabled = false;
  }
}


function goToPlatform() {

  if (!selectedMascot) return;

  showScreen("platform-screen");
}


/* =========================================================
   🎮 PLATAFORMA
   ========================================================= */

function selectPlatform(card, platform) {

  document
    .querySelectorAll("#platform-screen .choice-card")
    .forEach(item => {
      item.classList.remove("selected");
    });

  card.classList.add("selected");

  selectedPlatform = platform;

  userData.platform = platform;

  const button = document.getElementById("platform-button");

  if (button) {
    button.disabled = false;
  }
}


function goToGenres() {

  if (!selectedPlatform) return;

  selectedGenres = [];

  document
    .querySelectorAll("#genre-screen .choice-card")
    .forEach(card => {
      card.classList.remove("selected");
    });

  updateGenreCounter();

  showScreen("genre-screen");
}


/* =========================================================
   🎮 GÊNEROS
   ========================================================= */

function selectGenre(card, genre) {

  const index = selectedGenres.indexOf(genre);


  /* Remove */

  if (index !== -1) {

    selectedGenres.splice(index, 1);

    card.classList.remove("selected");

    updateGenreCounter();

    return;
  }


  /* Máximo de 3 */

  if (selectedGenres.length >= 3) {
    return;
  }


  selectedGenres.push(genre);

  card.classList.add("selected");

  updateGenreCounter();
}


/* =========================================================
   🔢 CONTADOR DE GÊNEROS
   ========================================================= */

function updateGenreCounter() {

  const counter =
    document.getElementById("genre-counter-bottom");

  const button =
    document.getElementById("genre-button");


  if (counter) {

    counter.textContent =
      `${selectedGenres.length}/3 gêneros selecionados`;
  }


  if (button) {

    button.disabled =
      selectedGenres.length !== 3;
  }
}


/* =========================================================
   💾 SALVAR NOVO USUÁRIO NO SUPABASE
   ========================================================= */

async function finishChoices() {

  if (selectedGenres.length !== 3) {

    alert("Escolha exatamente 3 gêneros.");

    return;
  }


  userData.mascot = selectedMascot;
  userData.platform = selectedPlatform;
  userData.genres = [...selectedGenres];


  const nicknameLower =
    userData.nickname.toLowerCase();


  /* =====================================================
     SALVAR
     ===================================================== */

  const { data, error } = await supabaseClient
    .from("principe_users")
    .insert([
      {
        nickname: userData.nickname,
        nickname_lower: nicknameLower,
        mascot: userData.mascot,
        platform: userData.platform,
        genres: userData.genres
      }
    ])
    .select()
    .single();


  /* =====================================================
     ERRO
     ===================================================== */

  if (error) {

    console.error(error);

    alert(
      "Não foi possível salvar seu perfil no banco. ❌\n\n" +
      error.message
    );

    return;
  }


  /* =====================================================
     SALVOU COM SUCESSO
     ===================================================== */

  console.log("Usuário salvo:", data);


  localStorage.setItem(
    "principeData",
    JSON.stringify(userData)
  );


  showUserBadge();

  showScreen("activation-screen");


  setTimeout(() => {

    showScreen("main-site");

  }, 3000);
}


/* =========================================================
   👑 MOSTRAR DADOS DO USUÁRIO
   ========================================================= */

function showUserBadge() {

  const badge =
    document.getElementById("user-badge");

  if (!badge) return;


  badge.innerHTML = `
    <strong>👑 ${escapeHTML(userData.nickname)}</strong>
    <span>${escapeHTML(userData.mascot)}</span>
    <span>${escapeHTML(userData.platform)}</span>
    <span>${userData.genres.map(genre =>
      escapeHTML(genre)
    ).join(" • ")}</span>
  `;

  badge.style.display = "flex";
}


/* =========================================================
   🔒 PROTEGER TEXTO HTML
   ========================================================= */

function escapeHTML(text) {

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   💾 RECUPERAR USUÁRIO DO NAVEGADOR
   ========================================================= */

function loadLocalUser() {

  const saved =
    localStorage.getItem("principeData");

  if (!saved) return;


  try {

    const data = JSON.parse(saved);

    if (
      data &&
      data.nickname &&
      data.mascot &&
      data.platform &&
      Array.isArray(data.genres)
    ) {

      userData = data;

      showUserBadge();
    }

  } catch (error) {

    console.error(
      "Erro ao carregar usuário:",
      error
    );
  }
}


/* =========================================================
   ⌨️ ENTER NO NICKNAME
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadLocalUser();


  const input =
    document.getElementById("nickname-input");


  if (input) {

    input.addEventListener("keydown", event => {

      if (event.key === "Enter") {

        event.preventDefault();

        saveNicknameAndContinue();
      }

    });
  }

});


/* =========================================================
   🧪 TESTE DE CONEXÃO
   ========================================================= */

async function testarBanco() {

  const { data, error } =
    await supabaseClient
      .from("principe_users")
      .select("nickname")
      .limit(1);


  if (error) {

    console.error(
      "❌ Erro ao conectar ao Supabase:",
      error
    );

    return;
  }


  console.log(
    "👑 Banco 1PRINCIPEBR conectado!",
    data
  );
}


/* =========================================================
   🚀 TESTAR BANCO
   ========================================================= */

testarBanco();

</script> 
/* =========================================================
   NOVAS VALIDAÇÕES DE NICKNAME (INCLUSIVAS)
   ========================================================= */

function isValidPrinceNickname(nickname) {
    if (!nickname || nickname.trim() === "") return false;
    const lowerNick = nickname.toLowerCase();
    // Obrigatório conter "principe" ou "princesa"
    return lowerNick.includes("principe") || lowerNick.includes("princesa");
}

function isValidMageNickname(nickname) {
    if (!nickname || nickname.trim() === "") return false;
    const lowerNick = nickname.toLowerCase();
    // Obrigatório conter "mago" ou "bruxa"
    return lowerNick.includes("mago") || lowerNick.includes("bruxa");
}

// Mensagens de erro para o usuário
function showPrinceNickError() {
    alert("Seu nickname precisa conter 'principe' ou 'princesa' para entrar no Reino!");
}

function showMageNickError() {
    alert("Seu nickname arcano precisa conter 'mago' ou 'bruxa' para abrir o Círculo!");
}
/* =========================================================
   1PRINCIPEBR - BLOCO COMPLETO DE JAVASCRIPT (EXPANSÃO)
   ========================================================= */

// Função universal para trocar de telas (caso precise no seu script principal)
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
    }
}

/* =========================================================
   VALIDAÇÃO DE NICKNAMES (INCLUSIVAS)
   ========================================================= */

function isValidPrinceNickname(nickname) {
    if (!nickname || nickname.trim() === "") return false;
    const lowerNick = nickname.toLowerCase();
    // Obrigatório conter "principe" ou "princesa"
    return lowerNick.includes("principe") || lowerNick.includes("princesa");
}

function isValidMageNickname(nickname) {
    if (!nickname || nickname.trim() === "") return false;
    const lowerNick = nickname.toLowerCase();
    // Obrigatório conter "mago" ou "bruxa"
    return lowerNick.includes("mago") || lowerNick.includes("bruxa");
}

// Mensagens de erro dinâmicas para o usuário
function showPrinceNickError() {
    alert("Seu nickname precisa conter 'principe' ou 'princesa' para entrar no Reino!");
}

function showMageNickError() {
    alert("Seu nickname arcano precisa conter 'mago' ou 'bruxa' para abrir o Círculo!");
}

/* =========================================================
   FUNÇÕES DO PAINEL ADMIN (LOGIN E LOGOUT SEGUROS)
   ========================================================= */

function attemptAdminLogin() {
    const email = document.getElementById("adminEmail").value;
    const pass = document.getElementById("adminPassword").value;
    
    // Validação com o e-mail e senha definidos por você
    if(email === "creck27736@gmail.com" && pass === "1principeou1mago") {
        // Esconde a tela de Login Admin e mostra o Dashboard
        document.getElementById("adminGateScreen").classList.add("hidden");
        document.getElementById("adminDashboardScreen").classList.remove("hidden");
    } else {
        alert("Acesso negado: E-mail ou senha incorretos.");
    }
}

function logoutAdmin() {
    // Esconde o Dashboard e volta para a tela de Login Admin
    document.getElementById("adminDashboardScreen").classList.add("hidden");
    document.getElementById("adminGateScreen").classList.remove("hidden");
    
    // Limpa os campos de texto
    const emailInput = document.getElementById("adminEmail");
    const passInput = document.getElementById("adminPassword");
    if (emailInput) emailInput.value = "";
    if (passInput) passInput.value = "";
}
