# Contributing Guidelines

Thank you for considering contributing to **Jeanne AI Chatbot Project**! ✨  
We welcome contributions that help improve features, fix bugs, add documentation, or enhance the user experience.

---

## 🛠 How to Contribute

### 1. Fork the repository
Click the **Fork** button on the top-right of the repository page on GitHub.

### 2. Clone your fork
Clone your forked repository to your local machine:

```bash
git clone https://github.com/<your-username>/Jeanne-AI-Chatbot-Project.git
cd Jeanne-AI-Chatbot-Project
```

### 3. Add the upstream (only once)
To stay up to date with the original repository:

```bash
git remote add upstream https://github.com/<original-owner>/Jeanne-AI-Chatbot-Project.git
```

### 4. Create a new branch
Always create a branch for your changes:

```bash
git checkout -b feature-name
```

### 5. Make your changes
Follow the **project structure**:

- Frontend code goes into the `client/` folder (React + Vite)
- Backend code goes into the `server/` folder (Express + Node.js)
- Keep `.env` files private (do not commit them)

Test your changes locally:

```bash
# Start frontend and backend together
npm run dev
```

### 6. Commit your changes
Write a meaningful commit message:

```bash
git add .
git commit -m "Add: description of your changes"
```

### 7. Keep your fork updated
Before pushing, fetch and rebase with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

Resolve any conflicts if prompted.

### 8. Push and open a Pull Request
Push your branch:

```bash
git push origin feature-name
```

Then open a Pull Request from your fork to the main repository.

---

## 💡 Areas You Can Contribute To

- Improving the chatbot UI (frontend)
- Enhancing backend APIs and routes
- Adding new features (e.g., voice features, new personalities)
- Documentation improvements
- Bug fixes and testing

---

## 💡 Tips for Contributions

- Make small, focused pull requests.
- Write clear commit messages.
- Ensure your code runs without errors locally.
- Update documentation (README/CONTRIBUTING) if needed.

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🤝 Need Help?

If you face any difficulty while contributing, feel free to open an issue or reach out to the maintainers.

---

Happy Coding! 🎉
