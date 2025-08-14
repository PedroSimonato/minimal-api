// API Configuration
const API_BASE_URL = "http://localhost:5005" // Ajuste para a URL da sua API
let authToken = localStorage.getItem("authToken")
let currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
let currentAdminPage = 1
let currentVehiclePage = 1

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  if (authToken && currentUser.email) {
    showMainContent()
  } else {
    showLoginSection()
  }

  setupEventListeners()
})

// Event Listeners
function setupEventListeners() {
  document.getElementById("loginForm").addEventListener("submit", handleLogin)
  document.getElementById("adminFormElement").addEventListener("submit", handleAdminSubmit)
  document.getElementById("vehicleFormElement").addEventListener("submit", handleVehicleSubmit)
}

// Authentication
async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  showLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/administradores/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha: password }),
    })

    if (response.ok) {
      const data = await response.json()
      authToken = data.token
      currentUser = { email: data.email, perfil: data.perfil }

      localStorage.setItem("authToken", authToken)
      localStorage.setItem("currentUser", JSON.stringify(currentUser))

      showToast("Login realizado com sucesso!", "success")
      showMainContent()
    } else {
      showToast("Credenciais inválidas!", "error")
    }
  } catch (error) {
    showToast("Erro ao conectar com o servidor!", "error")
    console.error("Login error:", error)
  }

  showLoading(false)
}

function logout() {
  authToken = null
  currentUser = {}
  localStorage.removeItem("authToken")
  localStorage.removeItem("currentUser")
  showLoginSection()
  showToast("Logout realizado com sucesso!", "success")
}

// UI Navigation
function showLoginSection() {
  document.getElementById("loginSection").style.display = "block"
  document.getElementById("mainContent").style.display = "none"
  document.getElementById("userInfo").style.display = "none"
}

function showMainContent() {
  document.getElementById("loginSection").style.display = "none"
  document.getElementById("mainContent").style.display = "block"
  document.getElementById("userInfo").style.display = "flex"

  document.getElementById("userEmail").textContent = currentUser.email
  document.getElementById("userRole").textContent = currentUser.perfil

  // Hide admin section if not admin
  if (currentUser.perfil !== "Adm") {
    document.getElementById("addAdminBtn").style.display = "none"
    document.querySelector(".tab-btn").style.display = "none"
    showTab("veiculos")
  } else {
    loadAdmins()
  }

  loadVehicles()
}

function showTab(tabName) {
  // Remove active class from all tabs and buttons
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Add active class to selected tab and button
  document.getElementById(tabName).classList.add("active")
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  if (tabName === "administradores") {
    loadAdmins()
  } else if (tabName === "veiculos") {
    loadVehicles()
  }
}

// Admin Management
function showAdminForm() {
  document.getElementById("adminForm").style.display = "block"
  document.getElementById("adminFormElement").reset()
}

function hideAdminForm() {
  document.getElementById("adminForm").style.display = "none"
}

async function handleAdminSubmit(e) {
  e.preventDefault()

  const email = document.getElementById("adminEmail").value
  const senha = document.getElementById("adminPassword").value
  const perfil = document.getElementById("adminRole").value

  showLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/administradores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ email, senha, perfil }),
    })

    if (response.ok) {
      showToast("Administrador criado com sucesso!", "success")
      hideAdminForm()
      loadAdmins()
    } else {
      const error = await response.json()
      showToast(error.mensagens ? error.mensagens.join(", ") : "Erro ao criar administrador!", "error")
    }
  } catch (error) {
    showToast("Erro ao conectar com o servidor!", "error")
    console.error("Admin creation error:", error)
  }

  showLoading(false)
}

async function loadAdmins(page = 1) {
  if (currentUser.perfil !== "Adm") return

  currentAdminPage = page
  showLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/administradores?pagina=${page}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const admins = await response.json()
      displayAdmins(admins)
      updateAdminPagination(admins.length)
    } else {
      showToast("Erro ao carregar administradores!", "error")
    }
  } catch (error) {
    showToast("Erro ao conectar com o servidor!", "error")
    console.error("Load admins error:", error)
  }

  showLoading(false)
}

