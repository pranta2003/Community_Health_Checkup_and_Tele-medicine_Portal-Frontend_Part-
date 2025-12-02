<p align="center">
  <img alt="Health Connect" src="assets/images/glow-badge.svg" width="260" />
</p>

# Health Connect — Frontend

A polished single-page front-end for a Tele-medicine & Community Health Checkup portal.  
Designed for **patients**, **doctors**, and **administrators** with clean UI, responsive layout,  
and demo teleconsultation flow (Jitsi placeholder).

---

## 📸 Screenshots

<p align="center">
  <img src="assets/images/hero.jpg" width="720" alt="Hero UI" />
</p>

<p align="center">
  <img src="assets/images/patient-dashboard.jpg" width="720" alt="Patient Dashboard" />
</p>

<p align="center">
  <img src="assets/images/teleconsultation.jpg" width="720" alt="Teleconsultation Screen" />
</p>

---

## 🚀 Features

- Fully responsive **single-page** layout  
- **Role-based dashboards** (Patient / Doctor / Admin)  
- Local demo auth using `localStorage`  
- Appointment booking & teleconsultation flow  
- Clean & glowing interactive UI  
- Smooth page navigation handled by `scripts.js`  
- Teleconsultation via generated Jitsi URL (demo mode)

---

## 📂 Project Structure

README.md
README-demo.html
index.html

assets/
css/styles.css
js/scripts.js
images/
hero.jpg
patient-dashboard.jpg
teleconsultation.jpg
glow-badge.svg

yaml
Copy code

---

## ⚙️ Run Locally

### 🔹 Option A — Live Server (Recommended)
Right-click index.html → Open with Live Server

pgsql
Copy code

### 🔹 Option B — npm static server
```bash
npm install -D live-server
npx live-server
```
🔹 Option C — Docker
```bash
Copy code
docker build -t health-connect .
docker run -p 8080:80 health-connect
```
✨ UI Animations & Glow Effects
```
css
Copy code
/* entrance animation */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in-up {
  animation: fadeUp .6s cubic-bezier(.22,.9,.32,1) both;
}

/* glowing button */
.btn-glow {
  background: linear-gradient(90deg, #7862ff, #00c8ff);
  color: white;
  padding: .6rem 1.1rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.45), 0 0 18px rgba(120,98,255,.18);
  transition: .18s ease;
}
.btn-glow:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 50px rgba(0,0,0,.5), 0 0 28px rgba(120,98,255,.35);
}

/* card glow */
.card-glow {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}
.card-glow::after {
  content: "";
  position: absolute;
  inset: -30% -40%;
  background: radial-gradient(circle at 10% 10%, rgba(120,98,255,.12), transparent 20%);
  pointer-events: none;
}
```
🩺 Teleconsultation Flow (Demo)
```
Patient books appointment

Patient requests video consultation

Doctor clicks Start Call, which generates:

js
Copy code
https://meet.jit.si/health-connect-<id>-<random>
Both open teleconsultation page → iframe loads the Jitsi URL
```
🔥 Demo Preview Page
Open this file locally for the animated showcase:
```
README-demo.html
```
📝 License
MIT License — free to modify & use.
