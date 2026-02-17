

using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Entities;

public class Member
{
  public string Id {get;set;} = null!; //! operator suppresses nullable reference type warnings

  public DateOnly DateOfBirth {get;set;}

  public string? ImageUrl {get;set;}

  public required string UserName {get;set;}

  public DateTime CreatedAt {get;set;} = DateTime.UtcNow;

  public DateTime LastActive {get;set;} = DateTime.UtcNow;

  public required string Gender {get;set;}

  public string? Description {get;set;}

  public required string City {get;set;}

  public required string Country {get;set;}



  //Navigation property
  [JsonIgnore] //Do not send photoes when we return member
public List<Photo> Photos {get;set;} =[];


//Like navigation property

[JsonIgnore]
public List<MemberLike> LikedByMembers {get;set;} =[]; //List of users the current users liked by

[JsonIgnore]
public List<MemberLike> LikedMembers {get;set;} = []; //List of users that the current user liked 


  [ForeignKey(nameof(Id))] //Use the Id property in Member as the foreign key for the User navigation property.
  [JsonIgnore]
  public AppUser User {get;set;} = null!;  
}

//Responsibility that this model and table will serve

// Public dating profile

// Search, filters, cards, recommendations

// Frequently read data