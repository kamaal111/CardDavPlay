import os
from sys import platform
from pathlib import Path

from virtual_env import VirtualEnv


temp_directory = Path("temp")
if not temp_directory.exists():
    os.mkdir(temp_directory)

platform_file = temp_directory / ".platform"
if not platform_file.exists():
    platform_file.write_text(platform)

previous_platform = platform_file.read_text()
is_another_platform = previous_platform != platform
if is_another_platform:
    platform_file.write_text(platform)
    print(
        "virtual environment has been installed on another platform, so initializing a new virtual environment"
    )


virtual_env = VirtualEnv(".venv")
virtual_env.create(overwrite=is_another_platform)
install_poetry_status = virtual_env.pip_install("Poetry")
if install_poetry_status != 0:
    raise Exception("Failed to install Poetry")

print("Pre-installing Python packages")
virtual_env.execute_command("poetry", "install")