function displayAdmins(admins) {
  const container = document.getElementById("adminsList")

  if (admins.length === 0) {
    container.innerHTML = '<p class="text-center">Nenhum administrador encontrado.</p>'
    return
  }

  container.innerHTML = admins
    .map(
      (admin) => `
        <div class="item">
            <div class="item-info">
                <h4>${admin.email}</h4>
                <p>Perfil: ${admin.perfil}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-warning" onclick="viewAdmin(${admin.id})">Ver</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateAdminPagination(itemsCount = 0) {
  document.getElementById("adminPageInfo").textContent = `Página ${currentAdminPage}`
  document.getElementById("prevAdminBtn").disabled = currentAdminPage <= 1

  const nextBtn = document.getElementById("nextAdminBtn")
  if (nextBtn) {
    nextBtn.disabled = itemsCount < 10
  }
}

async function viewAdmin(id) {
  console.log(`Tentando buscar admin ID: ${id}`)
  showLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/administradores/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const admin = await response.json()
      showSimplePopup("Detalhes do Administrador", [
        `ID: ${admin.id}`,
        `Email: ${admin.email}`,
        `Perfil: ${admin.perfil}`,
      ])
    } else {
      const errorText = await response.text()
      showToast(`Erro ${response.status}: ${errorText || "Erro desconhecido"}`, "error")
    }
  } catch (error) {
    console.error("Erro detalhado:", error)
    showToast(`Erro ao conectar: ${error.message}`, "error")
  }

  showLoading(false)
}

// Vehicle Management
function showVehicleForm(vehicle = null) {
  document.getElementById("vehicleForm").style.display = "block"

  if (vehicle) {
    document.getElementById("vehicleFormTitle").textContent = "Editar Veículo"
    document.getElementById("vehicleId").value = vehicle.id
    document.getElementById("vehicleName").value = vehicle.nome
    document.getElementById("vehicleBrand").value = vehicle.marca
    document.getElementById("vehicleYear").value = vehicle.ano
  } else {
    document.getElementById("vehicleFormTitle").textContent = "Novo Veículo"
    document.getElementById("vehicleFormElement").reset()
    document.getElementById("vehicleId").value = ""
  }
}

function hideVehicleForm() {
  document.getElementById("vehicleForm").style.display = "none"
}

async function handleVehicleSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("vehicleId").value
  const nome = document.getElementById("vehicleName").value
  const marca = document.getElementById("vehicleBrand").value
  const ano = Number.parseInt(document.getElementById("vehicleYear").value)

  const isEdit = !!id
  const url = isEdit ? `${API_BASE_URL}/veiculos/${id}` : `${API_BASE_URL}/veiculos`
  const method = isEdit ? "PUT" : "POST"

  showLoading(true)

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ nome, marca, ano }),
    })

    if (response.ok) {
      showToast(`Veículo ${isEdit ? "atualizado" : "criado"} com sucesso!`, "success")
      hideVehicleForm()
      loadVehicles()
    } else {
      const error = await response.json()
      showToast(
        error.mensagens ? error.mensagens.join(", ") : `Erro ao ${isEdit ? "atualizar" : "criar"} veículo!`,
        "error",
      )
    }
  } catch (error) {
    showToast("Erro ao conectar com o servidor!", "error")
    console.error("Vehicle submit error:", error)
  }

  showLoading(false)
}

async function loadVehicles(page = 1) {
  currentVehiclePage = page
  showLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/veiculos?pagina=${page}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const vehicles = await response.json()
      displayVehicles(vehicles)
      updateVehiclePagination(vehicles.length)
    } else {
      showToast("Erro ao carregar veículos!", "error")
    }
  } catch (error) {
    showToast("Erro ao conectar com o servidor!", "error")
    console.error("Load vehicles error:", error)
  }

  showLoading(false)
}

function displayVehicles(vehicles) {
  const container = document.getElementById("vehiclesList")

  if (vehicles.length === 0) {
    container.innerHTML = '<p class="text-center">Nenhum veículo encontrado.</p>'
    return
  }

  container.innerHTML = vehicles
    .map(
      (vehicle) => `
        <div class="item">
            <div class="item-info">
                <h4>${vehicle.nome}</h4>
                <p>Marca: ${vehicle.marca} | Ano: ${vehicle.ano}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-warning" onclick="viewVehicle(${vehicle.id})">Ver</button>
                ${currentUser.perfil === "Adm" || currentUser.perfil === "Editor" ? `<button class="btn btn-primary" onclick="editVehicle(${vehicle.id})">Editar</button>` : ""}
                ${currentUser.perfil === "Adm" ? `<button class="btn btn-danger" onclick="deleteVehicle(${vehicle.id})">Excluir</button>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

function updateVehiclePagination(itemsCount = 0) {
  document.getElementById("vehiclePageInfo").textContent = `Página ${currentVehiclePage}`
  document.getElementById("prevVehicleBtn").disabled = currentVehiclePage <= 1

  const nextBtn = document.getElementById("nextVehicleBtn")
  if (nextBtn) {
    nextBtn.disabled = itemsCount < 10
  }
}

async function viewVehicle(id) {
  console.log(`Tentando buscar veículo ID: ${id}`)
  showLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/veiculos/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const vehicle = await response.json()
      showSimplePopup("Detalhes do Veículo", [
        `ID: ${vehicle.id}`,
        `Nome: ${vehicle.nome}`,
        `Marca: ${vehicle.marca}`,
        `Ano: ${vehicle.ano}`,
      ])
    } else {
      const errorText = await response.text()
      showToast(`Erro ${response.status}: ${errorText || "Erro desconhecido"}`, "error")
    }
  } catch (error) {
    console.error("Erro detalhado:", error)
    showToast(`Erro ao conectar: ${error.message}`, "error")
  }

  showLoading(false)
}

async function editVehicle(id) {
  showLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/veiculos/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const vehicle = await response.json()
      showVehicleForm(vehicle)
    } else {
      showToast("Erro ao carregar veículo!", "error")
    }
  } catch (error) {
    showToast("Erro ao conectar com o servidor!", "error")
    console.error("Edit vehicle error:", error)
  }

  showLoading(false)
}

async function deleteVehicle(id) {
  if (!confirm("Tem certeza que deseja excluir este veículo?")) return

  showLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/veiculos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      showToast("Veículo excluído com sucesso!", "success")
      loadVehicles()
    } else {
      showToast("Erro ao excluir veículo!", "error")
    }
  } catch (error) {
    showToast("Erro ao conectar com o servidor!", "error")
    console.error("Delete vehicle error:", error)
  }

  showLoading(false)
}

// Utility Functions
function showLoading(show) {
  document.getElementById("loadingOverlay").style.display = show ? "flex" : "none"
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = `toast ${type}`
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Modal Functions
function showSimplePopup(title, details) {
  // Remove popup anterior se existir
  const existingPopup = document.getElementById("simplePopup")
  if (existingPopup) {
    existingPopup.remove()
  }

  // Cria o popup
  const popup = document.createElement("div")
  popup.id = "simplePopup"
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  `

  const content = document.createElement("div")
  content.style.cssText = `
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    padding: 0;
    border-radius: 16px;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
  `

  const header = document.createElement("div")
  header.style.cssText = `
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
  `

  const titleElement = document.createElement("h3")
  titleElement.textContent = title
  titleElement.style.cssText = `
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  `

  const closeButton = document.createElement("button")
  closeButton.innerHTML = "✕"
  closeButton.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: white;
    padding: 8px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-weight: bold;
  `

  closeButton.onmouseover = () => {
    closeButton.style.background = "rgba(255, 255, 255, 0.3)"
    closeButton.style.transform = "scale(1.1)"
  }
  closeButton.onmouseout = () => {
    closeButton.style.background = "rgba(255, 255, 255, 0.2)"
    closeButton.style.transform = "scale(1)"
  }

  const body = document.createElement("div")
  body.style.cssText = `
    padding: 24px;
  `

  body.innerHTML = details
    .map(
      (detail, index) => `
    <div style="
      margin-bottom: ${index === details.length - 1 ? "0" : "16px"};
      padding: 16px;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-radius: 12px;
      border-left: 4px solid #2563eb;
      font-size: 15px;
      font-weight: 500;
      color: #334155;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease;
    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
      ${detail}
    </div>
  `,
    )
    .join("")

  // Eventos para fechar
  closeButton.onclick = () => popup.remove()

  popup.onclick = (e) => {
    if (e.target === popup) {
      popup.remove()
    }
  }

  document.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape") {
      popup.remove()
      document.removeEventListener("keydown", escHandler)
    }
  })

  // Monta o popup
  header.appendChild(titleElement)
  header.appendChild(closeButton)
  content.appendChild(header)
  content.appendChild(body)
  popup.appendChild(content)
  document.body.appendChild(popup)

  console.log("Popup criado e exibido com sucesso!")
}
