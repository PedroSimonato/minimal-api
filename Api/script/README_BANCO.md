# Como restaurar o banco de dados

Para restaurar o banco de dados de exemplo já preenchido, utilize o arquivo `minimal_api.dump.sql` localizado em `Api/script/`.

## Passos para restaurar

1. Certifique-se de que o MySQL está rodando e você tem acesso ao usuário `root` com senha `root`.
2. Execute o comando abaixo no terminal, na raiz do projeto:

```sh
mysql -u root -proot minimal_api < Api/script/minimal_api.dump.sql
```

Se o banco `minimal_api` não existir, crie-o antes:

```sh
mysql -u root -proot -e "CREATE DATABASE minimal_api;"
```

Pronto! O banco estará pronto para uso com os dados de exemplo.
