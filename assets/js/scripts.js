// --- GLOBAL STATE ---

let currentUser = null; // Stores logged-in user role: 'patient', 'doctor', 'admin', or null
let availableDoctors = []; // Stores the list of public doctors

// --- DOM ELEMENTS (Must match index.html IDs) ---
const pages = document.querySelectorAll(".page-content");
const publicNav = document.getElementById("public-nav");
const dashboardNav = document.getElementById("dashboard-nav");
const userRoleDisplay = document.getElementById("user-role-display");
const loginForm = document.getElementById('loginForm'); 
const registrationForm = document.getElementById("registrationForm");
const languagePickerBtn = document.getElementById("languagePickerBtn");
const languageDropdown = document.getElementById("languageDropdown");
// DYNAMIC FORMS AND LISTS
const createAppointmentForm = document.getElementById('createAppointmentForm');
const screeningForm = document.getElementById('screeningForm');
const appointmentsList = document.getElementById('appointmentsList');
const notificationsList = document.getElementById('notificationsList');
const doctorDropdown = document.getElementById('apptDoctorId'); // The select element for booking

// --- PAGE MAPPING (All page IDs from index.html) ---
const PAGE_MAPPING = {
  home: "home",
  login: "login",
  registration: "registration",
  "public-info": "public-info",
  "patient-dashboard": "patient-dashboard",
  "doctor-dashboard": "doctor-dashboard",
  "admin-dashboard": "admin-dashboard",
  "profile-settings": "profile-settings",
  "health-screening": "health-screening",
  ehr: "ehr",
  "appointment-booking": "appointment-booking",
  "appointment-list": "appointment-list",
  teleconsultation: "teleconsultation",
  "prescription-list": "prescription-list", // Patient view
  "patient-list": "patient-list", // Doctor/Admin view
  "prescription-form": "prescription-form", // Doctor action
  "user-management": "user-management", // Admin action
  reports: "reports", // Doctor/Admin view
};

// --- NAVIGATION & UI FUNCTIONS ---

function navigate(targetPageId, role = null) {
  if (role) {
    currentUser = role;
    if (role === "patient") {
      targetPageId = "patient-dashboard";
    } else if (role === "doctor") {
      targetPageId = "doctor-dashboard";
    } else if (role === "admin") {
      targetPageId = "admin-dashboard";
    }
  }

  const finalPageId = PAGE_MAPPING[targetPageId] || targetPageId;
  pages.forEach((page) => (page.style.display = "none"));
  const targetPage = document.getElementById(finalPageId);
  if (targetPage) {
    targetPage.style.display = "block";
    window.scrollTo(0, 0); 
    
    // Trigger data loading based on the page
    if (finalPageId.includes('-dashboard')) {
        loadDashboardData(finalPageId);
    }
    if (finalPageId === 'appointment-booking') {
        populateDoctorDropdown(); // Load doctors before booking
    }
  } else {
    document.getElementById("home").style.display = "block";
    currentUser = null;
    console.error(`Page ID '${finalPageId}' not found.`);
  }

  updateHeaderNav();
}

function handleDashboardNavigation(targetPage) {
  if (!currentUser) {
    alert("You must be logged in to access this feature.");
    return;
  }
  navigate(targetPage);
}

function updateHeaderNav() {
  const storedRole = localStorage.getItem('currentUserRole');
  // Update the global state from local storage
  currentUser = storedRole;
  
  if (currentUser) {
    publicNav.style.display = "none";
    dashboardNav.style.display = "flex";
    userRoleDisplay.textContent = `Role: ${
      currentUser.charAt(0).toUpperCase() + currentUser.slice(1)
    }`;
  } else {
    publicNav.style.display = "flex";
    dashboardNav.style.display = "none";
  }
}

function logout() {
  clearToken(); 
  localStorage.removeItem('currentUserRole');
  localStorage.removeItem('currentUser'); 
  currentUser = null;
  alert("Logged out successfully.");
  navigate("home");
}

