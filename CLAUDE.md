# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a worklife-dashboard project with a client-server architecture.

## Project Structure

```
worklife-dashboard/
├── client/     # Frontend application
└── server/     # Backend application
```

## Architecture

This project follows a monorepo structure with separate client and server applications:

- **client/**: Contains the frontend application
- **server/**: Contains the backend API and business logic

## Development Workflow

When adding new features or making changes:

1. Determine whether changes belong in client, server, or both
2. For full-stack features, start with the server API endpoints, then implement the client UI
3. Ensure both client and server are running during development for full-stack testing
