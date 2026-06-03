# TaskTic - Frontend Client

TaskTic is a modern, responsive web application for seamless task management and team collaboration. This repository contains the frontend React application built with Vite and Tailwind CSS.

## Extra Features

- **Interactive Kanban Board**: Drag-and-drop tasks across Todo, In Progress, Review, and Completed stages.
- **Smart AI Assistant**: A conversational UI that guides users through creating, editing, and managing tasks effortlessly.
- **Real-Time Team Chat**: Communicate with your team members instantly via WebSocket integration.
- **Activity Logs**: Track project history with visual timelines of who created or moved tasks.
- **Role-Based Views**: Dynamic UI that adapts based on user permissions (e.g., hiding deletion tools from standard members).
- **Mobile Responsive**: Fully responsive layout featuring an auto-hiding side navigation drawer for mobile devices.

## Tech Stack

- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS & shadcn/ui components
- **Routing**: React Router DOM
- **Drag & Drop**: @hello-pangea/dnd
- **Real-time**: Socket.io-client

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- The TaskTic Backend Server running locally.

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory and configure the API connections:
   ```env
   VITE_API_URL=http://localhost:4000/api
   VITE_SOCKET_URL=http://localhost:4000
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### Building for Production
To generate a production-ready bundle, run:
```bash
npm run build
```
The optimized files will be output to the `/dist` directory.