// --- API CONFIG & UTILITIES ---
const baseUrl = "http://localhost:8080"; 

function saveToken(token) { localStorage.setItem('authToken', token); }
function getToken() { return localStorage.getItem('authToken'); }
function clearToken() { localStorage.removeItem('authToken'); }

async function apiFetch(path, method='GET', body=null, extraHeaders={}) {
  const url = `${baseUrl}/api${path}`; 
  const headers = { ...extraHeaders };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  };
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    throw { status: res.status, body: data };
  }
  return data;
}

// --- CORE API FUNCTIONS (Matches Backend API List) ---

// AUTH
async function login(email, password) {
  const body = { email, password };
  const res = await apiFetch('/auth/login', 'POST', body);
  if (res && res.token) {
    saveToken(res.token);
    if (res.user) {
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        // Use the role from the token and normalize it
        localStorage.setItem('currentUserRole', res.user.roles[0].toLowerCase().replace('role_', '')); 
    }
    return res;
  }
  throw new Error('Login failed');
}

// PUBLIC LOOKUP (Includes Availability Check Logic)
async function listAvailableDoctors() {
    try {
        // Calls the public endpoint which returns DoctorDTOs (ID, Name, isAvailable)
        return await apiFetch('/public/doctors', 'GET');
    } catch(e) {
        console.error("Failed to fetch doctors:", e);
        return [];
    }
}

// APPOINTMENTS
async function createAppointment(appt) { return apiFetch('/appointments', 'POST', appt); }
async function getAppointment(id) { return apiFetch(`/appointments/${id}`, 'GET'); }
async function listAppointments() { return apiFetch('/appointments', 'GET'); }
async function getAppointmentJoinInfo(id) { return apiFetch(`/appointments/${id}/join-info`, 'GET'); }

// CONSULTATIONS
async function listUpcomingConsultations() { return apiFetch('/consultations/upcoming', 'GET'); }
async function getConsultationJoinInfo(id) { return apiFetch(`/consultations/${id}/join-info`, 'GET'); }
async function startConsultation(id) { return apiFetch(`/consultations/${id}/start`, 'POST'); }
async function endConsultation(id) { return apiFetch(`/consultations/${id}/end`, 'POST'); }

// EHR
async function listEncounters(patientId) { return apiFetch(`/ehr/encounters?patientId=${patientId}`, 'GET'); }
async function listPrescriptions(patientId) { return apiFetch(`/ehr/prescriptions?patientId=${patientId}`, 'GET'); }
// Function to download PDF file
async function downloadRxPdf(id) { 
    const url = `${baseUrl}/api/ehr/prescriptions/${id}/pdf`;
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Must include the headers in the options object for fetch
    const res = await fetch(url, { headers: headers }); 
    
    if (!res.ok) { alert('Failed to download PDF.'); return; }
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prescription-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

// HEALTH / VITALS
async function createScreening(payload) { return apiFetch('/health/vitals', 'POST', payload); }
async function listVitals(patientId) { return apiFetch(`/health/vitals?patientId=${patientId}`, 'GET'); }

// ADMIN
async function getAdminStats() { return apiFetch('/admin/stats', 'GET'); }
async function getAdminUsers() { return apiFetch('/admin/users', 'GET'); } // Added Admin User list function

// CSV DOWNLOAD (Uses generic downloadCsv utility)
async function downloadCsv(path, filename='download.csv') {
  const url = `${baseUrl}/api${path}`; 
  const token = getToken();
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const options = { headers };

  const res = await fetch(url, options);
  if (!res.ok) { alert('Download failed: ' + res.statusText); return; }
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}


// --- DYNAMIC DATA POPULATION LOGIC ---

function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return user ? user.id : null;
}

/**
 * Fetches the public list of Doctors and populates the dropdown.
 */
