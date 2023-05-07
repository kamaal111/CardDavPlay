import venv
import shutil
import subprocess
from pathlib import Path


class VirtualEnv:
    path: Path

    def __init__(self, path: str) -> None:
        self.path = Path(path)

    @property
    def exists(self):
        return self.path.exists()

    def create(self, overwrite: bool = False):
        if overwrite and self.exists:
            shutil.rmtree(self.path)

        if not self.exists:
            venv.create(self.path, with_pip=True)

    def pip_install(self, package: str):
        return self.execute_command("pip", "install", package)

    def execute_command(self, command: str, *args):
        binary_path = self.path / "bin"
        return subprocess.Popen([binary_path / command] + list(args)).wait()
