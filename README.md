# School Management System - QR Attendance

A seamless QR code attendance solution for PM SHRI Schools, fully integrated with the **School Management System plugin by Mojoomla**. This plugin provides an easy-to-use interface for marking student and teacher attendance using a webcam to scan generated QR codes.

![A screenshot of the redesigned, modern user interface for the QR attendance scanner page](https://i.imgur.com/g8zJbLq.png)

## ✨ Features

- **QR Code Scanning:** Use your device's camera to scan QR codes for attendance.
- **Dual Mode:** Easily switch between scanning for Students and Teachers (Admin-only).
- **Live Attendance Log:** See a real-time log of all successful scans for the day.
- **ID Card Generation:**
    - Generate and print individual ID cards with QR codes directly from user profiles.
    - Bulk print ID cards for an entire class.
- **Seamless Integration:** Designed to work directly with the data from the School Management System plugin.
- **Modern UI:** A clean, responsive interface that integrates well with the WordPress dashboard.

## ⚙️ Prerequisites

This plugin is an **add-on** and requires the following plugin to be installed and activated:

- **[School Management System](https://codecanyon.net/item/school-management-system-for-wordpress/11441542)** by Mojoomla.

## 🚀 Installation

### Option 1: Install via WordPress Admin (Recommended)

1.  Navigate to the **[Releases](https://github.com/your-username/your-repo-name/releases)** page of this GitHub repository. *(Note: Replace with your actual releases link)*.
2.  Download the latest `smgt-qr-attendance.zip` file.
3.  Log in to your WordPress dashboard and go to **Plugins → Add New**.
4.  Click the **Upload Plugin** button at the top of the page.
5.  Select the `smgt-qr-attendance.zip` file you downloaded and click **Install Now**.
6.  Once installed, click **Activate Plugin**.

### Option 2: Manual Installation via FTP

1.  Download the latest release zip file from GitHub and extract it.
2.  Upload the entire `smgt-qr-attendance` folder to the `/wp-content/plugins/` directory of your WordPress site.
3.  Log in to your WordPress dashboard, go to **Plugins**, find "School Management System - QR Attendance" in the list, and click **Activate**.

## 📖 Usage

After activation, the plugin's features will be available within your WordPress admin dashboard, under the main **School Management** menu.

### Scan Attendance

1.  Navigate to **School Management → Scan Attendance**.
2.  Grant camera permissions if prompted by your browser.
3.  If you are an administrator, you can switch between **Student** and **Teacher** scanning modes using the tabs.
4.  Position the QR code on an ID card in front of the camera.
5.  Upon a successful scan, attendance will be logged automatically, and a confirmation will appear. The scan log on the right will update in real-time.

### Generating ID Cards

**For a Single User:**

1.  Navigate to **Users** and select a student or teacher profile to edit.
2.  Scroll down to the "QR Attendance ID Card" section.
3.  You can print this card directly from your browser's print function (Ctrl/Cmd + P).

**For an Entire Class (Bulk Print):**

1.  Navigate to **School Management → Bulk Print ID Cards**.
2.  Select a class from the dropdown menu and click **Generate**.
3.  All ID cards for students in that class will be displayed. Use your browser's print function to print them.

## 📦 Source Code

This plugin includes a feature to download its own source code for backup or development purposes.

1.  Navigate to **School Management → Bulk Print ID Cards**.
2.  Under the "Plugin Management" section, click the **Download Plugin Source (.zip)** button.