async function populateDoctorDropdown() {
    if (!doctorDropdown) return;
    
    doctorDropdown.innerHTML = '<option value="" disabled selected>Select Doctor (Specialty)</option>';
    
    availableDoctors = await listAvailableDoctors();

    if (availableDoctors && availableDoctors.length > 0) {
        availableDoctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            // Uses clean name and role from the DTO
            option.textContent = `${doctor.name} (${doctor.specialty}) ${doctor.isAvailable ? '' : '(BUSY)'}`; 
            // Disable busy doctors in the dropdown
            if (!doctor.isAvailable) {
                 option.disabled = true;
            }
            doctorDropdown.appendChild(option);
        });
    } else {
         const option = document.createElement('option');
         option.value = '';
         option.textContent = 'No Doctors Currently Available';
         doctorDropdown.appendChild(option);
    }
}

async function loadPatientDashboardData() {
    const userId = getCurrentUserId();
    if (!userId) return;

    // Load patient appointments
    try {
        // Use the global listAppointments API call
        const appointments = await listAppointments(); 
        const container = document.getElementById('appointmentsList'); 
        
        // As a short term solution, this code will be placed in a placeholder element in the DOM 
        // so it doesn't try to access an element ID that doesn't exist on the patient-dashboard HTML.
        const appointmentsListContainer = document.getElementById('appointmentsListFill');
        if (appointmentsListContainer && appointments) {
            appointmentsListContainer.innerHTML = appointments.map(appt => `
                <li class="p-4 bg-gray-800 rounded-lg shadow-2xl flex justify-between items-center border border-gray-700 transform hover:scale-[1.01] transition duration-300">
                    <div>
                        <p class="font-semibold text-white">${appt.title} - Dr. ${appt.doctor.name}</p>
                        <p class="text-sm text-green-400 font-medium">Status: ${appt.status}</p>
                        <p class="text-xs text-gray-400">${new Date(appt.scheduledAt).toLocaleString()}</p>
                    </div>
                    <div class="space-x-2">
                        <button onclick="getAppointmentJoinInfo(${appt.id})" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 shadow-md">Join Call</button>
                    </div>
                </li>
            `).join('');
        }
        
    } catch (e) {
        console.error("Failed to load appointments:", e);
    }
}

function loadDashboardData(dashboardId) {
    if (dashboardId === 'patient-dashboard') {
        loadPatientDashboardData();
    }
    // Add loadDoctorDashboardData and loadAdminDashboardData here
}


