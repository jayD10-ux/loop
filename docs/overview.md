
**Loop — Product Overview (v1.0)**

This document provides a clear and focused overview of Loop, a platform for managing, sharing, and gathering feedback on UI prototypes. It is the foundational reference for all future documentation.

---

### What is Loop?

Loop is a collaborative platform for storing, previewing, and collecting feedback on UI prototypes. It is designed to support both enterprise teams and individual creators throughout the design and product development process.

Users can upload or link to their prototypes, share them with others, and collect structured feedback in context. The platform supports live previews, threaded comments, and collection/grouping of prototypes.

Loop is **not** a design tool or analytics platform — it is a **feedback and collaboration layer** that sits between design and implementation.

### Who It's For

Loop serves two types of users.

1. **Enterprise Teams**

   - Upload Figma designs or interactive code prototypes
   - Perform QA collaboratively
   - Collect structured feedback across screens
   - Use it as part of design reviews and grooming sessions

2. **Individual Users**

   - Upload and organize prototypes
   - Share links with teammates or collaborators
   - Get quick feedback and iterate

---

### Core Value

Loop creates a focused, opinionated environment where:

- Prototypes are **interactive**, not static
- Feedback is **structured** and **localized**
- Sharing is **frictionless**, and previews are consistent
- Teams and individuals both get value from day one

---

### What Loop Is (and Is Not)

**Loop is:**

- A place to upload and view interactive UI prototypes
- A way to comment on and discuss those prototypes in real-time
- A tool for organizing and grouping prototypes into collections
- A workspace that works equally well for teams and solo creators

**Loop is not:**

- A visual design editor
- An analytics platform
- A project management system
- A user research tool

---

### Technology & Systems

- **Authentication**: Powered by Clerk (multi-user aware, enterprise-ready)
- **Feedback & Notifications**: Handled via Novu (real-time, in-app, email)
- **Preview Layer**: Based on CodeSandbox iframe previews
- **Uploads**: Supports both GitHub repo imports and manual ZIP uploads
- **Environments**: Separate staging and production with a deploy flow that ensures sync

---

### Initial Feature Set (v1)

Loop v1 includes:

- Dashboard with tabbed navigation
  - All prototypes
  - Shared with me
  - Collections (grouping)
- Add Prototype flow
  - Paste link, upload file, link Figma
  - Assign to collection (optional)
- Preview screen with:
  - Live interactive preview
  - Code view
  - Download option
  - Linked Figma design
  - Commenting system with feedback mode
  - Device view toggles
- Notifications via bell icon (real-time, mark as read, exclude download events)
- Basic team support (enterprise onboarding, sidebar team section)
- User identity shown when sharing prototypes
