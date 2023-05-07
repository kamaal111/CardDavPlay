#!/bin/zsh

if [ ! -f $ZSH/oh-my-zsh.sh ]
then
    echo "Installing Oh My Zsh"
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

ZSH_AUTOSUGGESTIONS_PATH="~/.oh-my-zsh/custom/plugins/zsh-autosuggestions"
if [ ! -d $ZSH_AUTOSUGGESTIONS_PATH ]
then
    echo "Installing zsh-autosuggestions"
    git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_AUTOSUGGESTIONS_PATH
fi

SYNTAX_HIGHLIGHTING_PATH="~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting"
if [ ! -d $SYNTAX_HIGHLIGHTING_PATH ]
then
    echo "Installing zsh-syntax-highlighting"
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $SYNTAX_HIGHLIGHTING_PATH
fi

echo "Updating zsh configuration"
cp -f .devcontainer/.zshrc ~/.zshrc
. ~/.zshrc
