# Movie & TV Streaming Website

Welcome to our Movie & TV streaming website project! This platform allows users to stream movies and TV shows in a clean, user-friendly interface, with the ability to log in using Discord OAuth for authentication. The website is tightly integrated with **Radarr** and **Sonarr** for automatic indexing and management of downloaded content. Our goal is to create an enjoyable, modern, and snappy experience for movie and TV enthusiasts.

## Tech Stack

- **Next.js** - A React framework for server-side rendering and static web applications.
- **React** - A popular JavaScript library for building user interfaces.
- **Tailwind CSS** - A utility-first CSS framework for designing responsive, modern UIs.
- **Prisma ORM** - A modern Object-Relational Mapping tool for interacting with databases.
- **NextAuth.js** - Authentication for Next.js with easy integration of OAuth providers, including **Discord OAuth**.

## Features

- **Discord OAuth Integration**: Users can authenticate using their Discord account for a seamless sign-in experience.
- **Radarr & Sonarr Integration**: Automatically index and manage your movie and TV show libraries using Radarr (for movies) and Sonarr (for TV shows). All downloaded content is indexed in the database for easy access.
- **Content Streaming**: Stream movies and TV shows directly from the website in a smooth and responsive interface.
- **Modern User Interface**: A clean, intuitive, and snappy design that offers an enjoyable browsing and streaming experience.

## Running a dev environment.

1. Run a local postgresql database. (This assumes you already know how to setup and install)
2. Copy .env.example file to .env.dev and fill all variables accordingly.
3. Open cmd/terminal, cd to the directory of the cloned repository and run `yarn add`.
4. When command execution is complete, run `yarn db push`.
5. When command execution is complete, run `yarn dev` to start up a development server.
