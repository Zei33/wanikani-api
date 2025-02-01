# WaniKani API Client

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

// Initialize with API key
const api = new WaniKaniAPI('your-api-key');
// Or use WANIKANI_API_KEY environment variable
const api = new WaniKaniAPI();

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [@WaniKani](https://www.wanikani.com/) for their excellent API and documentation
- Built with respect for WaniKani's terms of service and API best practices
