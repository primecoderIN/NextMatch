

namespace API.Entities;

public class AppUser
{

   public  string Id {get;set;} =Guid.NewGuid().ToString(); //For every user a new guid will automatically be created
   public required string UserName {get;set;}

   public required string Email {get;set;}

   public required byte[] PasswordHash {get;set;} //byte array to store the hash value of the password

   public required byte[] PasswordSalt {get;set;} //byte array to store the salt value of the password
}


//Entities are nothing but models