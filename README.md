Got it Spidey 👍
You want the **folder structure block also formatted as code** so it stretches full width properly.
Here’s the **fixed README.md** version with the `tree` section in a proper code block ✅

````markdown
# 📖 Online Diary

An **online diary web application** that allows users to securely write, save, and manage their personal thoughts, notes, and daily experiences.  
Built using **React, Firebase Authentication, and Firestore** for seamless and secure data handling.

---

## 🚀 Features

- ✨ Simple and clean UI  
- 🔐 User authentication (Google login + Email/Password)  
- 📝 Create, edit, and delete diary entries  
- ☁️ Data stored securely in **Firestore**  
- 📱 Responsive design for mobile and desktop  
- ⚡ Fast and lightweight (React + Tailwind CSS)  

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS  
- **Backend:** Firebase Firestore  
- **Authentication:** Firebase Auth (Google + Email/Password)  
- **Hosting:** Firebase Hosting  

---

## 📂 Project Structure

```bash
online-diary/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # App pages (Login, Register, Diary, etc.)
│   ├── firebase.js       # Firebase config & setup
│   ├── App.js            # Main app entry
│   └── index.js          # React root
├── package.json
├── README.md
└── LICENSE
````

---

## ⚙️ Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/<your-username>/online-diary.git
   cd online-diary
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**

   * Go to [Firebase Console](https://console.firebase.google.com/)
   * Create a new project
   * Enable Authentication (Google + Email/Password)
   * Create a Firestore Database
   * Add your config to `src/firebase.js`:

     ```js
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

4. **Run the app**

   ```bash
   npm start
   ```

---

## 📖 Usage

1. Sign Up / Log In with Google or Email
2. Write your diary entries in a secure editor
3. View, update, or delete your past entries anytime

---

## 🔒 Security

* Firestore security rules ensure that users can only access their own diary entries.
* Authentication is handled with Firebase Auth.
* CSP headers included in `index.html` for added protection.

---

## 📜 License

This project is licensed under the **MIT License** – see the LICENSE file for details.

👤 **Owner:** Emmanuel (2025)

---

## 🌟 Contributing

Contributions are welcome! Feel free to:

* Open an issue
* Submit a pull request
* Suggest improvements

---

## 📬 Contact

* 👤 Emmanuel
* 📧 Email: \[your email here]
* 🔗 GitHub: [https://github.com/your-username](https://github.com/your-username)

```

---

Spidey, this way the **tree is aligned properly as code** and will show clean in GitHub.  

👉 Do you also want me to give you a **ready-made LICENSE.md (MIT)** file so you can just drop it in your repo?
```
