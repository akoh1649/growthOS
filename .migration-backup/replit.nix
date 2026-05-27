{ pkgs }: {
  deps = [
    pkgs.nodejs_22
    pkgs.bun
  ];
  env = {
    NODE_ENV = "development";
  };
}