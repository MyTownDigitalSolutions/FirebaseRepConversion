{ pkgs, ... }: {
  channel = "stable-24.11";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.psmisc  # gives us fuser reliably
    pkgs.openssh
    pkgs.nano
    pkgs.python311
    pkgs.python311Packages.pip
  ];

  env = {
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "false";
  };

  idx.workspace.onCreate = {
    install-fe = "cd client && (test -f package-lock.json && npm ci || npm install)";
    install-be = "cd app && (test -f requirements.txt && pip install -r requirements.txt || true)";
  };

  idx.previews = {
    enable = true;

    previews = {
      web = {
        manager = "web";
        cwd = "client";
        command = [
          "bash"
          "-lc"
          ''
            set -euo pipefail
            echo "[web] Forcing Vite to port 9002 (Firebase Studio preview port)"

            # Kill anything holding 9002 (backend/old preview/etc.)
            fuser -k 9002/tcp || true

            if [ -f package-lock.json ]; then
              npm ci
            else
              npm install
            fi

            # Force Vite to the one port Preview will route to
            exec npx vite --host 0.0.0.0 --port 9002 --strictPort
          ''
        ];
      };
      backend = {
        cwd = "app";
        command = [
          "bash"
          "-lc"
          ''
            set -euo pipefail
            echo "[backend] Starting API server on port 8000"
            
            # Kill anything holding 8000
            fuser -k 8000/tcp || true

            # Check for and install dependencies
            if [ -f requirements.txt ]; then
              pip install --prefix .venv -r requirements.txt
            else
              pip install --prefix .venv fastapi uvicorn sqlalchemy pydantic openpyxl
            fi
            
            # Run the FastAPI server
            exec python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
          ''
        ];
        manager = "web";
        port = 8000;
        
      };
    };
  };
}