// --- FORM HANDLERS AND LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {

  // --- LOGIN FORM HANDLER (FIXED) ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      try {
        // 1. Attempt API Login
        const r = await login(email, password);
        
        // 2. Extract Role and Navigate ONLY on successful API response (Status 200)
        // Ensure the role is consistently lowercase and clean (e.g., 'patient', 'doctor')
        const role = r.user.roles[0].toLowerCase().replace('role_', '');
        
        console.log(`[LOGIN SUCCESS] User role determined: ${role}`); // Add console log for verification
        
        // *** CRITICAL FIX: Removed the alert() that was blocking UI navigation ***
        // alert('Login successful!'); 
        
        e.target.reset();
        // Call navigate, which will set currentUser, store it, and trigger UI changes
        navigate("dashboard", role); 

      } catch (err) {
        // 3. Handle API Failure
        console.error("[LOGIN API FAILED]:", err);
        const message = err.body?.message || `API Error: Status ${err.status || 'Unknown'}`;
        
        // This alerts the real failure (e.g., Bad Credentials, or Token Validation Failure)
        alert('Login failed: ' + message); 
      }
    });
  }

  // --- APPOINTMENT FORM HANDLER ---
  if (createAppointmentForm) {
    createAppointmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userId = getCurrentUserId();
      const doctorId = document.getElementById('apptDoctorId').value;

      if (!userId || !getToken() || !doctorId) { 
          alert('Please select a doctor and ensure you are logged in.'); return; 
      }
      
      let scheduledAtValue = document.getElementById('apptScheduledAt').value;
      if (scheduledAtValue && scheduledAtValue.length === 16) { 
          scheduledAtValue += ":00"; // Ensure YYYY-MM-DDTThh:mm:ss format (Required for Java backend)
      } else if (!scheduledAtValue) {
          alert("Please select a date and time."); return;
      }
      
      // Send FLAT JSON (patientId, doctorId)
      const payload = {
        title: document.getElementById('apptTitle').value || "New Consultation",
        scheduledAt: scheduledAtValue, 
        notes: document.getElementById('apptNotes').value,
        status: 'SCHEDULED',
        patientId: userId, 
        doctorId: Number(doctorId) 
      };
      
      try {
        const created = await createAppointment(payload);
        alert('Appointment created! ID: ' + created.id);
        handleDashboardNavigation('appointment-list');
      } catch (err) {
        console.error(err);
        alert('Appointment creation failed: ' + (err.body?.message || err.status || err));
      }
    });
  }

  // --- SCREENING FORM HANDLER ---
  if (screeningForm) {
    screeningForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userId = getCurrentUserId();
      if (!userId || !getToken()) { alert('Please log in first.'); return; }
      
      const payload = {
        userId: userId, 
        systolic: Number(document.getElementById('systolic').value),
        diastolic: Number(document.getElementById('diastolic').value),
        glucose: Number(document.getElementById('glucose').value), 
        glucoseType: document.getElementById('glucoseType').value,
        heightCm: Number(document.getElementById('heightCm').value),
        weightKg: Number(document.getElementById('weightKg').value),
        takenAt: new Date().toISOString() 
      };
      
      try {
        await createScreening(payload);
        alert('Health screening data submitted.');
        handleDashboardNavigation('patient-dashboard');
      } catch (err) {
        alert('Save screening failed: ' + (err.body?.message || err.status || err));
        console.error(err);
      }
    });
  }

  // --- REGISTRATION LOGIC SIMULATION ---
  if (registrationForm) {
    registrationForm.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("[REG]: Registration data submitted for patient.");

      // This simulates a successful registration and redirects to login
      alert("Registration Successful! Redirecting to Login to activate account.");
      registrationForm.reset();
      navigate("login");
    });
  }

  // --- LANGUAGE PICKER LOGIC ---
  if (languagePickerBtn) {
    languagePickerBtn.addEventListener("click", () => {
      languageDropdown.classList.toggle("hidden");
    });

    languageDropdown.querySelectorAll("a").forEach((option) => {
      option.addEventListener("click", (e) => {
        e.preventDefault();
        languageDropdown.classList.add("hidden");
        const newLang = e.target.getAttribute("data-lang").toUpperCase();
        languagePickerBtn.innerHTML = `${newLang} <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
        alert(`[LANGUAGE]: Language changed to ${newLang}. (Full translation is a backend feature)`);
      });
    });

    document.addEventListener("click", (event) => {
      if (
        !languagePickerBtn.contains(event.target) &&
        !languageDropdown.contains(event.target)
      ) {
        languageDropdown.classList.add("hidden");
      }
    });
  }
  
  // --- CSV DOWNLOAD BUTTONS (Admin Dashboard) ---
  const dlApptBtn = document.getElementById('downloadAppointmentsCsv');
  if (dlApptBtn) {
    dlApptBtn.addEventListener('click', async () => {
      if (currentUser !== 'admin' || !getToken()) { alert('Admin privileges required.'); return; }
      try { await downloadCsv('/admin/export/appointments.csv','appointments.csv'); }
      catch(e){ console.error(e); }
    });
  }
  const dlScreenBtn = document.getElementById('downloadScreeningsCsv');
  if (dlScreenBtn) {
    dlScreenBtn.addEventListener('click', async () => {
      if (currentUser !== 'admin' || !getToken()) { alert('Admin privileges required.'); return; }
      try { await downloadCsv('/admin/export/screenings.csv','screenings.csv'); }
      catch(e){ console.error(e); }
    });
  }

  // --- INITIALIZATION ---
  const storedRole = localStorage.getItem('currentUserRole');
  if (storedRole) {
      currentUser = storedRole;
      navigate("dashboard", currentUser);
  } else {
    navigate("home");
  }
});