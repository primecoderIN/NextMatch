using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class AppUser : IdentityUser
{

   public string? ImageUrl {get;set;}

   public string? RefreshToken {get;set;}

   public DateTime? RefreshTokenExpiryTime {get;set;}

   //Navigation property 
   public Member Member {get;set;} = null!;
}


//Entities are nothing but models