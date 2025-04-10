# Prompt Collection

A simple, static web application to browse, search, and discover a curated collection of useful prompts for various tasks.

## Overview

This application provides a platform for users to find useful prompts for various tasks. All prompts are stored as Markdown files, making it easy to contribute new prompts via GitHub.

## Features

- **Prompt Listing**: Displays all available prompts in a responsive grid layout
- **Metadata Display**: Shows title, author, and tags for each prompt
- **Author Links**: Clickable author links to promote attribution and discovery
- **Search Functionality**: Client-side search to filter prompts by title, content, or author
- **Tag Filtering**: Filter prompts by category/tag
- **Static Content**: All prompt data is stored in Markdown files
- **GitHub Contribution**: Users can contribute new prompts by submitting Pull Requests

## Getting Started

### Prerequisites

- Node.js (v20 or newer)
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/prompts-dir.git
cd prompts-dir

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The application will be available at http://localhost:3000.

## Contributing

### Adding a New Prompt

1. Fork this repository
2. Create a new Markdown file in the `app/prompts` directory
3. Follow this format for your prompt file:

```markdown
---
title: "Your Prompt Title"
author: "Your Name"
authorLink: "https://your-website-or-social-profile"
tags: ["tag1", "tag2", "category"]
category: "Category Name"
---

# Your Prompt Title

Describe when to use this prompt here...

```
Your prompt content goes here. You can use markdown formatting.
```

4. Submit a Pull Request with your new prompt

### Development

If you want to contribute to the application itself:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

This application is designed to be deployed on Cloudflare Pages:

```bash
# Deploy to Cloudflare Pages
pnpm deploy
```

## Technology Stack

- [Remix](https://remix.run/) - Full-stack web framework
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting
