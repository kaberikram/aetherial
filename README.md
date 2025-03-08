# Aetherial Dream Journal

A beautiful 3D dream journal web application with visualization and exploration features.

![Aetherial Dream Journal](public/icon-192x192.png)

## Features

- **Dream Journal**: Record and save your dreams with details like emotions, locations, and people.
- **3D Dream Exploration**: Navigate through your dreams in a beautiful 3D environment.
- **Dream Visualization**: See your dreams represented as glowing points in a dreamscape.
- **AI Image Generation**: Generate images based on your dream descriptions.
- **Search & Filter**: Easily find dreams by keywords, emotions, or dates.
- **Responsive Design**: Works on both desktop and mobile devices.
- **Settings**: Manage your dream journal data with export and reset options.
- **Multilingual Support**: Available in English and Bahasa Melayu.
- **User Authentication**: Create an account to track your dream journaling progress.
- **Gamification**: Level up as you record more dreams, encouraging consistent journaling.

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **Three.js**: 3D graphics library for creating immersive experiences
- **React Three Fiber**: React renderer for Three.js
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: UI component library
- **Local Storage**: For client-side data persistence
- **Supabase**: Authentication and user management
- **Internationalization**: Multi-language support

## Usage

1. **Home Page**: View your recent dreams and access all features.
2. **Capture Page**: Record a new dream with details and generate an image.
3. **Explore Page**: Navigate the 3D dreamscape to explore your dreams.
4. **Settings**: Manage your dream journal data and application preferences.
5. **Authentication**: Sign up/login to track your dream journaling progress.
6. **Language**: Switch between English and Bahasa Melayu in the settings page.

## Setup for Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file based on `.env.local.example` with your Supabase credentials
4. Run the development server: `npm run dev`

## Authentication

The app uses Supabase for authentication while keeping dream content strictly local. This approach:
- Preserves privacy by keeping dream content on your device
- Enables progress tracking and gamification features
- Allows for future optional community features

## Creator

- **Kaberikram** - [Email](mailto:ikramandhakim@gmail.com) - [X](https://x.com/Kaberikram)

## License

This project is licensed under the MIT License. 
