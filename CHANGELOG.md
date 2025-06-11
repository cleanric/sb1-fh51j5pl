# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Authentication system with Sign In and Sign Up popups using Radix UI Dialog
- Pricing popup with tiered plans (Starter/Pro) and boost options
- Job insights preview mode for sample job cards
- Recommended jobs feature when no search query is provided
- Resume text input toggle in search bar
- Conditional rendering for resume text based on authentication status
- Job caching system for improved performance
- Multi-city job search functionality
- Error boundary implementation for job grid
- Comprehensive TypeScript types for all components
- Web3Modal integration for wallet connection
- Smart contract integration for crypto rewards
- Polygon network support for transactions
- Crypto points accrual when job insights are revealed
- New success story to the landing page
- Improved status messages for rewards claiming process

### Changed
- Updated header design with integrated Sign In functionality
- Modified job card component to support preview mode
- Updated landing page hero text and description for better clarity
- Switched crypto rewards from WISR to MATIC token
- Improved job search algorithm to include multiple city locations
- Removed default search query and location values
- Enhanced error handling in job search functions
- Optimized job data caching for better performance
- Migrated from RainbowKit to Web3Modal for improved wallet integration
- Updated contract interactions to use ethers.js directly
- Logic for the rewards cashout button text and disabled state
- Header sign-in button hover state to use brand colors
- Job card title text color for better readability
- Web3Modal context to subscribe to provider changes
- Landing page section title from "Recommended Jobs" to "Recently Posted Jobs"
- Landing page styling for the "Job Cards Preview" section
- Landing page "Success Stories" grid layout to accommodate more entries

### Fixed
- Sign In/Sign Up popup close button background now matches popup background
- Converted Sign Up button in authentication popups to links for better UX
- Updated job card rewards display for improved clarity
- Enhanced error handling and fallbacks in job search functionality
- Improved responsive design for mobile devices
- Resolved wallet connection initialization issues
- Fixed contract interaction type safety

### Technical
- Added new dependencies:
  - `@radix-ui/react-dialog` for modal components
  - `@radix-ui/react-icons` for UI icons
  - `@web3modal/ethers` for wallet integration
  - `ethers` for blockchain interactions
- Implemented job caching system with TypeScript interfaces
- Added comprehensive type definitions for job data
- Enhanced error boundary implementation with fallback UI
- Optimized job search with parallel API requests
- Added support for preview mode in job insights
- Removed deprecated wallet dependencies:
  - `@rainbow-me/rainbowkit`
  - `@tanstack/react-query`
  - `wagmi`
  - `viem`
- Refactored contract interactions to use ethers.js
- Added Web3Context for centralized wallet state management