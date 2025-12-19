{ pkgs, ... }: {
  channel = "stable-24.11";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.python311
    pkgs.uv
  ];

  env = {
    VITE_API_URL = "http://localhost:8000";
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "false";
  };

  idx.workspace.onCreate = {
    install-fe = "cd client && npm install";
    install-be = "uv sync";
  };

  idx.previews = {
    enable = true;

    previews = {
      web = {
  manager = "web";
  cwd = ".";
  command = [
    "bash"
    "-lc"
    "cd client && npm install && npm run dev -- --host 0.0.0.0 --port $PORT"
  ];
};


      api = {
        manager = "web";
        cwd = ".";
        command = [
          "bash"
          "-lc"
          "uv sync && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"
        ];
      };
    };
  };
}


