# Sapila - The Modern Meme Website

This document outlines the vision, features, and technology stack for the resurrection of the Sapila project. It should be used as the primary source of truth for any AI agent working on this project.

## 1. Project Vision

The primary goal is to relaunch Sapila as a modern, visually appealing, and engaging meme-sharing platform, hosted at `sapila.gr`. The project was originally developed in 2019 and is now being rebuilt with a modern technology stack for a better user experience and easier maintenance.

## 2. Core Features

The platform will include the following key features:

- **Main Feed:** A central place for users to view a continuous stream of memes and jokes.
- **User Authentication:** Users must be able to sign up and log in to participate fully.
- **Content Creation:** Authenticated users can contribute by:
    - Uploading their own meme images.
    - Submitting text-based jokes.
- **Content Aggregation:** The site will also feature curated tweet jokes sourced from Twitter.

## 3. Technology Stack

To ensure rapid development, scalability, and a modern feel, the project will be built as a **monolith** using the following technologies:

- **Framework:** **Next.js** (for both frontend and backend API routes).
- **Backend-as-a-Service (BaaS):** **Supabase** will be used for:
    - **Database:** A PostgreSQL database to store user data, posts, comments, etc.
    - **Authentication:** Handling user sign-up, login, and session management.
    - **Storage:** Storing user-uploaded images and other assets.

This stack was chosen to streamline development by unifying the frontend and backend, while leveraging a powerful, scalable, and cost-effective BaaS platform for core backend services.
