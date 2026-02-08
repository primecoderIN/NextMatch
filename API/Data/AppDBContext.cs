
using API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

//Using inline constructors C#12 for simpler dependency injection
public class AppDBContext(DbContextOptions options) : DbContext(options)
{
   public DbSet<AppUser> Users { get; set; }

   public DbSet<Member> Members { get; set; }

   public DbSet<Photo> Photos { get; set; }

   protected override void OnModelCreating(ModelBuilder modelBuilder)
   {
      base.OnModelCreating(modelBuilder);

      var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
       v => v.ToUniversalTime(),
       v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
      );


      foreach (var entity in modelBuilder.Model.GetEntityTypes())
      {

         foreach (var property in entity.GetProperties())
         {
            if (property.ClrType == typeof(DateTime))
            {
               property.SetValueConverter(dateTimeConverter);
            }
         }

      }
   }

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