{ pkgs, ... }: {
  channel = "stable-24.11";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.psmisc  # gives us fuser reliably
  ];

  env = {
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "false";
  };

  idx.workspace.onCreate = {
    install-fe = "cd client && (test -f package-lock.json && npm ci || npm install)";
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
    };
  };
}








