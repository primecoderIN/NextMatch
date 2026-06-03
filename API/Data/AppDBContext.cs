
using API.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

//Using inline constructors C#12(Primary constructor) for simpler dependency injection
public class AppDBContext(DbContextOptions options) : IdentityDbContext<AppUser>(options) //This tells the IdentityDbContext to use our custom AppUser class as the user entity for identity management, allowing us to integrate ASP.NET Core Identity features with our application's user data model.
{

   public DbSet<Member> Members { get; set; }

   public DbSet<Photo> Photos { get; set; }

   public DbSet<MemberLike> Likes { get; set; }

   public DbSet<Message> Messages { get; set; }

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

      modelBuilder.Entity<Message>()
      .HasOne(m=>m.Sender)
      .WithMany(m => m.MessagesSent)
      .OnDelete(DeleteBehavior.Restrict); //Restrict prevents cascade delete and allows us to keep messages even if a user is deleted, but it will not allow deletion of a user if they have sent or received messages, ensuring data integrity and preserving message history.

      modelBuilder.Entity<Message>()
      .HasOne(m=>m.Recipient)
      .WithMany(m => m.MessagesReceived)
      .OnDelete(DeleteBehavior.Restrict); //Restrict prevents cascade delete and allows us to keep messages even if a user is deleted, but it will not allow deletion of a user if they have sent or received messages, ensuring data integrity and preserving message history.



      //Below code is to send proper utc time to frontend
      var dateTimeConverter = new ValueConverter<DateTime, DateTime>( //This creates a new ValueConverter that converts DateTime values to UTC when saving to the database and converts them back to DateTime with the kind set to UTC when retrieving from the database.
       v => v.ToUniversalTime(),
       v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
      );

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>( //This creates a new ValueConverter that converts DateTime values to UTC when saving to the database and converts them back to DateTime with the kind set to UTC when retrieving from the database.
       v =>v.HasValue? v.Value.ToUniversalTime() :null,
       v => v.HasValue? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null
      );


      foreach (var entity in modelBuilder.Model.GetEntityTypes()) //Iterates through all entity types in the model
      {

         foreach (var property in entity.GetProperties()) //Iterates through all properties of each entity type
         {
            if (property.ClrType == typeof(DateTime)) //Checks if the property type is DateTime
            {
               property.SetValueConverter(dateTimeConverter); //If it is a DateTime property, it applies the dateTimeConverter to ensure that all DateTime values are stored and retrieved as UTC in the database
            } else if (property.ClrType == typeof(DateTime?)) //Checks if the property type is nullable DateTime
            {
               property.SetValueConverter(nullableDateTimeConverter); //If it is a nullable DateTime property, it applies the nullableDateTimeConverter to ensure that all nullable DateTime values are stored and retrieved as UTC in the database
            }
         }

      }
   }

}



//not inline  - old constructor approach

// public class AppDBContext : DbContext
// {
//     // Old constructor approach
//     public AppDBContext(DbContextOptions options) : base(options)
//     {

//     }

//     public DbSet<AppUser> Users { get; set; }

//     public DbSet<Member> Members { get; set; }

//     public DbSet<Photo> Photos { get; set; }

//     public DbSet<MemberLike> Likes { get; set; }

//     protected override void OnModelCreating(ModelBuilder modelBuilder)
//     {
//         base.OnModelCreating(modelBuilder);

//         // Composite primary key
//         modelBuilder.Entity<MemberLike>()
//             .HasKey(x => new { x.SourceMemberId, x.TargetMemberId });

//         // SourceMember relationship
//         modelBuilder.Entity<MemberLike>()
//             .HasOne(s => s.SourceMember)
//             .WithMany(t => t.LikedMembers)
//             .HasForeignKey(s => s.SourceMemberId)
//             .OnDelete(DeleteBehavior.Cascade);

//         // TargetMember relationship
//         modelBuilder.Entity<MemberLike>()
//             .HasOne(s => s.TargetMember)
//             .WithMany(t => t.LikedByMembers)
//             .HasForeignKey(s => s.TargetMemberId)
//             .OnDelete(DeleteBehavior.NoAction);

//         // Prevents multiple cascade paths in self-referencing table

//         // UTC DateTime converter
//         var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
//             v => v.ToUniversalTime(),
//             v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
//         );

//         foreach (var entity in modelBuilder.Model.GetEntityTypes())
//         {
//             foreach (var property in entity.GetProperties())
//             {
//                 if (property.ClrType == typeof(DateTime))
//                 {
//                     property.SetValueConverter(dateTimeConverter);
//                 }
//             }
//         }
//     }
// }


//by calling base you are telling EF Core:

// “Use these options to initialize the DbContext part of my class.”

// If you do not call the base constructor with options, EF Core will throw runtime errors like:

// No database provider has been configured for this DbContext.
