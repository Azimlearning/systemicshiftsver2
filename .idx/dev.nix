{ pkgs, ... }: {
  # Use a stable nixpkgs channel
  channel = "stable-24.05";

  # Packages available in the environment
  packages = [
    pkgs.nodejs_20
    pkgs.python310Full
    pkgs.pip
  ];

  # Environment variables (add any custom ones here)
  env = {};

  idx = {
    # VS Code extensions (search on https://open-vsx.org/)
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
    ];

    # Preview configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when the workspace is first created
      onCreate = {
        npm-install = "npm install";
        pip-install = "pip install -r python/requirements.txt";
      };

      # Runs when the workspace starts or restarts
      onStart = {
        start-server = "npm run dev";
      };
    };
  };
}
