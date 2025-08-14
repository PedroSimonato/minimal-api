-- Script para verificar o usuário administrador
USE minimal_api;

-- Verificar se o usuário administrador existe
SELECT * FROM Administradores WHERE Email = 'admin@admin.com';

-- Se não existir, inserir o usuário padrão
INSERT IGNORE INTO Administradores (Id, Email, Senha, Perfil) 
VALUES (1, 'admin@admin.com', '123', 'Adm');
