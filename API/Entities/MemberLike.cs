

namespace API.Entities;

public class MemberLike
{
    public required string SourceMemberId { get; set; }

    public Member SourceMember { get; set; } = null!;

    public required string TargetMemberId { get; set; }

    public Member TargetMember { get; set; } = null!;
}


//Each member can like many other members and can be liked by many other members, so we have a many-to-many relationship between the Member entity and itself. The SourceMemberId and TargetMemberId properties are foreign keys that reference the Member entity, allowing us to establish the relationship between the member who likes and the member who is liked.