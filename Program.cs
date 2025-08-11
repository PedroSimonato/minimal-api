using MinimalApi.DTOs;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Olá pessoal");

app.MapPost("/login", (LoginDTO loginDTO) =>
{
    if (loginDTO.Email == "adm@adm.com" && loginDTO.Senha == "123")
    {
        return Results.Ok("Login bem-sucedido");
    }
    return Results.Unauthorized();
});

app.Run();