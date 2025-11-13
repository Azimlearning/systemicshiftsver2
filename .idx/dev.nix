{ pkgs, ... }: {
  # Use a stable nixpkgs channel
  channel = "stable-24.05";

  # Packages available in the environment
  packages = [
    pkgs.nodejs_20

    # Provide Python 3.10 + pip and a few lightweight packages for development.
    # Adjust list to include any small packages you need available at eval time.
    (pkgs.python310.withPackages (ps: with ps; [
      pip
      setuptools
      wheel
      requests
      uvicorn
      fastapi
      pillow
      # For the new CPU-based diffusers script
      torch
      diffusers
      transformers
      accelerate
    ]))
  ];

  # Environment variables (add any custom ones here)
  # NOTE: Secrets like API keys should not be stored here directly.
  # Use your IDE's secret management tools or environment-specific configuration.
  env = {};

  idx = {
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };

    workspace = {
      onCreate = {
        npm-install = "npm install";
        # Create a lightweight venv and install project requirements there.
        # This avoids mixing Nix and pip system installs and is robust for development.
        setup-venv = ''
          python -m venv .venv
          . .venv/bin/activate
          pip install --upgrade pip
          if [ -f python/requirements.txt ]; then
            pip install -r python/requirements.txt
          fi
        '';
      };

      onStart = {
        # Use the venv-runner to ensure Python server (if any) uses installed venv packages
        start-server = "npm run dev";
      };
    };
  };
}