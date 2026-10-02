"""Local development server (Windows-safe): python run_local.py [port]

Async psycopg cannot use Windows' default Proactor event loop, so this runs
uvicorn on a selector loop. In Docker/Linux use the normal uvicorn command.
"""

import asyncio
import sys

import uvicorn

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8030
    server = uvicorn.Server(uvicorn.Config("app.main:app", host="127.0.0.1", port=port, log_level="info"))
    asyncio.run(server.serve(), loop_factory=asyncio.SelectorEventLoop)
