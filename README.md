Badanbekhoon — Time-Locked Messages to Your Future Self

A minimalist, local-first React Native app for sending time-locked messages to your future self.

✉️ Badanbekhoon — "If you're ever tempted to do this again, remember why you stopped."



📖 About

Badanbekhoon is a deeply personal, emotion-driven mobile app that lets you write down your thoughts, decisions, reminders, or confessions — and lock them away until a specific date.

It acts as a digital time capsule for your intentions. Whether it's a reminder of why you quit a habit, a note of encouragement for your future self, or a goal for three months from now, Badanbekhoon keeps it safe, private, and out of sight until the moment is right.

The project is built on three core pillars:





Absolute Privacy (Local-First): There is no backend, no cloud database, and no login system. All your data stays strictly on your device.



Minimalism: No unnecessary noise. Just write, set a date, and let time do the rest.



Emotional Value: A space for meaningful self-reflection and an honest dialogue with your future self.

⚡ Key Features





🔒 Smart Time-Lock Logic: Locked messages are isolated at the domain level — not just hidden in the UI. Their bodies are inaccessible through list or read operations until the lock time (derived from the message's unlockAt timestamp) has passed.



📱 Native RTL Support: Optimized for right-to-left languages, delivering a seamless Persian experience with a modern, polished look.



💾 Secure Local Storage: Persistence is implemented with a clean repository pattern on top of Async Storage — an asynchronous, persistent key-value store that keeps data across app restarts.



🧪 Test-Driven Privacy: Comprehensive Jest unit tests cover domain validation, persistence behavior, and locked-content isolation, so message bodies can never leak through UI, logs, or error output.



🚫 Offline-First: No API calls, no servers, no internet dependency. It works anywhere, anytime.

🏗 Architecture

The project follows a clean, modular architecture to keep development and maintenance simple:

BADANBEKHOON/
├── src/
│   ├── domain/        # Business logic, validation rules, and message entities
│   ├── repository/    # Local storage adapter (AsyncStorage persistence layer)
│   ├── screens/       # Main screens (Home, Create, Reveal)
│   ├── components/    # Reusable UI components (MessageCard, etc.)
│   └── theme/         # Shared design system and styles
├── __tests__/         # Unit tests for validation, persistence, and privacy
└── PLAN.md            # Development roadmap and milestone documentation


🚀 Getting Started

To run the project locally:





Clone the repository:

git clone https://github.com/your-username/badanbekhoon.git
cd badanbekhoon/BADANBEKHOON






Install dependencies:

npm install
# or
yarn install






Run the Android build:

npx react-native run-android


🗺 Roadmap (Milestones)





Milestone 1: Foundation, Design System, Navigation, and RTL setup.



Milestone 2: Local Persistence, Domain Validation, and Locked-Content Privacy.



Milestone 3: Local Notification integration for "Unlock" reminders.



Milestone 4: Polishing, Animations, and MVP Finalization.

Future ideas beyond the MVP include photos and videos, voice messages, locations, occasions, a home-screen widget, and ready-made capsule templates.

🤝 Contributing & 📄 License

This is an open-source, indie-focused project. If you have ideas for features, design improvements, or bug fixes, feel free to open an issue or submit a Pull Request.



License: This project is licensed under the MIT License — see the LICENSE file for details.
