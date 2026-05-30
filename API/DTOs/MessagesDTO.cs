namespace API.DTOs;

public class MessagesDTO
{
    public required int Id { get; set; }

    public required string SenderId { get; set; }
    public required string SenderUsername { get; set; }

    public string? SenderImageUrl { get; set; }

    public required string RecipientId { get; set; }
    public required string RecipientUsername { get; set; }

    public string? RecipientImageUrl { get; set; }
    public required string Content { get; set; }
    public DateTime? DateRead { get; set; }
    public DateTime? MessageSent { get; set; }
}