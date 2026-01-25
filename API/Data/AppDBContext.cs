
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

//Using inline constructors C#12 for simpler dependency injection
public class AppDBContext(DbContextOptions options) : DbContext(options)
{
   public DbSet<AppUser> Users {get;set;}

   public DbSet<Member> Members {get;set;}

   public DbSet<Photo> Photos {get;set;}

}



//not inline 

// public class AppDBContext : DbContext
// {
//     public AppDBContext(DbContextOptions options) : base(options)
//     {

//     }

//     public DbSet<AppUser> Users { get; set; }
// }


//by calling base you are telling EF Core:

// “Use these options to initialize the DbContext part of my class.”

// If you do not call the base constructor with options, EF Core will throw runtime errors like:

// No database provider has been configured for this DbContext.