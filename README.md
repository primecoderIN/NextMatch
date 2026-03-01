# DatingApp

This repository contains a full-stack dating application built with a .NET backend and an Angular frontend. The project is structured as follows:

## 📁 Project Structure

- **API/** - ASP.NET Core Web API project responsible for authentication, data access, and business logic.
  - Controllers manage HTTP routes (e.g., `AccountController`, `MembersController`, `LikesController`).
  - Data layer includes Entity Framework models, repositories, and migrations.
  - DTOs, Entities, Services, and Interfaces break down concerns for clean architecture.
  - Middleware handles global exception handling and user activity logging.

- **client/** - Angular application that serves as the frontend.
  - Features include account management, member list, messaging, and error test pages.
  - Shared components for pagination, image upload, navigation, and more.
  - Services and guards handle HTTP requests, authentication, and route protection.

## 🔧 Technologies

- **Backend**: ASP.NET Core 10.0, Entity Framework Core, SQL Server (or another supported DB).
- **Frontend**: Angular (latest), TypeScript, RxJS, Bootstrap/CSS.

## 🚀 Getting Started

1. **Backend Setup**
   - Navigate to `API` folder.
   - Update `appsettings.json` with your database connection string.
   - Run migrations and seed data:
     ```bash
     cd API
     dotnet ef database update
     dotnet run
     ```
   - API will be available on `https://localhost:5001` (or configured port).

2. **Frontend Setup**
   - Navigate to `client` folder.
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the Angular development server:
     ```bash
     npm start
     ```
   - Access the app via `http://localhost:4200`.

## ✅ Features

- User registration and login with JWT authentication.
- Browsing and filtering members, viewing profiles.
- Like functionality between members.
- Pagination support for large lists.
- Role-based authentication and route guards.

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