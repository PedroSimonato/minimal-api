using MinimalApi.Dominio.Entidades;

namespace Test.Domain.Entidades
{
    [TestClass]
    public class AdministradorTest
    {
        [TestMethod]
        public void TestarGetSetPropriedades()
        {
            //Arrange
            var adm = new Administrador();

            //Act 
            adm.Id = 1; //testando o set
            adm.Email = "admin@admin.com";
            adm.Senha = "123";
            adm.Perfil = "Adm";

            //Assert
            Assert.AreEqual(1, adm.Id); //testando o get
            Assert.AreEqual("admin@admin.com", adm.Email);
            Assert.AreEqual("123", adm.Senha);
            Assert.AreEqual("Adm", adm.Perfil);
        }
    }

}