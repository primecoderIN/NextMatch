

using System.Text.Json;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
   public static async Task SeedUsers(AppDBContext context, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        var roles = new[] { "Member", "Admin", "Moderator" };

        foreach (var role in roles)
        {
            if (await roleManager.RoleExistsAsync(role)) continue;

            var roleResult = await roleManager.CreateAsync(new IdentityRole(role));

            if (!roleResult.Succeeded)
            {
                Console.WriteLine($"Error creating role {role}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
            }
        }

        if (!await userManager.Users.AnyAsync())
        {
            var memberData = await File.ReadAllTextAsync("Data/UserSeedData.json");
            //member does not have Email property so created a SeedDataDto
            var members = JsonSerializer.Deserialize<List<SeedUserDTO>>(memberData);
            
            if(members==null)
            {
                Console.WriteLine("No members in seed data");
            }
            else
            {
                foreach(var member in members)
                {
                    var user = new AppUser
                    {
                        Id= member.Id,
                        Email= member.Email,
                        UserName= member.UserName,
                        ImageUrl=member.ImageUrl
                    };

                    // Step 1: Create the user with UserManager (handles password hashing)
                    var result = await userManager.CreateAsync(user, "Pa$$w0rd");

                    if(!result.Succeeded)
                    {
                        Console.WriteLine($"Error creating user {member.UserName}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                        continue;
                    }

                    // Step 2: Create the Member profile
                    var memberProfile = new Member
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
                    };

                    context.Members.Add(memberProfile);

                    // Step 3: Add the primary photo
                    var photo = new Photo
                    {
                        Url= member.ImageUrl!,
                        MemberId=member.Id
                    };

                    context.Photos.Add(photo);

                    // Step 4: Assign the "Member" role
                    var memberRoleResult = await userManager.AddToRoleAsync(user, "Member");

                    if (!memberRoleResult.Succeeded)
                    {
                        Console.WriteLine($"Error assigning Member role to {member.UserName}: {string.Join(", ", memberRoleResult.Errors.Select(e => e.Description))}");
                    }
                }

                // Save all members and photos
                await context.SaveChangesAsync();
            }
        }

        // Create admin user if it doesn't exist
        var admin = await userManager.FindByEmailAsync("admin@test.com");
        if(admin == null)
        {
            admin = new AppUser
            {
                UserName = "admin@test.com",
                Email = "admin@test.com"
            };

            var adminResult = await userManager.CreateAsync(admin, "Pa$$w0rd");

            if(adminResult.Succeeded)
            {
                foreach (var role in new[] { "Admin", "Moderator" })
                {
                    var adminRoleResult = await userManager.AddToRoleAsync(admin, role);

                    if (!adminRoleResult.Succeeded)
                    {
                        Console.WriteLine($"Error assigning {role} role to admin: {string.Join(", ", adminRoleResult.Errors.Select(e => e.Description))}");
                    }
                }
            }
            else
            {
                Console.WriteLine($"Error creating admin: {string.Join(", ", adminResult.Errors.Select(e => e.Description))}");
            }
        }
        else
        {
            foreach (var role in new[] { "Admin", "Moderator" })
            {
                if (await userManager.IsInRoleAsync(admin, role)) continue;

                var adminRoleResult = await userManager.AddToRoleAsync(admin, role);

                if (!adminRoleResult.Succeeded)
                {
                    Console.WriteLine($"Error assigning {role} role to admin: {string.Join(", ", adminRoleResult.Errors.Select(e => e.Description))}");
                }
            }
        }

        if (!await context.Messages.AnyAsync())
        {
            var lisa = await context.Members.SingleOrDefaultAsync(m => m.Id == "lisa-id");
            var tom = await context.Members.SingleOrDefaultAsync(m => m.Id == "tom-id");

            if (lisa != null && tom != null)
            {
                var messages = new List<Message>
                {
                    new Message
                    {
                        SenderId = lisa.Id,
                        RecipientId = tom.Id,
                        Content = "Hey Tom, I loved your profile. Want to grab a coffee this weekend?",
                        MessageSent = DateTime.UtcNow.AddHours(-5),
                        DateRead = DateTime.UtcNow.AddHours(-4)
                    },
                    new Message
                    {
                        SenderId = tom.Id,
                        RecipientId = lisa.Id,
                        Content = "Hi Lisa! That sounds great, I'm free on Saturday afternoon.",
                        MessageSent = DateTime.UtcNow.AddHours(-4),
                        DateRead = DateTime.UtcNow.AddHours(-3)
                    },
                    new Message
                    {
                        SenderId = lisa.Id,
                        RecipientId = tom.Id,
                        Content = "Perfect, let's meet at the café by the park at 3pm.",
                        MessageSent = DateTime.UtcNow.AddHours(-3),
                        DateRead = DateTime.UtcNow.AddHours(-2)
                    },
                    new Message
                    {
                        SenderId = tom.Id,
                        RecipientId = lisa.Id,
                        Content = "Sounds good, see you there!",
                        MessageSent = DateTime.UtcNow.AddHours(-2)
                    }
                };

                context.Messages.AddRange(messages);
                await context.SaveChangesAsync();
            }
        }
    }
}
