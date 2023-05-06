set export

setup-dev-container:
    #!/bin/zsh

    zsh scripts/setup_zsh_environment.zsh
    . ~/.zshrc
    echo "Y" | pn install
