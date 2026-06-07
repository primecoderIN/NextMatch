# DatingApp

This repository contains a full-stack dating application built with a .NET backend and an Angular frontend. The project is structured as follows:

## 📁 Project Structure

- **API/** - ASP.NET Core Web API project responsible for authentication, data access, and business logic.
  - Controllers manage HTTP routes (e.g., `AccountController`, `MembersController`, `LikesController`, `MessagesController`, `AdminController`).
  - Data layer includes Entity Framework models, repositories, and migrations.
  - DTOs, Entities, Services, and Interfaces break down concerns for clean architecture.
  - Middleware handles global exception handling and user activity logging.
  - Supports JWT authentication with ASP.NET Core Identity, role-based policies, and Cloudinary photo storage.

- **client/** - Angular application that serves as the frontend.
  - Features include account management, member search, like lists, real-time messaging, and admin tools.
  - Shared components for pagination, image upload, navigation, and more.
  - Services and guards handle HTTP requests, authentication, role-based access, and SignalR connections.

## 🔧 Technologies

- **Backend**: ASP.NET Core 10.0, Entity Framework Core, ASP.NET Core Identity, SignalR, Cloudinary integration.
- **Frontend**: Angular 21, TypeScript, RxJS, `@microsoft/signalr`, Tailwind/CSS.

## 🚀 Getting Started

1. **Backend Setup**
   - Navigate to the `API` folder.
   - Update `appsettings.json` with your database connection string, `TokenKey`, and Cloudinary settings.
   - Run migrations and seed data:
     ```bash
     cd API
     dotnet ef database update
     dotnet run
     ```
   - API will be available on `https://localhost:5001` (or configured port).

2. **Frontend Setup**
   - Navigate to the `client` folder.
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the Angular development server:
     ```bash
     npm start
     ```
   - Access the app via `http://localhost:4200`.

> Note: The frontend connects to the backend API for authentication, member data, likes, messaging, and admin operations.

## ✅ Features

- User registration and login with JWT authentication.
- ASP.NET Core Identity with role-based access control for `Admin`, `Moderator`, and `Member`.
- Member browsing, filtering, and profile viewing.
- Like/unlike member functionality and saved like lists.
- Real-time messaging and online presence using SignalR hubs.
- Photo upload and deletion with Cloudinary integration.
- Admin panel for user role management and photo moderation checks.
- Pagination support for large datasets.

## 🧪 Testing

- Backend: Use `dotnet test` (if test projects exist).
- Frontend: Run `ng test` within the client to execute Angular unit tests.

## 🛠️ Deployment

- Build and publish the API using `dotnet publish`.
- Build the Angular app with `ng build --prod` and serve static files from the API or a separate web server.

## 📄 License

This project is provided as-is without any specific license. Add an appropriate license file if needed.

---

Feel free to explore and modify the code to fit your needs!