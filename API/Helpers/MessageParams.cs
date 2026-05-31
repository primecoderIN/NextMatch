using API.Helpers;
public class MessageParams :PaginationParams
{
    public string? MemberId { get; set; }

    public string Container { get; set; } = "Inbox";
}
