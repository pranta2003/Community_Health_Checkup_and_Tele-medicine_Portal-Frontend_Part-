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


---

## ⚙️ Run Locally

### 🔹 Option A — Live Server (Recommended)
Right-click index.html → Open with Live Server


### 🔹 Option B — npm static server
```bash
npm install -D live-server
npx live-server
```
🔹 Option C — Docker
```bash
docker build -t health-connect .
docker run -p 8080:80 health-connect
```
🩺 Teleconsultation Flow (Demo)
```
Patient books appointment

Patient requests video consultation

Doctor clicks Start Call, which generates:

js
https://meet.jit.si/health-connect-<id>-<random>
Both open teleconsultation page → iframe loads the Jitsi URL
```
🔥 Demo Preview Page
Open this file locally for the animated showcase:
```
README-demo.html
```
📝 License
```
MIT License — free to modify & use.
```
