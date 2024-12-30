

## Getting Started

### 1. Set up the Chess Engine Server
First, you'll need to set up the chess engine server:

```bash
# Clone the chess engine repository
git clone https://github.com/kevoconnell/chess-engine-llm
cd chess-engine-llm

# Install dependencies and start the server
# Follow the setup instructions in the chess-engine-llm repository
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of this project and add:

```bash
NEXT_PUBLIC_SERVER_URL=your_chess_engine_server_url
```

Replace `your_chess_engine_server_url` with the URL where your chess engine server is running (e.g., `http://localhost:4000`).

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

