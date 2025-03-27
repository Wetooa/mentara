# Mentara

Mentara is a mental health application designed to provide therapist matching, user engagement, therapy session completion, scheduling efficiency, moderation, system uptime, security, and mental health tracking. It integrates AI-driven features and a robust backend to deliver a seamless user experience.

## Technologies Used

- **Frontend:** Next.js, Tailwind CSS, ShadCN (component library)
- **State Management:** Zustand
- **Backend:** GraphQL, Prisma
- **AI:** GPT-4 (hosted via Django, but Django is not used for normal backend functions)
- **Database & Storage:** Supabase (DB hosting service + buckets)
- **Video & Audio:** WebRTC (P2P video), Socket.io (WebSockets)
- **Authentication:** Clerk Auth
- **Payment:** Stripe API

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v18+)
- Docker (for containerized services)
- PostgreSQL (if running the database locally)
- Python 3.9+ (for AI-related features)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-org/mentara.git
   cd mentara
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and configure necessary keys.
4. Start the development server:

   ```sh
   npm run dev
   ```

5. For backend services:

   ```sh
   docker-compose up
   ```

## How to Contribute

We welcome contributions! Follow these steps to contribute:

### Branching Strategy

- **`dev`** – The main development branch where all feature branches merge before going to production.
- **`master`** – The production branch with stable releases.

### Branch Naming Convention

#### Frontend Branches

| Type     | Naming Convention                       | Example                                 |
| -------- | --------------------------------------- | --------------------------------------- |
| Feature  | `frontend/feature/{short-description}`  | `frontend/feature/therapist-matching`   |
| Bug Fix  | `frontend/fix/{short-description}`      | `frontend/fix/login-bug`                |
| Hotfix   | `frontend/hotfix/{short-description}`   | `frontend/hotfix/ui-crash`              |
| Refactor | `frontend/refactor/{short-description}` | `frontend/refactor/component-structure` |

#### Backend Branches

| Type     | Naming Convention                      | Example                            |
| -------- | -------------------------------------- | ---------------------------------- |
| Feature  | `backend/feature/{short-description}`  | `backend/feature/graphql-endpoint` |
| Bug Fix  | `backend/fix/{short-description}`      | `backend/fix/authentication-error` |
| Hotfix   | `backend/hotfix/{short-description}`   | `backend/hotfix/payment-issue`     |
| Refactor | `backend/refactor/{short-description}` | `backend/refactor/db-schema`       |

#### Documentation Branches

| Type        | Naming Convention          | Example                   |
| ----------- | -------------------------- | ------------------------- |
| Docs Update | `docs/{short-description}` | `docs/contribution-guide` |

### Contribution Steps

1. Fork the repository.
2. Create a new branch following the naming conventions.
3. Make your changes and commit with clear messages:

   ```sh
   git commit -m "frontend: add therapist matching UI"
   ```

4. Push your branch:

   ```sh
   git push origin frontend/feature/therapist-matching
   ```

5. Open a Pull Request (PR) to merge into the `dev` branch.
6. After review and testing, changes will be merged into `master` for production release.

## License

Mentara is licensed under the MIT License.

## Contact

For questions and collaboration, reach out to the team:

- **Tristan James Tolentino**
- **Adrian T. Sajulga**
- **Julia Laine Segundo**

📧 Contact Email: <derpykidyt@gmail.com>
