

using System.Text.Json.Serialization;

namespace API.Entities;

public class Photo
{
public int Id {get;set;}

public required string Url {get;set;}

public string? PublicId {get;set;}


//Navigation properties
[JsonIgnore]
public Member Member {get;set;} = null!;

public string MemberId {get;set;} = null!; //Foreign key to associate photo with a member, this is required because we have a one-to-many relationship between Member and Photo. Each photo belongs to one member, and each member can have multiple photos. By including the MemberId property, we can establish this relationship in the database and ensure that each photo is correctly linked to its corresponding member.
}



