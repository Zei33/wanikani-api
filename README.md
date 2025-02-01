# WaniKani API Client

[![Version](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Zei33/ea274423cad68ec583a39cd12d8f9441/raw/wanikani-api-version.json)](https://github.com/Zei33/wanikani-api/releases)
[![License](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Zei33/ea274423cad68ec583a39cd12d8f9441/raw/wanikani-api-license.json)](https://github.com/Zei33/wanikani-api/blob/main/LICENSE.md)
[![Build](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Zei33/ea274423cad68ec583a39cd12d8f9441/raw/wanikani-api-build.json)](https://github.com/Zei33/wanikani-api/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Zei33/ea274423cad68ec583a39cd12d8f9441/raw/wanikani-api-junit-tests.json)](https://github.com/Zei33/wanikani-api/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Zei33/ea274423cad68ec583a39cd12d8f9441/raw/wanikani-api-coverage.json)](https://github.com/Zei33/wanikani-api/actions/workflows/ci.yml)

A modern TypeScript client for the WaniKani API v2, featuring automatic caching, type safety, and comprehensive endpoint coverage.

## Features

- 🔄 **Full API Coverage**: Complete implementation of all WaniKani v2 API endpoints
- 💾 **Smart Caching**: Automatic, configurable caching with intelligent cache invalidation
- 📦 **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🔐 **Subscription Aware**: Respects WaniKani's subscription-based content restrictions
- 🚀 **Modern Design**: Built with modern TypeScript features and best practices
- 📝 **Comprehensive Testing**: Thoroughly tested with Jest

## Installation

```bash
npm install wanikani-api
```

## Quick Start

```typescript
import { WaniKaniAPI } from 'wanikani-api';

// Initialize with default settings
const api = new WaniKaniAPI('your-api-key');

// Or customize cache durations (in seconds)
const api = new WaniKaniAPI('your-api-key', {
	cacheTTL: {
		subjects: 24 * 60 * 60,     // Cache subjects for 24 hours
		assignments: 60 * 60,       // Cache assignments for 1 hour
		reviews: 30 * 60,          // Cache reviews for 30 minutes
		user: 15 * 60,             // Cache user data for 15 minutes
		default: 60 * 60           // Default TTL for other endpoints
	}
});

// Get user information
const user = await api.user.get();

// Get all assignments
const assignments = await api.assignments.getAll();

// Get subjects (with automatic subscription level checking)
const subjects = await api.subjects.getAll();
```

## Features in Detail

### Endpoint Support

- User Information
- Assignments
- Subjects (Kanji, Vocabulary, Radicals)
- Reviews
- Review Statistics
- Study Materials
- Level Progressions
- Resets
- Spaced Repetition Systems
- Voice Actors

### Automatic Caching

The client automatically caches responses based on WaniKani's recommendations:
- Aggressive caching for subjects (rarely updated)
- Moderate caching for assignments, review statistics, and study materials
- Short-term caching for summary data
- Conditional requests support for efficient updates

Default cache durations (in seconds):
- Subjects: 24 hours (86400)
- Assignments: 1 hour (3600)
- Reviews: Never cached (0)
- User data: 1 hour (3600)
- Study materials: 1 hour (3600)
- Summary: 1 hour (3600)
- Other endpoints: 1 hour (3600)

All cache durations can be customized during initialization.

### Subscription Handling

Automatically respects WaniKani's subscription restrictions:
- Validates content access based on subscription level
- Handles free, recurring, and lifetime subscriptions
- Prevents access to content beyond subscription level

## Environment Variables

- `WANIKANI_API_KEY`: Your WaniKani API v2 token (optional, can be passed to constructor)

## Documentation

For detailed API documentation, see:
- [WaniKani API Documentation](https://docs.api.wanikani.com/20170710)
- [API Reference](https://docs.api.wanikani.com/20170710/#introduction)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [@WaniKani](https://www.wanikani.com/) for their excellent API and documentation
- Built with respect for WaniKani's terms of service and API best practices
