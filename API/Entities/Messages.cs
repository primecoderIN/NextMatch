

namespace API.Entities;

public class Messages
{
    public  string Id { get; set; } = Guid.NewGuid().ToString();

    public required string Content { get; set; }

    public  DateTime? DateRead { get; set; }

    public  DateTime MessageSent { get; set; } = DateTime.UtcNow;

    public bool SenderDeleted { get; set; }

    public bool RecipientDeleted { get; set; }

    //Navigation properties
    public required string SenderId { get; set; }

    public Member Sender { get; set; } = null!;

    public required string RecipientId { get; set; }
    public Member Recipient { get; set; } = null!;

    
}


//Each user can send many messages and receive many messages, so we have a one-to-many relationship between the Member entity and the Messages entity. The SenderId and RecipientId properties are foreign keys that reference the Member entity, allowing us to establish the relationship between the sender and receiver of each message.