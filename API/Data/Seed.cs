

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.DTOs;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
   public static async Task SeedUsers(AppDBContext context)
    {
        //If we already have any users, then do not do anything
        if(await context.Users.AnyAsync()) return;

        var memberData = await File.ReadAllTextAsync("Data/UserSeedData.json");
        //member does not have Email property so created a SeedDataDto
        var members = JsonSerializer.Deserialize<List<SeedUserDTO>>(memberData);
        
        if(members==null)
        {
            Console.WriteLine("No members in seed data");
            return;
        }

       

        foreach(var member in members)
        {
             using var hmac = new HMACSHA512(); //Putting inside this loop will create different salt , hash and cryptographic key for each user
            var user = new AppUser
            {
                Id= member.Id,
                Email= member.Email,
                UserName= member.UserName,
                ImageUrl=member.ImageUrl,
                PasswordHash=hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd")),
                PasswordSalt= hmac.Key,
                Member = new Member
                {
                    Id=member.Id,
                    UserName= member.UserName,
                    Description= member.Description,
                    DateOfBirth= member.DateOfBirth,
                    ImageUrl=member.ImageUrl,
                    Gender=member.Gender,
                    City=member.City,
                    Country=member.Country,
                    LastActive=member.LastActive,
                    CreatedAt=member.CreatedAt
                }
                
            };

            user.Member.Photos.Add(new Photo
            {
                Url= member.ImageUrl!,
                MemberId=member.Id
            });

            context.Users.Add(user);

          
        }
          await context.SaveChangesAsync();
    }
}
