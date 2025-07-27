# 🚗 Smart Driver Monitoring System  
### Real-time Attention Tracking for Safer Roads

![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)  
![OpenCV](https://img.shields.io/badge/OpenCV-Vision-brightgreen?style=for-the-badge&logo=opencv)  
![MediaPipe](https://img.shields.io/badge/MediaPipe-FaceMesh-orange?style=for-the-badge&logo=google)  
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

---

## 📍 Project Overview

The **Smart Driver Monitoring System** is a Python-based, vision-driven application designed to enhance road safety by continuously monitoring a driver's focus in real time. It uses **OpenCV** and **MediaPipe** to detect attention lapses and provides escalating alerts — from visual feedback to haptic/audio alarms.

> 🧠 This system simulates a driver-assistive safety feature found in advanced vehicles using accessible tools and real-time computer vision.

---

## 🔍 Core Features

- 👁️ **Retina-based Eye & Face Tracking**
- ⚠️ **Distraction Detection** using MediaPipe FaceMesh
- 🧠 **Tiered Alert System**: Visual ⮕ Audio
- 📊 **Focus Scoring System** with Live Feedback
- 📝 **Auto-generated PDF Report** of driver focus stats

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Python     | Core language |
| OpenCV     | Webcam capture & overlays |
| MediaPipe  | Real-time face/eye detection |
| playsound  | Audio alert system |
| FPDF       | PDF report generation |

---

## 📁 Project Structure

```
driver_monitoring_system/
├── main.py                 # Entry point
├── retina_tracker.py       # Eye detection and focus logic
├── alert_manager.py        # Alert escalation handler
├── report_generator.py     # PDF summary of session
├── assets/
│   └── alarm.wav           # Alarm sound file
├── reports/
│   └── *.pdf               # Auto-generated focus reports
└── requirements.txt        # Python dependencies
```

## 🚀 Getting Started


###  Install Dependencies
```bash
pip install -r requirements.txt
```

### Run the App
```bash
python main.py
```

> Press `Q` to end the session and generate your focus report.

---

## 📄 Output

- Live webcam preview with real-time focus status
- Focus Score (e.g., 92%) on screen
- Alert when driver looks away for too long
- PDF report saved in the `/reports` folder

---

## 📌 Future Improvements

- Head pose estimation
- Nighttime/IR support
- Voice alert system
- Streamlit web interface
