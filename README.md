# Minimal API - Exemplo de Projeto .NET

Este projeto demonstra uma API minimalista utilizando .NET, Entity Framework Core e MySQL, com exemplos de autenticação, serviços, DTOs e testes automatizados.

## Estrutura do Projeto

- **Api/**: Código principal da API
  - `Program.cs` e `Startup.cs`: Configuração da aplicação
  - `Dominio/`: Entidades, DTOs, serviços e interfaces de domínio
  - `Infraestrutura/Db/`: DbContext e Migrations
  - `script/`: Scripts SQL e backup do banco
- **Test/**: Testes automatizados (unitários e de integração)

## Como rodar o projeto

1. **Pré-requisitos:**
   - .NET 7.0 ou superior
   - MySQL

2. **Configuração do banco de dados:**
   - Utilize o backup pronto em `Api/script/minimal_api.dump.sql` para popular o banco:
     ```sh
     mysql -u root -proot -e "CREATE DATABASE minimal_api;"
     mysql -u root -proot minimal_api < Api/script/minimal_api.dump.sql
     ```
   - Ou configure sua string de conexão em `Api/appsettings.json`.

3. **Executando a API:**
   ```sh
   dotnet run --project Api/mininal-api.csproj
   ```

4. **Testes:**
   ```sh
   dotnet test Test/Test.csproj
   ```

## Funcionalidades
- CRUD de administradores e veículos
- Autenticação JWT
- Validações e tratamento de erros
- Testes automatizados

## Scripts úteis
- Backup e restauração do banco: veja `Api/script/README_BANCO.md`

---

Projeto para fins didáticos e de demonstração. Sinta-se à vontade para contribuir!
