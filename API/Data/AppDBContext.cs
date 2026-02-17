
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

   public DbSet<MemberLike> Likes { get; set; }

   protected override void OnModelCreating(ModelBuilder modelBuilder)
   {
      base.OnModelCreating(modelBuilder);


      modelBuilder.Entity<MemberLike>()
      .HasKey(x => new { x.SourceMemberId, x.TargetMemberId }); //This defines a composite primary key consisting of sourcemember id and target member id

      modelBuilder.Entity<MemberLike>()
      .HasOne(s => s.SourceMember)
      .WithMany(t => t.LikedMembers)
      .HasForeignKey(s => s.SourceMemberId)
      .OnDelete(DeleteBehavior.Cascade); // A MemberLike has one SourceMember // A Member can have many LikedMembers // SourceMemberId is the FK // Deleting a Member deletes related likes automatically

      modelBuilder.Entity<MemberLike>()
      .HasOne(s => s.TargetMember)
      .WithMany(t => t.LikedByMembers)
      .HasForeignKey(s => s.TargetMemberId)
      .OnDelete(DeleteBehavior.NoAction); // A MemberLike has one TargetMember // A Member can have many LikedByMembers // TargetMemberId is the foreign key // Deleting a Member deletes likes where they are the target

      //No action in other side of self referencing table prevents multiple cascade paths



      //Below code is to send proper utc time to frontend
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